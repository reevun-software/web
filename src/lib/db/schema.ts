import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";

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
    isAfk: boolean("is_afk").default(false).notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.guildId, t.discordUserId] })],
);

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
