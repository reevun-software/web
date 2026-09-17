// Owner-toggleable feature modules. Each key matches a sidebar nav segment
// (see src/components/dashboard/sidebar.tsx) - the sidebar locks that row
// instead of linking to it while disabled. Departments used to be
// toggleable here too, but it's driven purely by whether any department
// exists now (0 departments = generic apply button, same as before),
// so it's no longer a manual on/off switch.
export const MODULE_KEYS = ["warnings", "tickets", "afk", "blacklist"] as const;
export type ModuleKey = (typeof MODULE_KEYS)[number];
