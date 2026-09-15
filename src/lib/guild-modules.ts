import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { guildModules } from "@/lib/db/schema";
import { MODULE_KEYS, type ModuleKey } from "@/lib/modules";

// A module with no row is enabled by default - only explicit owner
// disables get written, so re-enabling is a delete (see save action in
// the Settings page) rather than tracking a third "untouched" state.
export async function getModuleStates(guildId: string): Promise<Record<ModuleKey, boolean>> {
  const rows = await db
    .select({ moduleKey: guildModules.moduleKey, enabled: guildModules.enabled })
    .from(guildModules)
    .where(eq(guildModules.guildId, guildId));

  const states = Object.fromEntries(MODULE_KEYS.map((key) => [key, true])) as Record<
    ModuleKey,
    boolean
  >;
  for (const row of rows) {
    if ((MODULE_KEYS as readonly string[]).includes(row.moduleKey)) {
      states[row.moduleKey as ModuleKey] = row.enabled;
    }
  }
  return states;
}
