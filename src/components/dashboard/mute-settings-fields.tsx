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
        {/* Uncontrolled (defaultValue, not value) - Base UI's SelectValue
            only resolves the selected item's rendered label text once its
            items have registered, and a controlled `value` set on first
            render beat that registration, so the trigger showed the raw
            "timeout" instead of "Таймаут Discord". onValueChange still
            fires either way, which is all this needs to drive the
            conditional role field below. */}
        <Select
          name="muteMode"
          defaultValue={defaultMuteMode}
          onValueChange={(v) => setMuteMode(v as string)}
        >
          <SelectTrigger id="muteMode" className="w-full sm:w-64">
            <SelectValue />
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
