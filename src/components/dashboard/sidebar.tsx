"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  ShieldCheck,
  Ticket,
  Settings,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ManageableGuild } from "@/lib/guilds";

const NAV = [
  { label: "Участники", icon: Users, segment: "" },
  { label: "Ранги и предупреждения", icon: ShieldCheck, segment: "ranks" },
  { label: "Обращения", icon: Ticket, segment: "tickets" },
  { label: "Настройки", icon: Settings, segment: "settings" },
];

export function DashboardSidebar({
  guildId,
  guildName,
  guilds,
}: {
  guildId: string;
  guildName: string;
  guilds: ManageableGuild[];
}) {
  const pathname = usePathname();
  const base = `/dashboard/${guildId}`;

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
                    нет бота
                  </span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <nav className="flex flex-col gap-0.5 px-2">
        {NAV.map((item) => {
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
      </nav>
    </aside>
  );
}
