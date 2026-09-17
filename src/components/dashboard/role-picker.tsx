"use client";

import { useState } from "react";
import { X, ChevronDown, TriangleAlert } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DiscordRole } from "@/lib/discord-guild";

// Below this, a plain scroll list is faster to scan than typing a query.
const SEARCH_THRESHOLD = 8;

function RoleDot({ color }: { color: string }) {
  return (
    <span
      className="size-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: color || "var(--muted-foreground)" }}
      aria-hidden
    />
  );
}

// Shown next to a role the bot can't actually manage (its own role sits at
// or below that role in the hierarchy) - matches Discord's own role-list
// warning so picking one here doesn't silently fail bot-side later. Icon +
// hover tooltip only, matching Juniper's own reference exactly - an earlier
// pass also added an always-visible caption line, which read as one warning
// too many once the tooltip already explains it.
export function RoleHierarchyWarning({ label }: { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <span className="flex items-center gap-1 text-xs text-amber-500">
            <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
          </span>
        }
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function RolePicker({
  id,
  name,
  roles,
  defaultSelectedIds,
  botRolePosition = 0,
  hierarchyWarningLabel,
  addLabel,
  emptyLabel,
  searchPlaceholder,
}: {
  id?: string;
  name: string;
  roles: DiscordRole[];
  defaultSelectedIds: string[];
  botRolePosition?: number;
  hierarchyWarningLabel?: string;
  addLabel: string;
  emptyLabel: string;
  searchPlaceholder?: string;
}) {
  const [selectedIds, setSelectedIds] = useState(
    defaultSelectedIds.filter((roleId) => roles.some((r) => r.id === roleId)),
  );
  const [search, setSearch] = useState("");
  const selected = selectedIds
    .map((id) => roles.find((r) => r.id === id))
    .filter((r): r is DiscordRole => !!r);
  const visibleRoles = roles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  if (roles.length === 0) {
    // A transient Discord role-fetch failure shouldn't wipe an existing
    // selection - keep submitting the already-saved ids as hidden inputs
    // even with nothing to pick from, instead of silently clearing them
    // the next time this form saves.
    return (
      <>
        {defaultSelectedIds.map((roleId) => (
          <input key={roleId} type="hidden" name={name} value={roleId} />
        ))}
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </>
    );
  }

  function toggle(roleId: string, checked: boolean) {
    setSelectedIds((ids) => (checked ? [...ids, roleId] : ids.filter((id) => id !== roleId)));
  }

  // One long field, the way Juniper does it - clicking anywhere in it opens
  // the role checklist, and the chips it already holds live inline instead
  // of sitting next to a separate "add role" button.
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <div
            id={id}
            role="button"
            tabIndex={0}
            className="flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 text-left text-sm cursor-pointer dark:bg-input/30 dark:hover:bg-input/50"
          />
        }
      >
        {selected.length === 0 && <span className="px-1 text-muted-foreground">{addLabel}</span>}
        {selected.map((role) => (
          <span
            key={role.id}
            className="flex max-w-full items-center gap-1.5 rounded-md border border-border/60 bg-card py-1 pr-1.5 pl-2 text-sm"
          >
            <input type="hidden" name={name} value={role.id} />
            <RoleDot color={role.color} />
            <span className="max-w-40 truncate">{role.name}</span>
            {role.position >= botRolePosition && hierarchyWarningLabel && (
              <RoleHierarchyWarning label={hierarchyWarningLabel} />
            )}
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                toggle(role.id, false);
              }}
              className="cursor-pointer rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <ChevronDown className="ml-auto size-3.5 shrink-0 self-center text-muted-foreground" />
      </DropdownMenuTrigger>

      {/* All roles stay in one checklist that toggles without closing
          (DropdownMenuCheckboxItem defaults to closeOnClick=false), so
          picking several roles doesn't mean reopening this menu each
          time. */}
      <DropdownMenuContent align="start" className="max-h-64 w-(--anchor-width)">
        {roles.length > SEARCH_THRESHOLD && searchPlaceholder && (
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder={searchPlaceholder}
            className="mb-1 h-7 text-xs"
          />
        )}
        {visibleRoles.map((role) => (
          <DropdownMenuCheckboxItem
            key={role.id}
            className="cursor-pointer"
            checked={selectedIds.includes(role.id)}
            onCheckedChange={(checked) => toggle(role.id, checked === true)}
          >
            <RoleDot color={role.color} />
            <span className="truncate">{role.name}</span>
            {role.position >= botRolePosition && hierarchyWarningLabel && (
              <RoleHierarchyWarning label={hierarchyWarningLabel} />
            )}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
