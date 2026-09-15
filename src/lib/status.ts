// incident.io status page's public Widget API - unauthenticated, returns a
// summary of ongoing incidents. Same custom domain as the old Uptime Kuma
// page (status.reevun.app), so nothing in status-pill.tsx needs to change,
// only how this data gets fetched and shaped.
const STATUS_WIDGET_URL = "https://status.reevun.app/api/v1/summary";

type WidgetSummary = {
  page_title: string;
  page_url: string;
  ongoing_incidents: { id: string; name: string; status: string; url: string }[];
};

export type ServiceStatus =
  | { variant: "operational" }
  | { variant: "issue"; incidentTitle?: string }
  | { variant: "unavailable" };

export async function getServiceStatus(): Promise<ServiceStatus> {
  try {
    const res = await fetch(STATUS_WIDGET_URL, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("status page unreachable");

    const summary: WidgetSummary = await res.json();
    if (summary.ongoing_incidents.length > 0) {
      return { variant: "issue", incidentTitle: summary.ongoing_incidents[0].name };
    }
    return { variant: "operational" };
  } catch {
    return { variant: "unavailable" };
  }
}
