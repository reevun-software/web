import { pgTable, text, integer, timestamp, primaryKey, serial } from "drizzle-orm/pg-core";

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
