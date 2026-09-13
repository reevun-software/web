import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { guilds } from "@/lib/db/schema";
import { fetchUserGuilds, filterManageable } from "@/lib/discord-guilds";

export type ManageableGuild = {
  id: string;
  name: string;
  icon: string | null;
  botInstalled: boolean;
};

/**
 * Guilds the signed-in user can manage on Discord, marked with whether the
 * bot is actually registered for them yet (multi-tenant: most Discord
 * guilds a user manages will not be a Reevun family).
 */
export async function getManageableGuilds(
  accessToken: string,
): Promise<ManageableGuild[]> {
  const discordGuilds = filterManageable(await fetchUserGuilds(accessToken));
  if (discordGuilds.length === 0) return [];

  const ids = discordGuilds.map((g) => g.id);
  const installed = await db
    .select({ id: guilds.id })
    .from(guilds)
    .where(inArray(guilds.id, ids));
  const installedIds = new Set(installed.map((g) => g.id));

  return discordGuilds.map((g) => ({
    id: g.id,
    name: g.name,
    icon: g.icon,
    botInstalled: installedIds.has(g.id),
  }));
}

export async function getGuild(guildId: string) {
  const [guild] = await db
    .select()
    .from(guilds)
    .where(eq(guilds.id, guildId))
    .limit(1);
  return guild ?? null;
}
