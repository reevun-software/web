import { unstable_cache } from "next/cache";
import { fetchUserGuilds, filterManageable } from "@/lib/discord-guilds";
import { getBotGuilds } from "@/lib/bot-api";

// Discord's /users/@me/guilds is aggressively rate-limited, and its own
// reset window can outlast a short cache - a 60s TTL still hit it in
// practice. 5 minutes trades a bit of staleness (a newly-managed server
// takes longer to show up) for actually avoiding the 429 in normal use.
const getCachedUserGuilds = unstable_cache(
  (accessToken: string) => fetchUserGuilds(accessToken),
  ["discord-user-guilds"],
  { revalidate: 300 },
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

  // "Is the bot installed here" used to be answered by this app's own
  // guilds table - nothing ever wrote to it, so every real family showed
  // up as not-installed. The bot's own live guild list is the only thing
  // that's ever actually current.
  const botGuilds = await getBotGuilds();
  const installedIds = new Set(botGuilds.map((g) => g.id));

  return discordGuilds.map((g) => ({
    id: g.id,
    name: g.name,
    icon: g.icon,
    botInstalled: installedIds.has(g.id),
  }));
}

export async function getGuild(guildId: string) {
  const botGuilds = await getBotGuilds();
  const guild = botGuilds.find((g) => g.id === guildId);
  return guild ? { id: guild.id, name: guild.name, icon: guild.icon, ownerDiscordId: guild.ownerDiscordId } : null;
}
