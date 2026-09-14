import { eq } from "drizzle-orm";
import { Users, Ticket as TicketIcon, ShieldAlert, Moon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { guildMembers, tickets, afkSessions } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";

export default async function DashboardOverviewPage({
  params,
}: PageProps<"/[locale]/dashboard/[guildId]">) {
  const { guildId } = await params;
  const t = await getTranslations("Dashboard.overview");

  // ponytail: full-table scan aggregation - fine at RP-family scale, switch
  // to SQL count()/sum() if a guild's member/ticket count grows large.
  const [members, allTickets, afk] = await Promise.all([
    db.select().from(guildMembers).where(eq(guildMembers.guildId, guildId)),
    db.select().from(tickets).where(eq(tickets.guildId, guildId)),
    db.select().from(afkSessions).where(eq(afkSessions.guildId, guildId)),
  ]);

  const totalWarnings = members.reduce((sum, m) => sum + m.warnings, 0);
  const openTickets = allTickets.filter((row) => row.status === "open").length;

  const stats = [
    { label: t("members"), value: members.length, icon: Users },
    { label: t("openTickets"), value: openTickets, icon: TicketIcon },
    { label: t("warnings"), value: totalWarnings, icon: ShieldAlert },
    { label: t("afk"), value: afk.length, icon: Moon },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="flex flex-col gap-2 p-5">
            <div className="flex items-center gap-2 text-muted-foreground">
              <s.icon className="size-4" strokeWidth={1.5} />
              <span className="text-xs">{s.label}</span>
            </div>
            <span className="text-2xl font-semibold tracking-tight">{s.value}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
