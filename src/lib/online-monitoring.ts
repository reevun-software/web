import { and, asc, desc, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { onlineSnapshots } from "@/lib/db/schema";

export type OnlineCity = {
  id: string;
  name: string;
  players: number;
  queued?: number;
  peak?: number;
  online?: boolean;
  countryCode?: string; // flag-icons country code, e.g. "ru", "de", "pl"
};

export type OnlineProjectData = {
  cities: OnlineCity[];
  totalPlayers: number;
  peakToday?: number;
  peakAllTime?: number;
};

export type OnlineProjectKey = "majestic" | "russiaonline" | "gta5rp";

export type OnlineHistoryPoint = { recordedAt: Date; totalPlayers: number };

type MajesticServer = {
  id: string;
  name: string;
  players: number;
  queuedPlayers: number;
  peakAllTime: number;
  status: boolean;
  country: string;
};

type MajesticOnlineResponse = {
  data?: {
    servers?: MajesticServer[];
    players?: number;
    peakToday?: number;
    peakAllTime?: number;
  };
};

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 30 },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ReevunBot/1.0)" },
    });
    if (!res.ok) {
      console.error("online-monitoring: non-OK response", url, res.status, await res.text());
      return null;
    }
    return (await res.json()) as T;
  } catch (error) {
    console.error("online-monitoring: fetch failed", url, error);
    return null;
  }
}

async function getMajesticFamilyOnline(url: string): Promise<OnlineProjectData | null> {
  const json = await fetchJson<MajesticOnlineResponse>(url);
  const data = json?.data;
  if (!data?.servers) return null;
  return {
    cities: data.servers.map((s) => ({
      id: s.id,
      name: s.name,
      players: s.players,
      queued: s.queuedPlayers,
      peak: s.peakAllTime,
      online: s.status,
      countryCode: s.country,
    })),
    totalPlayers: data.players ?? 0,
    peakToday: data.peakToday,
    peakAllTime: data.peakAllTime,
  };
}

export function getMajesticOnline() {
  return getMajesticFamilyOnline("https://wiki.majestic-rp.ru/api/online");
}

export function getRussiaOnlineOnline() {
  return getMajesticFamilyOnline("https://wiki.russia.online/api/online");
}

type RageMpServer = {
  name?: string;
  players?: number;
  peak?: number;
  lang?: string;
};

type RageMpMaster = Record<string, RageMpServer>;

// GTA5RP has no public API of its own (confirmed refused to developers on
// their forum) - this reads RAGE:MP's own public server-browser master list
// instead, the same data every RAGE:MP game client uses to list servers.
export async function getGta5rpOnline(): Promise<OnlineProjectData | null> {
  const json = await fetchJson<RageMpMaster>("https://cdn.rage.mp/master");
  if (!json) return null;
  const entries = Object.entries(json).filter(([key]) => key.includes(".gta5rp.com"));
  if (entries.length === 0) return null;

  const cities = entries.map(([key, v]) => ({
    id: key,
    // The raw server name is a long branded string like
    // "[RolePlay][Voice] GTA5RP.COM | Milton | gta5rp.com/discord [1.1]" -
    // the city name is reliably the middle "|"-delimited segment.
    name: v.name?.split("|")[1]?.trim() || key.split(".")[0],
    players: v.players ?? 0,
    peak: v.peak,
    countryCode: v.lang,
  }));

  return {
    cities,
    totalPlayers: cities.reduce((sum, c) => sum + c.players, 0),
    // RAGE:MP's master list doesn't expose a today/all-time peak, only a
    // rolling peak per server (already surfaced as each city's own `peak`).
  };
}

const SNAPSHOT_MIN_INTERVAL_MS = 15 * 60 * 1000;

// ponytail: history is seeded by whoever happens to view the monitoring page
// (at most one snapshot per project per ~15min) rather than a dedicated
// scheduled worker - simplest thing that actually accumulates real data with
// no new infrastructure. Upgrade path: a Railway cron service calling these
// same fetch functions on a fixed interval, once the page gets enough
// traffic that organic views leave gaps.
export async function recordOnlineSnapshot(project: OnlineProjectKey, totalPlayers: number) {
  const [last] = await db
    .select({ recordedAt: onlineSnapshots.recordedAt })
    .from(onlineSnapshots)
    .where(eq(onlineSnapshots.project, project))
    .orderBy(desc(onlineSnapshots.recordedAt))
    .limit(1);

  if (last && Date.now() - last.recordedAt.getTime() < SNAPSHOT_MIN_INTERVAL_MS) return;

  await db.insert(onlineSnapshots).values({ project, totalPlayers });
}

export async function getOnlineHistory(
  project: OnlineProjectKey,
  hours = 24,
): Promise<OnlineHistoryPoint[]> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const rows = await db
    .select({
      recordedAt: onlineSnapshots.recordedAt,
      totalPlayers: onlineSnapshots.totalPlayers,
    })
    .from(onlineSnapshots)
    .where(and(eq(onlineSnapshots.project, project), gte(onlineSnapshots.recordedAt, since)))
    .orderBy(asc(onlineSnapshots.recordedAt));

  return rows;
}
