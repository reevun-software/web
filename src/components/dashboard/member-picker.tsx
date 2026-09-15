"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SEARCH_THRESHOLD = 8;

export type PickableMember = { discordUserId: string; username: string };

// Mirrors role-picker.tsx's UI exactly (one long field, inline chips, a
// checklist that stays open across picks) - members just don't carry a
// color dot or a hierarchy warning the way roles do.
export function MemberPicker({
  members,
  selectedIds,
  onChange,
  addLabel,
  emptyLabel,
  searchPlaceholder,
}: {
  members: PickableMember[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  addLabel: string;
  emptyLabel: string;
  searchPlaceholder?: string;
}) {
  const [search, setSearch] = useState("");
  const selected = selectedIds
    .map((id) => members.find((m) => m.discordUserId === id))
    .filter((m): m is PickableMember => !!m);
  const visibleMembers = members.filter((m) =>
    m.username.toLowerCase().includes(search.toLowerCase()),
  );

  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  function toggle(id: string, checked: boolean) {
    onChange(checked ? [...selectedIds, id] : selectedIds.filter((x) => x !== id));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <div
            role="button"
            tabIndex={0}
            className="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 text-left text-sm cursor-pointer dark:bg-input/30 dark:hover:bg-input/50"
          />
        }
      >
        {selected.length === 0 && <span className="px-1 text-muted-foreground">{addLabel}</span>}
        {selected.map((m) => (
          <span
            key={m.discordUserId}
            className="flex max-w-full items-center gap-1.5 rounded-md border border-border/60 bg-card py-1 pr-1.5 pl-1.5 text-sm"
          >
            <Avatar className="size-4">
              <AvatarFallback className="text-[9px]">{m.username[0]}</AvatarFallback>
            </Avatar>
            <span className="max-w-40 truncate">{m.username}</span>
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                toggle(m.discordUserId, false);
              }}
              className="cursor-pointer rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <ChevronDown className="ml-auto size-3.5 shrink-0 self-center text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="max-h-64 w-(--anchor-width)">
        {members.length > SEARCH_THRESHOLD && searchPlaceholder && (
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder={searchPlaceholder}
            className="mb-1 h-7 text-xs"
          />
        )}
        {visibleMembers.map((m) => (
          <DropdownMenuCheckboxItem
            key={m.discordUserId}
            className="cursor-pointer"
            checked={selectedIds.includes(m.discordUserId)}
            onCheckedChange={(checked) => toggle(m.discordUserId, checked === true)}
          >
            <Avatar className="size-4">
              <AvatarFallback className="text-[9px]">{m.username[0]}</AvatarFallback>
            </Avatar>
            <span className="truncate">{m.username}</span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
