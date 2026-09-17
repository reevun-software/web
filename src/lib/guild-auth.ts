import { auth } from "@/lib/auth";
import { getManageableGuilds } from "@/lib/guilds";

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

// Despite the name, this checks "manages this specific guild", not the
// literal Discord owner account - kept as a separate boolean (rather than
// switching every call site to requireGuildManager's throw) since callers
// use it as an inline condition. It used to skip the guildId check
// entirely (return true for any signed-in user), which let anyone manage
// a guild they don't have access to - see requireGuildManager's own
// comment on why every mutating action must check this itself.
export async function isGuildOwner(guildId: string): Promise<boolean> {
  const session = await auth();
  if (!session?.accessToken) return false;
  const managed = await getManageableGuilds(session.accessToken);
  return managed.some((g) => g.id === guildId && g.botInstalled);
}
