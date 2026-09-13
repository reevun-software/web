import { eq, inArray } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { guilds } from "@/lib/db/schema";
import { fetchUserGuilds, filterManageable } from "@/lib/discord-guilds";

// Discord's /users/@me/guilds is aggressively rate-limited; the dashboard
// hits this on every nav click (layout + page both need it), so cache it
// per access token for a minute instead of calling Discord on each request.
const getCachedUserGuilds = unstable_cache(
  (accessToken: string) => fetchUserGuilds(accessToken),
  ["discord-user-guilds"],
  { revalidate: 60 },
);

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
  let rawGuilds;
  try {
    rawGuilds = await getCachedUserGuilds(accessToken);
  } catch (error) {
    // Discord's rate limit on this endpoint is real and not fully under our
    // control even with the 60s cache above (its own reset window can run
    // longer than that). Degrade to "no guilds visible right now" instead of
    // crashing the whole page - a transient 429 shouldn't 500 the dashboard.
    console.error("getManageableGuilds: Discord guilds fetch failed", error);
    return [];
  }

  const discordGuilds = filterManageable(rawGuilds);
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
