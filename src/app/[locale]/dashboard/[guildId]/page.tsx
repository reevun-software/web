import { eq } from "drizzle-orm";
import { Users, Ticket as TicketIcon, ShieldAlert, Moon } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { guildMembers, tickets, afkSessions } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default async function DashboardOverviewPage({
  params,
}: PageProps<"/[locale]/dashboard/[guildId]">) {
  const { guildId } = await params;
  const [t, locale] = await Promise.all([
    getTranslations("Dashboard.overview"),
    getLocale(),
  ]);

  // ponytail: full-table scan aggregation - fine at RP-family scale, switch
  // to SQL count()/sum() if a guild's member/ticket count grows large.
  const [members, allTickets, afk] = await Promise.all([
    db.select().from(guildMembers).where(eq(guildMembers.guildId, guildId)),
    db.select().from(tickets).where(eq(tickets.guildId, guildId)),
    db.select().from(afkSessions).where(eq(afkSessions.guildId, guildId)),
  ]);

  const totalWarnings = members.reduce((sum, m) => sum + m.warnings, 0);
  const openTickets = allTickets.filter((row) => row.status === "open").length;
  const recentTickets = [...allTickets]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
  const topWarned = members
    .filter((m) => m.warnings > 0)
    .sort((a, b) => b.warnings - a.warnings)
    .slice(0, 5);

  const stats = [
    { label: t("members"), value: members.length, icon: Users },
    { label: t("openTickets"), value: openTickets, icon: TicketIcon },
    { label: t("warnings"), value: totalWarnings, icon: ShieldAlert },
    { label: t("afk"), value: afk.length, icon: Moon },
  ];

  return (
    <div className="flex flex-col gap-6">
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">{t("recentTickets")}</h2>
          {recentTickets.length === 0 ? (
            <Card className="p-5 text-sm text-muted-foreground">{t("noTickets")}</Card>
          ) : (
            <Card className="flex flex-col divide-y divide-border/60 p-0">
              {recentTickets.map((row) => (
                <div key={row.id} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm">{row.type}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">
                      {row.createdAt.toLocaleDateString(locale)}
                    </span>
                    <Badge variant={row.status === "open" ? "default" : "secondary"}>
                      {row.status === "open" ? t("ticketOpen") : t("ticketClosed")}
                    </Badge>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">{t("topWarned")}</h2>
          {topWarned.length === 0 ? (
            <Card className="p-5 text-sm text-muted-foreground">{t("noWarnings")}</Card>
          ) : (
            <Card className="flex flex-col divide-y divide-border/60 p-0">
              {topWarned.map((m) => (
                <div key={m.discordUserId} className="flex items-center justify-between px-5 py-3">
                  <span className="flex items-center gap-2.5 text-sm">
                    <Avatar className="size-6">
                      <AvatarFallback className="text-xs">{m.username[0]}</AvatarFallback>
                    </Avatar>
                    {m.username}
                  </span>
                  <Badge variant="destructive">{m.warnings}</Badge>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
