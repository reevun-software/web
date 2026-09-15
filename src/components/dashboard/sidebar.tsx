"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Activity,
  Newspaper,
  Users,
  ShieldCheck,
  ShieldAlert,
  Ticket,
  Moon,
  Ban,
  Lock,
  Settings,
  History,
  ChevronsUpDown,
  Check,
  Menu,
  type LucideIcon,
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
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ManageableGuild } from "@/lib/guilds";
import type { ModuleKey } from "@/lib/modules";

type NavItem = { label: string; icon: LucideIcon; segment: string; moduleKey?: ModuleKey };

// Shared between the permanent desktop rail and the mobile Sheet - only the
// outer chrome differs, so the nav itself (and its active-state logic)
// isn't duplicated between the two render paths. Declared at module scope,
// not nested inside DashboardSidebar, so React doesn't treat it as a new
// component on every render (which would reset the Sheet's own state).
function SidebarNavContent({
  guildId,
  guildName,
  guilds,
  noBotLabel,
  navGroups,
  bottomNav,
  moduleStates,
  moduleLockedLabel,
  onNavigate,
}: {
  guildId: string;
  guildName: string;
  guilds: ManageableGuild[];
  noBotLabel: string;
  navGroups: NavItem[][];
  bottomNav: NavItem[];
  moduleStates: Record<ModuleKey, boolean>;
  moduleLockedLabel: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const base = `/dashboard/${guildId}`;

  function renderNavItem(item: NavItem) {
    const href = item.segment ? `${base}/${item.segment}` : base;
    const active = pathname === href;
    const locked = item.moduleKey ? moduleStates[item.moduleKey] === false : false;

    if (locked) {
      return (
        <Tooltip key={item.label}>
          <TooltipTrigger
            render={
              <span className="flex cursor-not-allowed items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground/50" />
            }
          >
            <item.icon className="size-4" strokeWidth={1.5} />
            <span className="flex-1">{item.label}</span>
            <Lock className="size-3.5 shrink-0" strokeWidth={1.5} />
          </TooltipTrigger>
          <TooltipContent>{moduleLockedLabel}</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Link
        key={item.label}
        href={href}
        onClick={onNavigate}
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
  }

  return (
    <>
      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" className="w-full justify-between px-2 font-medium" />}
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
                onClick={onNavigate}
              >
                <span className="flex-1 truncate">{g.name}</span>
                {g.id === guildId && <Check className="size-4" />}
                {!g.botInstalled && <span className="text-xs text-muted-foreground">{noBotLabel}</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 px-2">
        {navGroups.map((group, i) => (
          <div key={i} className={cn("flex flex-col gap-0.5", i > 0 && "mt-2 border-t border-border/60 pt-2")}>
            {group.map(renderNavItem)}
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-0.5 border-t border-border/60 px-2 py-2">
        {bottomNav.map(renderNavItem)}
      </div>
    </>
  );
}

export function DashboardSidebar({
  guildId,
  guildName,
  guilds,
  moduleStates,
  accountMenu,
}: {
  guildId: string;
  guildName: string;
  guilds: ManageableGuild[];
  moduleStates: Record<ModuleKey, boolean>;
  accountMenu?: React.ReactNode;
}) {
  const t = useTranslations("Dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Groups render with a divider between them: overview, then day-to-day
  // family management, then account-level stuff pinned toward the bottom.
  const navGroups: NavItem[][] = [
    [
      { label: t("nav.dashboard"), icon: LayoutDashboard, segment: "" },
      { label: t("nav.monitoring"), icon: Activity, segment: "monitoring" },
      { label: t("nav.news"), icon: Newspaper, segment: "news" },
    ],
    [
      { label: t("nav.members"), icon: Users, segment: "members" },
      { label: t("nav.ranks"), icon: ShieldCheck, segment: "ranks" },
      { label: t("nav.warnings"), icon: ShieldAlert, segment: "warnings", moduleKey: "warnings" },
      { label: t("nav.tickets"), icon: Ticket, segment: "tickets", moduleKey: "tickets" },
      { label: t("nav.afk"), icon: Moon, segment: "afk", moduleKey: "afk" },
      { label: t("nav.blacklist"), icon: Ban, segment: "blacklist", moduleKey: "blacklist" },
    ],
  ];
  const bottomNav: NavItem[] = [
    { label: t("nav.security"), icon: Lock, segment: "security" },
    { label: t("nav.settings"), icon: Settings, segment: "settings" },
    { label: t("nav.auditLog"), icon: History, segment: "audit-log" },
  ];

  return (
    <>
      {/* Permanent rail from md up - a 768px+ viewport has room for it.
          The rail itself is a plain (non-sticky) flex item with only a
          MINIMUM height - it stretches to match its row sibling (the main
          content column) via the parent's default flex stretch, so its
          background/border still reach the bottom on any page taller than
          one viewport (a long settings page, or once the footer is
          added) instead of visibly running out partway down. The nav
          itself lives in an inner div that's actually sticky and height-
          capped, so it stays pinned within the viewport (and scrolls on
          its own if it has more items than fit) regardless of how tall
          the outer rail grows. */}
      <aside className="hidden min-h-[calc(100dvh-2rem)] w-64 shrink-0 border-r border-border/60 bg-card/40 md:flex md:flex-col">
        <div className="sticky top-8 flex max-h-[calc(100dvh-2rem)] flex-col overflow-y-auto">
          <SidebarNavContent
            guildId={guildId}
            guildName={guildName}
            guilds={guilds}
            noBotLabel={t("noBot")}
            navGroups={navGroups}
            bottomNav={bottomNav}
            moduleStates={moduleStates}
            moduleLockedLabel={t("nav.moduleLocked")}
          />
        </div>
      </aside>

      {/* Below md, the rail would eat the whole viewport, so it collapses
          into a top bar + Sheet instead of just overflowing. */}
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 px-3 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon-sm" aria-label={t("openMenu")} />}>
            <Menu className="size-4" />
          </SheetTrigger>
          <SheetContent side="left" className="flex w-72 flex-col gap-0 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>{guildName}</SheetTitle>
            </SheetHeader>
            <SidebarNavContent
              guildId={guildId}
              guildName={guildName}
              guilds={guilds}
              noBotLabel={t("noBot")}
              navGroups={navGroups}
              bottomNav={bottomNav}
              moduleStates={moduleStates}
              moduleLockedLabel={t("nav.moduleLocked")}
              onNavigate={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{guildName}</span>
        {accountMenu}
      </div>
    </>
  );
}
