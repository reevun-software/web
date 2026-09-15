import { desc, eq } from "drizzle-orm";
import { Users, Ticket as TicketIcon, ShieldAlert, Moon, UserX, LayoutDashboard, Lock } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { guildMembers, tickets, afkSessions, bans, auditLog } from "@/lib/db/schema";
import { describeAuditEntry } from "@/lib/audit-log";
import { getModuleStates } from "@/lib/guild-modules";
import type { ModuleKey } from "@/lib/modules";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "@/i18n/navigation";

export default async function DashboardOverviewPage({
  params,
}: PageProps<"/[locale]/dashboard/[guildId]">) {
  const { guildId } = await params;
  const [t, tDash, tAuditLog, locale, moduleStates] = await Promise.all([
    getTranslations("Dashboard.overview"),
    getTranslations("Dashboard"),
    getTranslations("Dashboard.auditLog"),
    getLocale(),
    getModuleStates(guildId),
  ]);

  // ponytail: full-table scan aggregation - fine at RP-family scale, switch
  // to SQL count()/sum() if a guild's member/ticket count grows large.
  const [members, allTickets, afk, blacklisted, recentActivity] = await Promise.all([
    db.select().from(guildMembers).where(eq(guildMembers.guildId, guildId)),
    db.select().from(tickets).where(eq(tickets.guildId, guildId)),
    db.select().from(afkSessions).where(eq(afkSessions.guildId, guildId)),
    db.select().from(bans).where(eq(bans.guildId, guildId)),
    db
      .select()
      .from(auditLog)
      .where(eq(auditLog.guildId, guildId))
      .orderBy(desc(auditLog.createdAt))
      .limit(5),
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

  const stats: {
    label: string;
    value: number;
    icon: typeof Users;
    href: string;
    moduleKey?: ModuleKey;
  }[] = [
    { label: t("members"), value: members.length, icon: Users, href: `/dashboard/${guildId}/members` },
    {
      label: t("openTickets"),
      value: openTickets,
      icon: TicketIcon,
      href: `/dashboard/${guildId}/tickets`,
      moduleKey: "tickets",
    },
    {
      label: t("warnings"),
      value: totalWarnings,
      icon: ShieldAlert,
      href: `/dashboard/${guildId}/warnings`,
      moduleKey: "warnings",
    },
    {
      label: t("afk"),
      value: afk.length,
      icon: Moon,
      href: `/dashboard/${guildId}/afk`,
      moduleKey: "afk",
    },
    {
      label: t("blacklist"),
      value: blacklisted.length,
      icon: UserX,
      href: `/dashboard/${guildId}/blacklist`,
      moduleKey: "blacklist",
    },
  ];

  const usernames = new Map(members.map((m) => [m.discordUserId, m.username]));
  const nameOf = (id: string) => usernames.get(id) ?? id;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <LayoutDashboard className="size-5 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((s) => {
          const disabled = s.moduleKey ? moduleStates[s.moduleKey] === false : false;
          const content = (
            <Card
              className={cn(
                "relative flex flex-col gap-2 overflow-hidden p-5 transition-colors",
                !disabled && "hover:bg-accent/40",
              )}
            >
              <div
                aria-hidden={disabled || undefined}
                className={cn("flex flex-col gap-2", disabled && "pointer-events-none blur-sm")}
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <s.icon className="size-4" strokeWidth={1.5} />
                  <span className="text-xs">{s.label}</span>
                </div>
                <span className="text-2xl font-semibold tracking-tight">{s.value}</span>
              </div>
              {disabled && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-card/60 px-2 text-center">
                  <Lock className="size-4 text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-xs text-muted-foreground">{tDash("moduleDisabledTitle")}</span>
                </div>
              )}
            </Card>
          );
          return disabled ? (
            <div key={s.label}>{content}</div>
          ) : (
            <Link key={s.label} href={s.href} className="block">
              {content}
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
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

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">{t("recentActivity")}</h2>
          {recentActivity.length === 0 ? (
            <Card className="p-5 text-sm text-muted-foreground">{t("noActivity")}</Card>
          ) : (
            <Card className="flex flex-col divide-y divide-border/60 p-0">
              {recentActivity.map((entry) => (
                <div key={entry.id} className="flex flex-col gap-1 px-5 py-3">
                  <span className="text-sm">
                    {describeAuditEntry(tAuditLog, nameOf(entry.discordUserId), entry)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {entry.createdAt.toLocaleString(locale)}
                  </span>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
