"use client";

import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  ShieldAlert,
  Ticket,
  Moon,
  Settings,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ManageableGuild } from "@/lib/guilds";

export function DashboardSidebar({
  guildId,
  guildName,
  guilds,
}: {
  guildId: string;
  guildName: string;
  guilds: ManageableGuild[];
}) {
  const t = useTranslations("Dashboard");
  const pathname = usePathname();
  const base = `/dashboard/${guildId}`;

  // Groups render with a divider between them: overview, then day-to-day
  // family management, then account-level stuff pinned toward the bottom.
  const navGroups = [
    [{ label: t("nav.dashboard"), icon: LayoutDashboard, segment: "" }],
    [
      { label: t("nav.members"), icon: Users, segment: "members" },
      { label: t("nav.ranks"), icon: ShieldCheck, segment: "ranks" },
      { label: t("nav.warnings"), icon: ShieldAlert, segment: "warnings" },
      { label: t("nav.tickets"), icon: Ticket, segment: "tickets" },
      { label: t("nav.afk"), icon: Moon, segment: "afk" },
    ],
  ];
  const bottomNav = [{ label: t("nav.settings"), icon: Settings, segment: "settings" }];

  return (
    <aside className="flex min-h-dvh w-64 shrink-0 flex-col border-r border-border/60 bg-card/40">
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="w-full justify-between px-2 font-medium"
              />
            }
          >
            <span className="min-w-0 flex-1 truncate text-left">{guildName}</span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {guilds.map((g) => (
              <DropdownMenuItem
                key={g.id}
                render={<Link href={g.botInstalled ? `/dashboard/${g.id}` : "#"} />}
                disabled={!g.botInstalled}
              >
                <span className="flex-1 truncate">{g.name}</span>
                {g.id === guildId && <Check className="size-4" />}
                {!g.botInstalled && (
                  <span className="text-xs text-muted-foreground">
                    {t("noBot")}
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2">
        {navGroups.map((group, i) => (
          <div key={i} className={cn("flex flex-col gap-0.5", i > 0 && "mt-2 border-t border-border/60 pt-2")}>
            {group.map((item) => {
              const href = item.segment ? `${base}/${item.segment}` : base;
              const active = pathname === href;
              return (
                <Link
                  key={item.label}
                  href={href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                    active
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4" strokeWidth={1.5} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-0.5 border-t border-border/60 px-2 py-2">
        {bottomNav.map((item) => {
          const href = `${base}/${item.segment}`;
          const active = pathname === href;
          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <item.icon className="size-4" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
