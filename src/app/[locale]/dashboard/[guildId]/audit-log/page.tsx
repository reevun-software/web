import { desc, eq } from "drizzle-orm";
import { History } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { auditLog, guildMembers } from "@/lib/db/schema";
import { AuditLogTable, type AuditLogRow } from "@/components/dashboard/audit-log-table";

const PAGE_SIZE = 50;

export default async function AuditLogPage({
  params,
}: PageProps<"/[locale]/dashboard/[guildId]/audit-log">) {
  const { guildId } = await params;
  const [t, locale] = await Promise.all([
    getTranslations("Dashboard.auditLog"),
    getLocale(),
  ]);
  const members = await db.select().from(guildMembers).where(eq(guildMembers.guildId, guildId));
  const usernames = new Map(members.map((m) => [m.discordUserId, m.username]));
  const nameOf = (id: string) => usernames.get(id) ?? id;

  function describe(entry: { logType: string; discordUserId: string; oldRank: number | null; newRank: number | null }): string {
    const target = nameOf(entry.discordUserId);
    switch (entry.logType) {
      case "rank_change":
        return t("rankChange", { target, oldRank: entry.oldRank ?? 0, newRank: entry.newRank ?? 0 });
      case "warn_issued":
        return t("warnIssued", { target });
      case "warn_removed":
        return t("warnRemoved", { target });
      case "ban_added":
        return t("banAdded", { target });
      case "ban_removed":
        return t("banRemoved", { target });
      default:
        return t("generic", { target, type: entry.logType });
    }
  }

  function toRow(entry: {
    id: number;
    logType: string;
    discordUserId: string;
    oldRank: number | null;
    newRank: number | null;
    administratorDiscordId: string | null;
    reason: string | null;
    createdAt: Date;
  }): AuditLogRow {
    return {
      id: entry.id,
      description: describe(entry),
      admin: entry.administratorDiscordId ? nameOf(entry.administratorDiscordId) : t("systemActor"),
      reason: entry.reason ?? "—",
      date: entry.createdAt.toLocaleString(locale),
    };
  }

  const firstPage = await db
    .select()
    .from(auditLog)
    .where(eq(auditLog.guildId, guildId))
    .orderBy(desc(auditLog.createdAt))
    .limit(PAGE_SIZE);

  if (firstPage.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
        <History className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-lg font-medium">{t("emptyTitle")}</h1>
        <p className="max-w-[42ch] text-sm text-muted-foreground">{t("emptyBody")}</p>
      </div>
    );
  }

  async function loadMore(offset: number) {
    "use server";
    const rows = await db
      .select()
      .from(auditLog)
      .where(eq(auditLog.guildId, guildId))
      .orderBy(desc(auditLog.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset);
    return { entries: rows.map(toRow), hasMore: rows.length === PAGE_SIZE };
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      <AuditLogTable
        initialEntries={firstPage.map(toRow)}
        initialHasMore={firstPage.length === PAGE_SIZE}
        loadMore={loadMore}
        labels={{
          colAction: t("colAction"),
          colAdmin: t("colAdmin"),
          colReason: t("colReason"),
          colDate: t("colDate"),
          searchPlaceholder: t("searchPlaceholder"),
          loadMore: t("loadMore"),
        }}
      />
    </div>
  );
}
