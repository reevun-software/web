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

// One row per guild. Discord role/channel IDs are stored as plain text the
// owner pastes in (Developer Mode -> Copy ID) rather than picked from a live
// role list - fetching a guild's roles needs the bot's own token, which the
// site doesn't have yet (only the signed-in user's OAuth token).
export const guildSecuritySettings = pgTable("guild_security_settings", {
  guildId: text("guild_id")
    .primaryKey()
    .references(() => guilds.id, { onDelete: "cascade" }),
  moderatorRoleIds: text("moderator_role_ids").array().notNull().default([]),
  filterLinks: boolean("filter_links").default(false).notNull(),
  filterInvites: boolean("filter_invites").default(true).notNull(),
  filterScamLinks: boolean("filter_scam_links").default(true).notNull(),
  filterBadWords: boolean("filter_bad_words").default(false).notNull(),
  filterCapsLock: boolean("filter_caps_lock").default(false).notNull(),
  filterMentionSpam: boolean("filter_mention_spam").default(false).notNull(),
  muteMode: text("mute_mode").default("timeout").notNull(), // "role" | "timeout" | "both"
  muteRoleId: text("mute_role_id"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
