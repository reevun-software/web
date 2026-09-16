import { Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getBotGuildMembers, getBotAfkSessions } from "@/lib/bot-api";
import { MembersTable } from "@/components/dashboard/members-table";

export default async function MembersPage({
  params,
}: PageProps<"/[locale]/dashboard/[guildId]/members">) {
  const { guildId } = await params;
  const t = await getTranslations("Dashboard.members");
  const [members, afk] = await Promise.all([
    getBotGuildMembers(guildId),
    getBotAfkSessions(guildId),
  ]);
  const afkUserIds = new Set(afk.map((a) => a.userId));

  if (members.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
        <Users className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-lg font-medium">{t("emptyTitle")}</h1>
        <p className="max-w-[42ch] text-sm text-muted-foreground">
          {t("emptyBody")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Users className="size-5 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      </div>
      <MembersTable
        members={members.map((m) => ({
          discordUserId: m.discordId,
          username: m.username,
          rank: m.rank ?? 0,
          rankLabel: m.rank ? t("rank", { n: m.rank }) : t("noRank"),
          warnings: m.activeWarnings,
          isAfk: afkUserIds.has(m.discordId),
        }))}
        labels={{
          colMember: t("colMember"),
          colRank: t("colRank"),
          colWarnings: t("colWarnings"),
          colStatus: t("colStatus"),
          searchPlaceholder: t("searchPlaceholder"),
          online: t("online"),
          afk: t("afk"),
        }}
      />
    </div>
  );
}
