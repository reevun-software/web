import { desc, eq } from "drizzle-orm";
import { Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { guildMembers, afkSessions } from "@/lib/db/schema";
import { MembersTable } from "@/components/dashboard/members-table";

export default async function MembersPage({
  params,
}: PageProps<"/[locale]/dashboard/[guildId]/members">) {
  const { guildId } = await params;
  const t = await getTranslations("Dashboard.members");
  const [members, afk] = await Promise.all([
    db
      .select()
      .from(guildMembers)
      .where(eq(guildMembers.guildId, guildId))
      .orderBy(desc(guildMembers.joinedAt)),
    db.select().from(afkSessions).where(eq(afkSessions.guildId, guildId)),
  ]);
  const afkUserIds = new Set(afk.map((a) => a.discordUserId));

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
      <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      <MembersTable
        members={members.map((m) => ({
          discordUserId: m.discordUserId,
          username: m.username,
          rank: m.rank,
          rankLabel: t("rank", { n: m.rank }),
          warnings: m.warnings,
          isAfk: afkUserIds.has(m.discordUserId),
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
