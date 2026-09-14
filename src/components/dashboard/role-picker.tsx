"use client";

import { useState } from "react";
import { X, Plus, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DiscordRole } from "@/lib/discord-guild";

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
// warning so picking one here doesn't silently fail bot-side later. The
// icon alone reads as unexplained noise, so it always carries visible text
// too, not just a hover tooltip nobody finds.
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
  name,
  roles,
  defaultSelectedIds,
  botRolePosition = 0,
  hierarchyWarningLabel,
  addLabel,
  emptyLabel,
}: {
  name: string;
  roles: DiscordRole[];
  defaultSelectedIds: string[];
  botRolePosition?: number;
  hierarchyWarningLabel?: string;
  addLabel: string;
  emptyLabel: string;
}) {
  const [selectedIds, setSelectedIds] = useState(
    defaultSelectedIds.filter((id) => roles.some((r) => r.id === id)),
  );
  const selected = selectedIds
    .map((id) => roles.find((r) => r.id === id))
    .filter((r): r is DiscordRole => !!r);
  const hasWarning = selected.some((r) => r.position >= botRolePosition);

  if (roles.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  function toggle(roleId: string, checked: boolean) {
    setSelectedIds((ids) => (checked ? [...ids, roleId] : ids.filter((id) => id !== roleId)));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        {selected.map((role) => (
          <span
            key={role.id}
            className="flex items-center gap-1.5 rounded-md border border-border/60 bg-card py-1 pr-1.5 pl-2 text-sm"
          >
            <input type="hidden" name={name} value={role.id} />
            <RoleDot color={role.color} />
            {role.name}
            {role.position >= botRolePosition && hierarchyWarningLabel && (
              <RoleHierarchyWarning label={hierarchyWarningLabel} />
            )}
            <button
              type="button"
              onClick={() => toggle(role.id, false)}
              className="cursor-pointer rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}

        {/* All roles stay in one checklist that toggles without closing
            (DropdownMenuCheckboxItem defaults to closeOnClick=false), so
            picking several roles doesn't mean reopening this menu each
            time - a plain click-to-add DropdownMenuItem closed itself
            after every single pick and read as "only one role at a time". */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="outline" size="sm" className="cursor-pointer gap-1">
                <Plus className="size-3.5" />
                {addLabel}
              </Button>
            }
          />
          <DropdownMenuContent align="start" className="max-h-64 w-56">
            {roles.map((role) => (
              <DropdownMenuCheckboxItem
                key={role.id}
                className="cursor-pointer"
                checked={selectedIds.includes(role.id)}
                onCheckedChange={(checked) => toggle(role.id, checked === true)}
              >
                <RoleDot color={role.color} />
                {role.name}
                {role.position >= botRolePosition && hierarchyWarningLabel && (
                  <RoleHierarchyWarning label={hierarchyWarningLabel} />
                )}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {hasWarning && hierarchyWarningLabel && (
        <p className="flex items-center gap-1 text-xs text-amber-500">
          <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
          {hierarchyWarningLabel}
        </p>
      )}
    </div>
  );
}
