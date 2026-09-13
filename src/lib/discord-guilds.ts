const MANAGE_GUILD = 0x20;
const ADMINISTRATOR = 0x8;

export type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  permissions: string;
};

/** Discord sends permissions as a stringified bitfield (can exceed 32 bits). */
export function canManageGuild(permissions: string): boolean {
  const bits = BigInt(permissions);
  return (bits & BigInt(MANAGE_GUILD)) !== 0n || (bits & BigInt(ADMINISTRATOR)) !== 0n;
}

export function filterManageable(guilds: DiscordGuild[]): DiscordGuild[] {
  return guilds.filter((g) => canManageGuild(g.permissions));
}

export async function fetchUserGuilds(accessToken: string): Promise<DiscordGuild[]> {
  const res = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Discord guilds fetch failed: ${res.status}`);
  return res.json();
}
