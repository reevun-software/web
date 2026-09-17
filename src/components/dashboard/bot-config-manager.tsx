"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RolePicker } from "@/components/dashboard/role-picker";
import { RankLadderEditor } from "@/components/dashboard/rank-ladder-editor";
import type { DiscordRole, DiscordChannel } from "@/lib/discord-guild";
import type { BotGuildConfig } from "@/lib/bot-api";

const NONE = "none";

// A single <Select> backed by a hidden input, matching the pattern
// project-server-selector.tsx already established: a controlled Select for
// the UI, mirrored into a plain input so the surrounding form's FormData
// carries the value on submit (Select itself has no name prop for this).
function ChannelSelect({
  name,
  defaultValue,
  channels,
  noneLabel,
  label,
}: {
  name: string;
  defaultValue: string | null;
  channels: DiscordChannel[];
  noneLabel: string;
  label: string;
}) {
  const [value, setValue] = useState(defaultValue ?? NONE);
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Select
        value={value}
        onValueChange={(next) => setValue(next ?? NONE)}
        items={{ [NONE]: noneLabel, ...Object.fromEntries(channels.map((c) => [c.id, `# ${c.name}`])) }}
      >
        <SelectTrigger id={name} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>{noneLabel}</SelectItem>
          {channels.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              # {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" name={name} value={value === NONE ? "" : value} />
    </div>
  );
}

function RoleSelect({
  name,
  defaultValue,
  roles,
  noneLabel,
  label,
}: {
  name: string;
  defaultValue: string | null;
  roles: DiscordRole[];
  noneLabel: string;
  label: string;
}) {
  const [value, setValue] = useState(defaultValue ?? NONE);
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Select
        value={value}
        onValueChange={(next) => setValue(next ?? NONE)}
        items={{ [NONE]: noneLabel, ...Object.fromEntries(roles.map((r) => [r.id, r.name])) }}
      >
        <SelectTrigger id={name} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE}>{noneLabel}</SelectItem>
          {roles.map((r) => (
            <SelectItem key={r.id} value={r.id}>
              {r.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input type="hidden" name={name} value={value === NONE ? "" : value} />
    </div>
  );
}

export function BotConfigManager({
  roles,
  channels,
  initialConfig,
  labels,
}: {
  roles: DiscordRole[];
  channels: DiscordChannel[];
  initialConfig: BotGuildConfig;
  labels: {
    leadershipRoles: string;
    leadershipRolesHint: string;
    selectRoles: string;
    rolesUnavailable: string;
    searchRoles: string;
    verifiedMemberRole: string;
    roleNone: string;
    channelNone: string;
    logChannel: string;
    applicationsChannel: string;
    applicationPanelChannel: string;
    supportPanelChannel: string;
    adminPanelChannel: string;
    warnRolesTitle: string;
    warnRole1: string;
    warnRole2: string;
    ranksTitle: string;
    ranksHint: string;
    addRank: string;
    rankNumber: string;
    rankLabel: string;
    nicknamePrefix: string;
    noRanks: string;
    delete: string;
  };
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="leadershipRoleIds">{labels.leadershipRoles}</Label>
        <RolePicker
          id="leadershipRoleIds"
          name="leadershipRoleIds"
          roles={roles}
          defaultSelectedIds={initialConfig.leadershipRoleIds}
          addLabel={labels.selectRoles}
          emptyLabel={labels.rolesUnavailable}
          searchPlaceholder={labels.searchRoles}
        />
        <p className="text-xs text-muted-foreground">{labels.leadershipRolesHint}</p>
      </div>

      <RoleSelect
        name="verifiedMemberRoleId"
        defaultValue={initialConfig.verifiedMemberRoleId}
        roles={roles}
        noneLabel={labels.roleNone}
        label={labels.verifiedMemberRole}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <ChannelSelect name="logChannelId" defaultValue={initialConfig.logChannelId} channels={channels} noneLabel={labels.channelNone} label={labels.logChannel} />
        <ChannelSelect name="applicationsChannelId" defaultValue={initialConfig.applicationsChannelId} channels={channels} noneLabel={labels.channelNone} label={labels.applicationsChannel} />
        <ChannelSelect name="applicationPanelChannelId" defaultValue={initialConfig.applicationPanelChannelId} channels={channels} noneLabel={labels.channelNone} label={labels.applicationPanelChannel} />
        <ChannelSelect name="supportPanelChannelId" defaultValue={initialConfig.supportPanelChannelId} channels={channels} noneLabel={labels.channelNone} label={labels.supportPanelChannel} />
        <ChannelSelect name="adminPanelChannelId" defaultValue={initialConfig.adminPanelChannelId} channels={channels} noneLabel={labels.channelNone} label={labels.adminPanelChannel} />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{labels.warnRolesTitle}</span>
        <div className="grid gap-4 sm:grid-cols-2">
          <RoleSelect name="warnRole1" defaultValue={initialConfig.warnRoleIds["1"] ?? null} roles={roles} noneLabel={labels.roleNone} label={labels.warnRole1} />
          <RoleSelect name="warnRole2" defaultValue={initialConfig.warnRoleIds["2"] ?? null} roles={roles} noneLabel={labels.roleNone} label={labels.warnRole2} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">{labels.ranksTitle}</span>
        <p className="text-xs text-muted-foreground">{labels.ranksHint}</p>
        <RankLadderEditor
          roles={roles}
          defaultRanks={initialConfig.rankRoleIds}
          labels={{
            addRank: labels.addRank,
            rankNumber: labels.rankNumber,
            rankLabel: labels.rankLabel,
            nicknamePrefix: labels.nicknamePrefix,
            selectRoles: labels.selectRoles,
            rolesUnavailable: labels.rolesUnavailable,
            searchRoles: labels.searchRoles,
            delete: labels.delete,
            noRanks: labels.noRanks,
          }}
        />
      </div>
    </div>
  );
}
