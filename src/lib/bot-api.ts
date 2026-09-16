// The bot's per-guild config (leadership/rank/warn roles, log and panel
// channel ids) lives in the bot's own Postgres, not this app's - the bot
// is the source of truth for anything guild-operational, since it's the
// one actually acting on Discord. This talks to it over Railway's private
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

function botApiEnv() {
  const baseUrl = process.env.BOT_API_URL;
  const secret = process.env.BOT_API_SECRET;
  if (!baseUrl || !secret) return null;
  return { baseUrl, secret };
}

// Bot unreachable (not deployed yet, network hiccup, guild the bot isn't
// in) degrades to an empty-but-shaped config rather than throwing - this
// is a settings page, not a hard dependency, and a person disabled by a
// transient bot-side issue shouldn't lose the rest of the page.
export async function getBotGuildConfig(guildId: string): Promise<BotGuildConfig> {
  const env = botApiEnv();
  if (!env) return EMPTY_CONFIG;
  try {
    const res = await fetch(`${env.baseUrl}/api/guilds/${guildId}/config`, {
      headers: { Authorization: `Bearer ${env.secret}` },
      cache: "no-store",
    });
    if (!res.ok) return EMPTY_CONFIG;
    return (await res.json()) as BotGuildConfig;
  } catch (error) {
    console.error("bot-api: getBotGuildConfig failed", guildId, error);
    return EMPTY_CONFIG;
  }
}

export async function updateBotGuildConfig(
  guildId: string,
  patch: Partial<BotGuildConfig>,
): Promise<{ ok: boolean }> {
  const env = botApiEnv();
  if (!env) return { ok: false };
  try {
    const res = await fetch(`${env.baseUrl}/api/guilds/${guildId}/config`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${env.secret}`, "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    return { ok: res.ok };
  } catch (error) {
    console.error("bot-api: updateBotGuildConfig failed", guildId, error);
    return { ok: false };
  }
}
