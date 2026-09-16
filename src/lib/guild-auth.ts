import { auth } from "@/lib/auth";
import { getManageableGuilds, getGuild } from "@/lib/guilds";

// Server actions are closures captured at page-render time and never
// re-run on their own - a check computed once (isOwner, "session manages
// this guild") stays frozen in that closure even after real access
// changes (kicked, permission revoked, ownership transferred). Every
// mutating or otherwise sensitive action must call one of these itself
// instead of trusting a render-time boolean.

export async function requireGuildManager(guildId: string): Promise<void> {
  const session = await auth();
  if (!session?.accessToken) throw new Error("Unauthorized");
  const managed = await getManageableGuilds(session.accessToken);
  if (!managed.some((g) => g.id === guildId && g.botInstalled)) {
    throw new Error("Unauthorized");
  }
}

export async function isGuildOwner(guildId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.discordId) return false;
  const guild = await getGuild(guildId);
  return !!guild && guild.ownerDiscordId === session.discordId;
}
