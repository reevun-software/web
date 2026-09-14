export type DiscordRole = {
  id: string;
  name: string;
  color: string; // "#rrggbb", "" when Discord's color is 0 (default/no color)
  position: number;
};

type RawDiscordRole = { id: string; name: string; color: number; position: number };

// Needs the bot to actually be a member of the guild - fails (empty list)
// for a guild the bot hasn't been added to yet, which callers should show
// as "couldn't load roles" rather than crashing.
export async function getGuildRoles(guildId: string): Promise<DiscordRole[]> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return [];

  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
      headers: { Authorization: `Bot ${token}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.error("discord-guild: roles fetch failed", guildId, res.status, await res.text());
      return [];
    }
    const roles = (await res.json()) as RawDiscordRole[];
    return roles
      .filter((r) => r.name !== "@everyone")
      .sort((a, b) => b.position - a.position)
      .map((r) => ({
        id: r.id,
        name: r.name,
        color: r.color === 0 ? "" : `#${r.color.toString(16).padStart(6, "0")}`,
        position: r.position,
      }));
  } catch (error) {
    console.error("discord-guild: roles fetch threw", guildId, error);
    return [];
  }
}

export type DiscordChannel = { id: string; name: string; type: number; position: number };

type RawDiscordChannel = { id: string; name: string; type: number; position: number };

// Text (0), announcement (5), voice (2) and category (4) channels only -
// the filter target/ignored pickers have no use for threads, forums, or
// stage channels, and listing every type just adds noise to the picker.
const PICKABLE_CHANNEL_TYPES = new Set([0, 2, 4, 5]);

export async function getGuildChannels(guildId: string): Promise<DiscordChannel[]> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return [];

  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      headers: { Authorization: `Bot ${token}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      console.error("discord-guild: channels fetch failed", guildId, res.status, await res.text());
      return [];
    }
    const channels = (await res.json()) as RawDiscordChannel[];
    return channels
      .filter((c) => PICKABLE_CHANNEL_TYPES.has(c.type))
      .sort((a, b) => a.position - b.position)
      .map((c) => ({ id: c.id, name: c.name, type: c.type, position: c.position }));
  } catch (error) {
    console.error("discord-guild: channels fetch threw", guildId, error);
    return [];
  }
}

let cachedBotUserId: string | null = null;

async function getBotUserId(token: string): Promise<string | null> {
  if (cachedBotUserId) return cachedBotUserId;
  const res = await fetch("https://discord.com/api/v10/users/@me", {
    headers: { Authorization: `Bot ${token}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const me = (await res.json()) as { id: string };
  cachedBotUserId = me.id;
  return me.id;
}

// The highest position among the bot's own roles in this guild - anything
// at or above it is a role the bot cannot assign, remove, or otherwise
// manage (Discord's own hierarchy rule), which the role pickers surface as
// a warning icon rather than letting someone pick an unmanageable role.
export async function getBotHighestRolePosition(guildId: string): Promise<number> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return 0;

  try {
    const botId = await getBotUserId(token);
    if (!botId) return 0;

    const res = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${botId}`, {
      headers: { Authorization: `Bot ${token}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return 0;

    const member = (await res.json()) as { roles: string[] };
    const roles = await getGuildRoles(guildId);
    const positions = roles.filter((r) => member.roles.includes(r.id)).map((r) => r.position);
    return positions.length > 0 ? Math.max(...positions) : 0;
  } catch (error) {
    console.error("discord-guild: bot role position fetch threw", guildId, error);
    return 0;
  }
}
