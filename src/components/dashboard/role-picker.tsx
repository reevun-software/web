"use client";

import { useState } from "react";
import { X, Plus, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
// warning so picking one here doesn't silently fail bot-side later.
export function RoleHierarchyWarning({ label }: { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<TriangleAlert className="size-3.5 shrink-0 text-amber-500" aria-hidden />}
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
  const available = roles.filter((r) => !selectedIds.includes(r.id));

  if (roles.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
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
            onClick={() => setSelectedIds((ids) => ids.filter((id) => id !== role.id))}
            className="cursor-pointer rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}

      {available.length > 0 && (
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
            {available.map((role) => (
              <DropdownMenuItem
                key={role.id}
                className="cursor-pointer"
                onClick={() => setSelectedIds((ids) => [...ids, role.id])}
              >
                <RoleDot color={role.color} />
                {role.name}
                {role.position >= botRolePosition && hierarchyWarningLabel && (
                  <RoleHierarchyWarning label={hierarchyWarningLabel} />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
