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
