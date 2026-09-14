import { desc, eq } from "drizzle-orm";
import { History } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { auditLog, guildMembers } from "@/lib/db/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AuditLogPage({
  params,
}: PageProps<"/[locale]/dashboard/[guildId]/audit-log">) {
  const { guildId } = await params;
  const [t, locale] = await Promise.all([
    getTranslations("Dashboard.auditLog"),
    getLocale(),
  ]);
  const [entries, members] = await Promise.all([
    db
      .select()
      .from(auditLog)
      .where(eq(auditLog.guildId, guildId))
      .orderBy(desc(auditLog.createdAt))
      .limit(100),
    db.select().from(guildMembers).where(eq(guildMembers.guildId, guildId)),
  ]);
  const usernames = new Map(members.map((m) => [m.discordUserId, m.username]));
  const nameOf = (id: string) => usernames.get(id) ?? id;

  if (entries.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
        <History className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-lg font-medium">{t("emptyTitle")}</h1>
        <p className="max-w-[42ch] text-sm text-muted-foreground">{t("emptyBody")}</p>
      </div>
    );
  }

  function describe(entry: (typeof entries)[number]): string {
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

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("colAction")}</TableHead>
            <TableHead>{t("colAdmin")}</TableHead>
            <TableHead>{t("colReason")}</TableHead>
            <TableHead>{t("colDate")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{describe(entry)}</TableCell>
              <TableCell className="text-muted-foreground">
                {entry.administratorDiscordId ? nameOf(entry.administratorDiscordId) : t("systemActor")}
              </TableCell>
              <TableCell className="text-muted-foreground">{entry.reason ?? "—"}</TableCell>
              <TableCell className="text-muted-foreground">
                {entry.createdAt.toLocaleString(locale)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
