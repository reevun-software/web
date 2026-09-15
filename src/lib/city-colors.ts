// Each city's own official accent color, pulled directly from its icon on
// the project's own site (wiki.majestic-rp.ru / wiki.russia.online) rather
// than picked - keyed by server id since names alone aren't guaranteed
// unique across projects. GTA5RP has no equivalent branding to pull from
// (RAGE:MP's master list is plain text, no icons), so it isn't included
// here and falls back to the cycling palette.
export const OFFICIAL_CITY_COLORS: Record<string, string> = {
  // majestic
  mcl: "#CE2225",
  ru1: "#629F8E", // New York
  ru2: "#E25C40", // Detroit
  ru3: "#77BDE9", // Chicago
  ru4: "#E58139", // San Francisco
  ru5: "#FFDC61", // Atlanta
  ru6: "#4098FF", // San Diego
  ru7: "#62B754", // Los Angeles
  ru8: "#FF077E", // Miami
  ru9: "#F3C213", // Las Vegas
  ru10: "#9747FF", // Washington
  ru11: "#EF3C3C", // Dallas
  ru12: "#45CD5B", // Boston
  ru13: "#F1B129", // Houston
  ru14: "#009DBF", // Seattle
  ru15: "#E2725B", // Phoenix
  ru16: "#3C9EFF", // Denver
  ru17: "#42B326", // Portland
  ru18: "#FFDDB1", // Orlando
  ru19: "#00BFA6", // Memphis
  // russiaonline
  ro1: "#0079D2", // Арбатский
  ro2: "#48B85E", // Тверской
  ro3: "#03C1F3", // Кутузовский
};

// Fallback for anything not in the map above (GTA5RP cities, or a new
// server the source site adds before this list is updated).
export const FALLBACK_CITY_COLORS = [
  "#f97316",
  "#3b82f6",
  "#22c55e",
  "#eab308",
  "#ec4899",
  "#a855f7",
  "#06b6d4",
  "#ef4444",
  "#84cc16",
  "#14b8a6",
];
