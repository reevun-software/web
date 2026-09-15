// Owner-toggleable feature modules. Each key besides "departments" matches
// a sidebar nav segment (see src/components/dashboard/sidebar.tsx) - the
// sidebar locks that row instead of linking to it while disabled.
// "departments" has no route of its own; it just gates whether the
// Departments card on the Settings page is usable.
export const MODULE_KEYS = ["warnings", "tickets", "afk", "blacklist", "departments"] as const;
export type ModuleKey = (typeof MODULE_KEYS)[number];

export const MODULE_SEGMENTS: Partial<Record<ModuleKey, string>> = {
  warnings: "warnings",
  tickets: "tickets",
  afk: "afk",
  blacklist: "blacklist",
};
