// The bot's own data (config, members, warnings, ranks, tickets, afk
// sessions, bans) lives in the bot's Postgres, not this app's - the bot is
// the source of truth for anything guild-operational, since it's the one
// actually acting on Discord. This talks to it over Railway's private
// network (BOT_API_URL is http://main-bot.railway.internal:<port>, not
// publicly reachable) with a shared-secret header.

export type RankDefinition = {
  roleIds: string[];
  label: string;
  nicknamePrefix: string;
};

export type BotGuildConfig = {
  leadershipRoleIds: string[];
  rankRoleIds: Record<string, RankDefinition>;
  warnRoleIds: Record<string, string>;
  verifiedMemberRoleId: string | null;
  logChannelId: string | null;
  applicationsChannelId: string | null;
  applicationPanelChannelId: string | null;
  supportPanelChannelId: string | null;
  adminPanelChannelId: string | null;
};

const EMPTY_CONFIG: BotGuildConfig = {
  leadershipRoleIds: [],
  rankRoleIds: {},
  warnRoleIds: {},
  verifiedMemberRoleId: null,
  logChannelId: null,
  applicationsChannelId: null,
  applicationPanelChannelId: null,
  supportPanelChannelId: null,
  adminPanelChannelId: null,
};

export type BotGuildMember = {
  discordId: string;
  username: string;
  rank: number | null;
  activeWarnings: number;
  totalWarnings: number;
};

export type BotAuditLogEntry = {
  id: number;
  logType: string; // "rank" | "warn" | "ban_added" | "ban_removed"
  userId: string;
  oldRank: number | null;
  newRank: number | null;
  administratorId: string | null;
  reason: string | null;
  warnAction: string | null;
  warningReason: string | null;
  createdAt: string;
};

export type BotAfkSession = {
  userId: string;
  reason: string | null;
  startedAt: string;
  expiresAt: string;
};

export type BotTicket = {
  id: number;
  category: "application" | "support";
  ticketKey: string;
  uid: string | null;
  userId: string;
  status: string;
  requestType: string | null;
  icName: string | null;
  characterLevel: string | null;
  characterStaticId: string | null;
  captRole: string | null;
  oocAge: string | null;
  details: string | null;
  claimedBy: string | null;
  decidedBy: string | null;
  decisionReason: string | null;
  createdAt: string;
  updatedAt: string | null;
  closedAt: string | null;
};

export type BotBan = {
  id: number;
  discordUserId: string | null;
  characterName: string | null;
  reason: string;
  issuedBy: string;
  createdAt: string;
};

export type BotGuild = {
  id: string;
  name: string;
  icon: string | null;
  ownerDiscordId: string | null;
};

function botApiEnv() {
  const baseUrl = process.env.BOT_API_URL;
  const secret = process.env.BOT_API_SECRET;
  if (!baseUrl || !secret) return null;
  return { baseUrl, secret };
}

// Which guilds the bot is actually in right now, straight from its own
// live Discord.js cache - not guild-scoped, so it doesn't go through
// botApiFetch (which always prefixes /api/guilds/:id). This is what
// answers "is the bot installed here" and "who owns this guild" - the web
// app's own guilds table used to answer both, but nothing here ever wrote
// to it, so every guild but whichever one got manually seeded showed up
// as not-installed and every ownership check on it silently failed.
export async function getBotGuilds(): Promise<BotGuild[]> {
  const env = botApiEnv();
  if (!env) return [];
  try {
    const res = await fetch(`${env.baseUrl}/api/bot-guilds`, {
      headers: { Authorization: `Bearer ${env.secret}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()) as BotGuild[];
  } catch (error) {
    console.error("bot-api: getBotGuilds failed", error);
    return [];
  }
}

// Every read here degrades to an empty result rather than throwing - the
// bot being briefly unreachable (not deployed yet, network hiccup, guild it
// isn't in) shouldn't 500 a dashboard page, just show it empty.
async function botApiFetch<T>(guildId: string, path: string, fallback: T): Promise<T> {
  const env = botApiEnv();
  if (!env) return fallback;
  try {
    const res = await fetch(`${env.baseUrl}/api/guilds/${guildId}${path}`, {
      headers: { Authorization: `Bearer ${env.secret}` },
      cache: "no-store",
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch (error) {
    console.error("bot-api: fetch failed", guildId, path, error);
    return fallback;
  }
}

async function botApiWrite<T>(
  guildId: string,
  path: string,
  init: RequestInit,
): Promise<{ ok: boolean; data?: T }> {
  const env = botApiEnv();
  if (!env) return { ok: false };
  try {
    const res = await fetch(`${env.baseUrl}/api/guilds/${guildId}${path}`, {
      ...init,
      headers: { Authorization: `Bearer ${env.secret}`, "Content-Type": "application/json", ...init.headers },
    });
    if (!res.ok) return { ok: false };
    const data = res.status === 204 ? undefined : ((await res.json()) as T);
    return { ok: true, data };
  } catch (error) {
    console.error("bot-api: write failed", guildId, path, error);
    return { ok: false };
  }
}

export function getBotGuildConfig(guildId: string) {
  return botApiFetch<BotGuildConfig>(guildId, "/config", EMPTY_CONFIG);
}

export async function updateBotGuildConfig(guildId: string, patch: Partial<BotGuildConfig>) {
  const result = await botApiWrite(guildId, "/config", { method: "PUT", body: JSON.stringify(patch) });
  return { ok: result.ok };
}

export function getBotGuildMembers(guildId: string) {
  return botApiFetch<BotGuildMember[]>(guildId, "/members", []);
}

export function getBotAuditLog(guildId: string, limit = 50) {
  return botApiFetch<BotAuditLogEntry[]>(guildId, `/audit-log?limit=${limit}`, []);
}

export function getBotAfkSessions(guildId: string) {
  return botApiFetch<BotAfkSession[]>(guildId, "/afk-sessions", []);
}

export function getBotTickets(guildId: string, category?: "application" | "support") {
  return botApiFetch<BotTicket[]>(guildId, category ? `/tickets?category=${category}` : "/tickets", []);
}

export function getBotBans(guildId: string) {
  return botApiFetch<BotBan[]>(guildId, "/bans", []);
}

export async function addBotBan(
  guildId: string,
  ban: { discordUserId?: string | null; characterName?: string | null; reason: string; issuedBy: string },
) {
  const result = await botApiWrite<{ id: number }>(guildId, "/bans", { method: "POST", body: JSON.stringify(ban) });
  return result;
}

export async function removeBotBan(guildId: string, banId: number) {
  const result = await botApiWrite(guildId, `/bans/${banId}`, { method: "DELETE" });
  return { ok: result.ok };
}
