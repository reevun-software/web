import { pgTable, text, integer, boolean, timestamp, primaryKey, serial } from "drizzle-orm/pg-core";

// A "family" = one Discord server running the bot. Every domain table below
// is scoped by guildId so the site works for many families, not just one.
export const guilds = pgTable("guilds", {
  id: text("id").primaryKey(), // Discord guild id
  name: text("name").notNull(),
  icon: text("icon"),
  ownerDiscordId: text("owner_discord_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Not guild-scoped - this is the same live GTA RP project population data
// regardless of which family's dashboard is looking at it. A snapshot is
// recorded at most once per ~15min per project (see recordOnlineSnapshot),
// piggybacking on real page views rather than a dedicated scheduled worker.
export const onlineSnapshots = pgTable("online_snapshots", {
  id: serial("id").primaryKey(),
  project: text("project").notNull(), // "majestic" | "russiaonline" | "gta5rp"
  totalPlayers: integer("total_players").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

// Per-city breakdown of the same snapshot tick above - kept as its own
// table (one row per city per tick) rather than a JSON column on
// online_snapshots, so a single city's history can be queried directly.
// History only exists from whenever this table started being written.
export const onlineCitySnapshots = pgTable("online_city_snapshots", {
  id: serial("id").primaryKey(),
  project: text("project").notNull(),
  cityId: text("city_id").notNull(),
  cityName: text("city_name").notNull(),
  players: integer("players").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

// Not guild-scoped - Reevun's own changelog/announcements, the same for
// every family. Written directly by the Reevun team for now; no in-app
// composer yet.
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
});

// One row per guild - bot-wide behavior settings (not security-specific,
// that now lives entirely in the bot's own guild_security_settings/
// automod_filter_config, see bot-api.ts). Interface language is the bot's
// own Discord-side language (embeds, replies), independent of this
// dashboard's own locale.
export const guildBotSettings = pgTable("guild_bot_settings", {
  guildId: text("guild_id")
    .primaryKey()
    .references(() => guilds.id, { onDelete: "cascade" }),
  interfaceLanguage: text("interface_language").default("ru").notNull(),
  trustedAdminRoleIds: text("trusted_admin_role_ids").array().notNull().default([]),
  // Which RP platform this family plays on (see src/lib/online-monitoring.ts
  // for the matching project keys) - null means "not linked", and the
  // Monitoring page falls back to showing all three tabs as it always has.
  project: text("project"),
  // The specific city/server within `project` (an OnlineCity.id from that
  // project's live list) - only meaningful once a project is set, and reset
  // whenever the project itself changes since a city id from one project
  // means nothing on another.
  server: text("server"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// One row per (guild, module). A module absent here is enabled by default -
// only owner-disabled modules get an explicit row, so turning a module back
// on is a delete rather than tracking a separate "never touched" state.
export const guildModules = pgTable(
  "guild_modules",
  {
    guildId: text("guild_id")
      .notNull()
      .references(() => guilds.id, { onDelete: "cascade" }),
    moduleKey: text("module_key").notNull(), // matches a MODULE_KEYS entry, see src/lib/modules.ts
    enabled: boolean("enabled").default(true).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.guildId, t.moduleKey] })],
);
