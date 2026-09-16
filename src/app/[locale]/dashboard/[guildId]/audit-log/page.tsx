import { History } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { getBotAuditLog, getBotGuildMembers, type BotAuditLogEntry } from "@/lib/bot-api";
import { describeAuditEntry } from "@/lib/audit-log";
import { requireGuildManager } from "@/lib/guild-auth";
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
  const members = await getBotGuildMembers(guildId);
  const usernames = new Map(members.map((m) => [m.discordId, m.username]));
  const nameOf = (id: string) => usernames.get(id) ?? id;

  function toRow(entry: BotAuditLogEntry): AuditLogRow {
    return {
      id: entry.id,
      description: describeAuditEntry(t, nameOf(entry.userId), entry),
      admin: entry.administratorId ? nameOf(entry.administratorId) : t("systemActor"),
      reason: (entry.reason ?? entry.warningReason) || "—",
      date: new Date(entry.createdAt).toLocaleString(locale),
    };
  }

  // The bot API has no offset-based pagination yet - fetch enough for a
  // first page plus a bit more, and page further loadMore calls in-memory.
  // Fine at this data scale; revisit with real DB offset pagination if a
  // family's audit history grows large enough for this to matter.
  const allEntries = await getBotAuditLog(guildId, PAGE_SIZE * 4);
  const firstPage = allEntries.slice(0, PAGE_SIZE);

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
    await requireGuildManager(guildId);
    const rows = allEntries.slice(offset, offset + PAGE_SIZE);
    return { entries: rows.map(toRow), hasMore: offset + PAGE_SIZE < allEntries.length };
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <History className="size-5 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      </div>
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
