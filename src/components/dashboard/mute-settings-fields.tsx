"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RoleSelect } from "@/components/dashboard/role-select";
import type { DiscordRole } from "@/lib/discord-guild";

// The mute-role field only means anything when the mute mode actually
// assigns a role - showing it (and requiring an answer to "which role?")
// for plain Discord timeouts made no sense and read as broken. Needs to be
// a client component so the field can react to the mode picked above it
// without a page round-trip.
export function MuteSettingsFields({
  roles,
  defaultMuteMode,
  defaultMuteRoleId,
  botRolePosition,
  labels,
}: {
  roles: DiscordRole[];
  defaultMuteMode: string;
  defaultMuteRoleId: string | null;
  botRolePosition: number;
  labels: {
    muteMode: string;
    muteModeHint: string;
    muteModeTimeout: string;
    muteModeRole: string;
    muteModeBoth: string;
    muteRoleId: string;
    muteRoleIdHint: string;
    muteRoleIdPlaceholder: string;
    rolesUnavailable: string;
    hierarchyWarning: string;
  };
}) {
  const [muteMode, setMuteMode] = useState(defaultMuteMode);
  const showRoleField = muteMode === "role" || muteMode === "both";

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="muteMode">{labels.muteMode}</Label>
        {/* Base UI's <Select.Value> only resolves a value to its label via
            an explicit `items` map or a children render-function - it does
            NOT auto-read the matching <Select.Item>'s rendered text despite
            that being wrapped in <Select.ItemText>. Without either, it just
            stringifies the raw stored value, which is why this showed
            "timeout" instead of "Таймаут Discord". */}
        <Select
          name="muteMode"
          defaultValue={defaultMuteMode}
          onValueChange={(v) => setMuteMode(v as string)}
        >
          <SelectTrigger id="muteMode" className="w-full sm:w-64">
            <SelectValue>
              {(value: string) =>
                value === "role"
                  ? labels.muteModeRole
                  : value === "both"
                    ? labels.muteModeBoth
                    : labels.muteModeTimeout
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="timeout">{labels.muteModeTimeout}</SelectItem>
            <SelectItem value="role">{labels.muteModeRole}</SelectItem>
            <SelectItem value="both">{labels.muteModeBoth}</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">{labels.muteModeHint}</p>
      </div>
      {showRoleField && (
        <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150 ease-out">
          <Label>{labels.muteRoleId}</Label>
          <RoleSelect
            name="muteRoleId"
            roles={roles}
            defaultValue={defaultMuteRoleId}
            botRolePosition={botRolePosition}
            hierarchyWarningLabel={labels.hierarchyWarning}
            placeholder={labels.muteRoleIdPlaceholder}
            emptyLabel={labels.rolesUnavailable}
          />
          <p className="text-xs text-muted-foreground">{labels.muteRoleIdHint}</p>
        </div>
      )}
    </>
  );
}
