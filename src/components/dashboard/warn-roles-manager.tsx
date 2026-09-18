"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RoleSelect } from "@/components/dashboard/role-select";
import type { DiscordRole } from "@/lib/discord-guild";
import type { WarnPunishmentMode } from "@/lib/bot-api";

// The punishment-role field only means anything when the mode is
// "assignRole" - same pattern as MuteSettingsFields for the mute role.
export function WarnRolesManager({
  roles,
  defaultWarnRole1,
  defaultWarnRole2,
  defaultPunishmentMode,
  defaultPunishmentRoleId,
  labels,
}: {
  roles: DiscordRole[];
  defaultWarnRole1: string | null;
  defaultWarnRole2: string | null;
  defaultPunishmentMode: WarnPunishmentMode;
  defaultPunishmentRoleId: string | null;
  labels: {
    warnRole1: string;
    warnRole2: string;
    roleNone: string;
    rolesUnavailable: string;
    punishmentMode: string;
    punishmentModeHint: string;
    punishmentModeStripRoles: string;
    punishmentModeKick: string;
    punishmentModeBan: string;
    punishmentModeAssignRole: string;
    punishmentRole: string;
    punishmentRolePlaceholder: string;
  };
}) {
  const [punishmentMode, setPunishmentMode] = useState<WarnPunishmentMode>(defaultPunishmentMode);
  const modeLabel = (mode: string) =>
    mode === "kick"
      ? labels.punishmentModeKick
      : mode === "ban"
        ? labels.punishmentModeBan
        : mode === "assignRole"
          ? labels.punishmentModeAssignRole
          : labels.punishmentModeStripRoles;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="warnRole1">{labels.warnRole1}</Label>
          <RoleSelect
            id="warnRole1"
            name="warnRole1"
            roles={roles}
            defaultValue={defaultWarnRole1}
            placeholder={labels.roleNone}
            emptyLabel={labels.rolesUnavailable}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="warnRole2">{labels.warnRole2}</Label>
          <RoleSelect
            id="warnRole2"
            name="warnRole2"
            roles={roles}
            defaultValue={defaultWarnRole2}
            placeholder={labels.roleNone}
            emptyLabel={labels.rolesUnavailable}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="warnPunishmentMode">{labels.punishmentMode}</Label>
          <Select
            name="warnPunishmentMode"
            defaultValue={defaultPunishmentMode}
            onValueChange={(v) => setPunishmentMode(v as WarnPunishmentMode)}
          >
            <SelectTrigger id="warnPunishmentMode" className="w-full">
              <SelectValue>{(value: string) => modeLabel(value)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stripRoles">{labels.punishmentModeStripRoles}</SelectItem>
              <SelectItem value="kick">{labels.punishmentModeKick}</SelectItem>
              <SelectItem value="ban">{labels.punishmentModeBan}</SelectItem>
              <SelectItem value="assignRole">{labels.punishmentModeAssignRole}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">{labels.punishmentModeHint}</p>

      {punishmentMode === "assignRole" && (
        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150 ease-out">
          <Label htmlFor="warnPunishmentRoleId">{labels.punishmentRole}</Label>
          <RoleSelect
            id="warnPunishmentRoleId"
            name="warnPunishmentRoleId"
            roles={roles}
            defaultValue={defaultPunishmentRoleId}
            placeholder={labels.punishmentRolePlaceholder}
            emptyLabel={labels.rolesUnavailable}
          />
        </div>
      )}
    </div>
  );
}
