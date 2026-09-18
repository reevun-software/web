import { History } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getBotAuditLog, getBotGuildMembers } from "@/lib/bot-api";
import { requireGuildManager } from "@/lib/guild-auth";
import { AuditLogTable } from "@/components/dashboard/audit-log-table";

const PAGE_SIZE = 50;

export default async function AuditLogPage({
  params,
}: PageProps<"/[locale]/dashboard/[guildId]/audit-log">) {
  const { guildId } = await params;
  const t = await getTranslations("Dashboard.auditLog");
  const members = await getBotGuildMembers(guildId);
  const usernames = Object.fromEntries(members.map((m) => [m.discordId, m.username]));

  const firstPage = await getBotAuditLog(guildId, PAGE_SIZE);

  if (firstPage.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
        <History className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-lg font-medium">{t("emptyTitle")}</h1>
        <p className="max-w-[42ch] text-sm text-muted-foreground">{t("emptyBody")}</p>
      </div>
    );
  }

  // Stays free of any closure over a plain function (t, a translator built
  // from getTranslations, a nameOf lookup, etc.) - a "use server" action's
  // bound closure values must be plain data, and Next.js rejects a
  // captured function with "Functions cannot be passed directly to Client
  // Components". Only guildId (a string) gets captured here; entries come
  // back raw and get formatted client side instead (see AuditLogTable).
  async function loadMore(offset: number) {
    "use server";
    await requireGuildManager(guildId);
    const nextLimit = offset + PAGE_SIZE;
    const entries = await getBotAuditLog(guildId, nextLimit);
    const rows = entries.slice(offset, nextLimit);
    return { entries: rows, hasMore: entries.length === nextLimit };
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <History className="size-5 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      </div>
      <AuditLogTable
        initialEntries={firstPage}
        initialHasMore={firstPage.length === PAGE_SIZE}
        loadMore={loadMore}
        usernames={usernames}
        labels={{
          colAction: t("colAction"),
          colAdmin: t("colAdmin"),
          colReason: t("colReason"),
          colDate: t("colDate"),
          searchPlaceholder: t("searchPlaceholder"),
          loadMore: t("loadMore"),
          systemActor: t("systemActor"),
        }}
      />
    </div>
  );
}
