// Uptime Kuma's status page slug - set from the dashboard, so it can change
// whenever someone renames the page there (it already has once: "main" ->
// "app"). If this starts 404ing again, check what /api/status-page/<slug>
// the site now redirects to at https://status.reevun.app.
const STATUS_PAGE_SLUG = "app";
const STATUS_PAGE_BASE = "https://status.reevun.app";

// https://uptime.kuma.pet - the public status-page JSON API this hits.
// Heartbeat status codes: 0 = down, 1 = up, 2 = pending, 3 = maintenance.
type Heartbeat = { status: 0 | 1 | 2 | 3 };
type Monitor = { id: number };
type StatusPageResponse = {
  incidents: { title: string; style: string }[];
  publicGroupList: { monitorList: Monitor[] }[];
};
type HeartbeatResponse = { heartbeatList: Record<string, Heartbeat[]> };

export type ServiceStatus =
  | { variant: "operational" }
  | { variant: "issue"; incidentTitle?: string }
  | { variant: "unavailable" };

export async function getServiceStatus(): Promise<ServiceStatus> {
  try {
    const [pageRes, heartbeatRes] = await Promise.all([
      fetch(`${STATUS_PAGE_BASE}/api/status-page/${STATUS_PAGE_SLUG}`, {
        next: { revalidate: 60 },
      }),
      fetch(
        `${STATUS_PAGE_BASE}/api/status-page/heartbeat/${STATUS_PAGE_SLUG}`,
        { next: { revalidate: 60 } },
      ),
    ]);
    if (!pageRes.ok || !heartbeatRes.ok) throw new Error("status page unreachable");

    const page: StatusPageResponse = await pageRes.json();
    const heartbeats: HeartbeatResponse = await heartbeatRes.json();

    const monitorIds = page.publicGroupList.flatMap((g) =>
      g.monitorList.map((m) => m.id),
    );
    const anyDown = monitorIds.some((id) => {
      const list = heartbeats.heartbeatList[String(id)];
      const last = list?.at(-1);
      return last?.status === 0;
    });

    if (anyDown) return { variant: "issue" };
    if (page.incidents.length > 0)
      return { variant: "issue", incidentTitle: page.incidents[0].title };
    return { variant: "operational" };
  } catch {
    return { variant: "unavailable" };
  }
}
