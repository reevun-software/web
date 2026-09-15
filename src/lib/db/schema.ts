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

export const guildMembers = pgTable(
  "guild_members",
  {
    guildId: text("guild_id")
      .notNull()
      .references(() => guilds.id, { onDelete: "cascade" }),
    discordUserId: text("discord_user_id").notNull(),
    username: text("username").notNull(),
    avatar: text("avatar"),
    rank: integer("rank").default(1).notNull(),
    warnings: integer("warnings").default(0).notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.guildId, t.discordUserId] })],
);

// A member is AFK exactly while a row exists here for them - the bot deletes
// the row (or lets it stand past expiresAt) when they're back, rather than
// the site tracking AFK as a stale boolean flag on guild_members.
export const afkSessions = pgTable(
  "afk_sessions",
  {
    guildId: text("guild_id")
      .notNull()
      .references(() => guilds.id, { onDelete: "cascade" }),
    discordUserId: text("discord_user_id").notNull(),
    reason: text("reason"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
  },
  (t) => [primaryKey({ columns: [t.guildId, t.discordUserId] })],
);

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

export const tickets = pgTable("tickets", {
  id: text("id").primaryKey(), // "<type>-<10 digits>", set by the bot
  guildId: text("guild_id")
    .notNull()
    .references(() => guilds.id, { onDelete: "cascade" }),
  discordUserId: text("discord_user_id").notNull(),
  type: text("type").notNull(),
  status: text("status").default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  closedAt: timestamp("closed_at"),
});

export const bans = pgTable("bans", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id")
    .notNull()
    .references(() => guilds.id, { onDelete: "cascade" }),
  discordUserId: text("discord_user_id"), // nullable - a ban can target just an in-game name
  characterName: text("character_name"),
  reason: text("reason").notNull(),
  issuedBy: text("issued_by").notNull(), // Discord id of the staff member who banned
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Mirrors the shape main-bot already uses for its own user_logs table (rank
// changes + warning issue/removal, who did it and why) - guild-scoped here
// since the bot's version predates multi-tenancy.
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id")
    .notNull()
    .references(() => guilds.id, { onDelete: "cascade" }),
  logType: text("log_type").notNull(), // "rank_change" | "warn_issued" | "warn_removed" | "ban_added" | "ban_removed"
  discordUserId: text("discord_user_id").notNull(),
  administratorDiscordId: text("administrator_discord_id"),
  oldRank: integer("old_rank"),
  newRank: integer("new_rank"),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

// One row per guild. Role/channel fields hold live Discord IDs picked from
// the bot's own role/channel list (see src/lib/discord-guild.ts), not
// hand-pasted.
export const guildSecuritySettings = pgTable("guild_security_settings", {
  guildId: text("guild_id")
    .primaryKey()
    .references(() => guilds.id, { onDelete: "cascade" }),
  moderatorRoleIds: text("moderator_role_ids").array().notNull().default([]),
  ignoreCommandCooldownForMods: boolean("ignore_command_cooldown_for_mods").default(false).notNull(),
  allowHigherModsToModerateLower: boolean("allow_higher_mods_to_moderate_lower")
    .default(false)
    .notNull(),
  filterLinks: boolean("filter_links").default(false).notNull(),
  filterInvites: boolean("filter_invites").default(true).notNull(),
  filterScamLinks: boolean("filter_scam_links").default(true).notNull(),
  filterBadWords: boolean("filter_bad_words").default(false).notNull(),
  filterCapsLock: boolean("filter_caps_lock").default(false).notNull(),
  filterMentionSpam: boolean("filter_mention_spam").default(false).notNull(),
  muteMode: text("mute_mode").default("timeout").notNull(), // "role" | "timeout" | "both"
  muteRoleId: text("mute_role_id"),
  muteBlocksReactions: boolean("mute_blocks_reactions").default(false).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// One row per guild - bot-wide behavior settings (not security-specific,
// see guild_security_settings for that). Interface language is the bot's
// own Discord-side language (embeds, replies), independent of this
// dashboard's own locale.
export const guildBotSettings = pgTable("guild_bot_settings", {
  guildId: text("guild_id")
    .primaryKey()
    .references(() => guilds.id, { onDelete: "cascade" }),
  interfaceLanguage: text("interface_language").default("ru").notNull(),
  systemMessageColor: text("system_message_color").default("#79040C").notNull(),
  enableSlashCommands: boolean("enable_slash_commands").default(true).notNull(),
  enableTextCommands: boolean("enable_text_commands").default(true).notNull(),
  trustedAdminRoleIds: text("trusted_admin_role_ids").array().notNull().default([]),
  defaultRoleIds: text("default_role_ids").array().notNull().default([]),
  alwaysAssignDefaultRoles: boolean("always_assign_default_roles").default(false).notNull(),
  restoreNicknameOnRejoin: boolean("restore_nickname_on_rejoin").default(false).notNull(),
  restoreOldRolesOnRejoin: boolean("restore_old_roles_on_rejoin").default(false).notNull(),
  restorableRoleIds: text("restorable_role_ids").array().notNull().default([]),
  exemptRoleIds: text("exempt_role_ids").array().notNull().default([]),
  // Which RP platform this family plays on (see src/lib/online-monitoring.ts
  // for the matching project keys) - null means "not linked", and the
  // Monitoring page falls back to showing all three tabs as it always has.
  project: text("project"),
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

// Only meaningful once the "departments" module itself is enabled - with it
// off, every member is treated as belonging to one implicit general
// department instead of any row here.
export const guildDepartments = pgTable("guild_departments", {
  id: serial("id").primaryKey(),
  guildId: text("guild_id")
    .notNull()
    .references(() => guilds.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  memberDiscordIds: text("member_discord_ids").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Per-filter advanced settings, opened via the gear icon next to each
// automod toggle above. Kept separate from guild_security_settings rather
// than adding a dozen more columns there - one row per (guild, filter type)
// that only exists once someone actually opens and saves that filter's
// settings; a filter with no row here just runs with defaults.
export const automodFilterConfig = pgTable(
  "automod_filter_config",
  {
    guildId: text("guild_id")
      .notNull()
      .references(() => guilds.id, { onDelete: "cascade" }),
    filterType: text("filter_type").notNull(), // matches an AUTOMOD_FILTERS key, e.g. "filterLinks"
    deleteMessage: boolean("delete_message").default(true).notNull(),
    punishment: text("punishment").default("none").notNull(), // "none" | "warn" | "mute" | "kick" | "ban"
    strategy: text("strategy").default("blocklist").notNull(), // "blocklist" | "allowlist"
    list: text("list").array().notNull().default([]), // domains/words, only meaningful for list-based filters
    notifyUser: boolean("notify_user").default(false).notNull(),
    ignoreAdminsAndMods: boolean("ignore_admins_and_mods").default(false).notNull(),
    ignoreSlashCommands: boolean("ignore_slash_commands").default(false).notNull(),
    targetRoleIds: text("target_role_ids").array().notNull().default([]),
    ignoredRoleIds: text("ignored_role_ids").array().notNull().default([]),
    targetChannelIds: text("target_channel_ids").array().notNull().default([]),
    ignoredChannelIds: text("ignored_channel_ids").array().notNull().default([]),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.guildId, t.filterType] })],
);
