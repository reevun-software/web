"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
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
  id,
  name,
  roles,
  defaultValue,
  botRolePosition = 0,
  hierarchyWarningLabel,
  placeholder,
  emptyLabel,
}: {
  id?: string;
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
    // Same reasoning as role-picker.tsx: don't let a transient role-fetch
    // failure wipe an existing selection on the next save. `selectedId` is
    // already filtered against `roles` above (so it's always null here) -
    // use the raw `defaultValue` instead.
    return (
      <>
        {defaultValue && <input type="hidden" name={name} value={defaultValue} />}
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      </>
    );
  }

  return (
    <DropdownMenu>
      <input type="hidden" name={name} value={selectedId ?? ""} />
      <DropdownMenuTrigger
        render={
          <Button
            id={id}
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
  );
}
