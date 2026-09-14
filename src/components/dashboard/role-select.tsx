"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RoleHierarchyWarning } from "@/components/dashboard/role-picker";
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

// Single-choice counterpart to RolePicker - used for settings that take
// exactly one role (the mute role) rather than a set, styled to match the
// same role-list-with-hierarchy-warning language instead of a plain <Select>
// full of bare role names.
export function RoleSelect({
  name,
  roles,
  defaultValue,
  botRolePosition = 0,
  hierarchyWarningLabel,
  placeholder,
  emptyLabel,
}: {
  name: string;
  roles: DiscordRole[];
  defaultValue: string | null;
  botRolePosition?: number;
  hierarchyWarningLabel?: string;
  placeholder: string;
  emptyLabel: string;
}) {
  const [selectedId, setSelectedId] = useState(
    defaultValue && roles.some((r) => r.id === defaultValue) ? defaultValue : null,
  );
  const selected = roles.find((r) => r.id === selectedId);

  if (roles.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const selectedHasWarning = !!selected && selected.position >= botRolePosition;

  return (
    <div className="flex flex-col gap-1.5">
      <DropdownMenu>
        <input type="hidden" name={name} value={selectedId ?? ""} />
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="w-full cursor-pointer justify-between gap-1.5 sm:w-64"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                {selected ? (
                  <>
                    <RoleDot color={selected.color} />
                    <span className="truncate">{selected.name}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
              </span>
              <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
            </Button>
          }
        />
        <DropdownMenuContent align="start" className="max-h-64 w-56">
          {roles.map((role) => (
            <DropdownMenuItem
              key={role.id}
              className="cursor-pointer"
              onClick={() => setSelectedId(role.id)}
            >
              <RoleDot color={role.color} />
              <span className="flex-1 truncate">{role.name}</span>
              {role.position >= botRolePosition && hierarchyWarningLabel && (
                <RoleHierarchyWarning label={hierarchyWarningLabel} />
              )}
              {role.id === selectedId && <Check className="size-3.5 shrink-0" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {selectedHasWarning && hierarchyWarningLabel && (
        <p className="flex items-center gap-1 text-xs text-amber-500">
          <TriangleAlert className="size-3.5 shrink-0" aria-hidden />
          {hierarchyWarningLabel}
        </p>
      )}
    </div>
  );
}
