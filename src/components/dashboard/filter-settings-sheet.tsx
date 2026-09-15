"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { RolePicker } from "@/components/dashboard/role-picker";
import { ChannelPicker } from "@/components/dashboard/channel-picker";
import { SubmitButton } from "@/components/dashboard/submit-button";
import type { DiscordRole, DiscordChannel } from "@/lib/discord-guild";

export type FilterConfig = {
  deleteMessage: boolean;
  punishment: string;
  strategy: string;
  list: string[];
  notifyUser: boolean;
  ignoreAdminsAndMods: boolean;
  ignoreSlashCommands: boolean;
  targetRoleIds: string[];
  ignoredRoleIds: string[];
  targetChannelIds: string[];
  ignoredChannelIds: string[];
};

// Filters whose "list" field has a real meaning (a set of domains or a set
// of words to match against). The others still get punishment/scope
// controls, just not a list + strategy pair that wouldn't do anything.
const LIST_BASED_FILTERS = new Set(["filterLinks", "filterBadWords"]);

export function FilterSettingsSheet({
  filterType,
  filterLabel,
  config,
  roles,
  channels,
  botRolePosition,
  action,
  labels,
}: {
  filterType: string;
  filterLabel: string;
  config: FilterConfig;
  roles: DiscordRole[];
  channels: DiscordChannel[];
  botRolePosition: number;
  action: (formData: FormData) => Promise<void>;
  labels: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const hasList = LIST_BASED_FILTERS.has(filterType);

  async function handleSubmit(formData: FormData) {
    await action(formData);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={labels.settingsButtonLabel}
            className="cursor-pointer self-center text-muted-foreground"
          />
        }
      >
        <Settings2 className="size-3.5" />
      </SheetTrigger>
      {/* A right-side panel, not a full-width takeover - the Sheet's own
          default sizing. Header and footer are plain shrink-0 flex
          siblings around a single scrolling middle section, not
          position:sticky - the Sheet's own open/close slide animation puts
          a transform on an ancestor, and a transformed ancestor creates a
          new containing block that breaks sticky for every descendant
          (it silently falls back to static positioning). This layout gets
          the same "always visible" header/footer without depending on
          sticky at all. */}
      <SheetContent className="flex flex-col gap-0 p-0">
        <form action={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <SheetHeader className="shrink-0 border-b border-border/60 px-6 py-4">
            <SheetTitle>{filterLabel}</SheetTitle>
          </SheetHeader>

          <div className="scrollbar-thin flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
            <div className="flex flex-col gap-3">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <span className="text-sm">{labels.deleteMessage}</span>
                <Switch name="deleteMessage" defaultChecked={config.deleteMessage} />
              </label>

              <div className="flex flex-col gap-1.5">
                <Label>{labels.punishment}</Label>
                <Select name="punishment" defaultValue={config.punishment}>
                  <SelectTrigger className="w-full">
                    {/* <Select.Value> needs an explicit value->label mapping
                        (an `items` map or this render-function) - it does
                        not read the matching <Select.Item>'s own text, so
                        without one it just showed the raw stored value
                        ("none"). */}
                    <SelectValue>
                      {(value: string) =>
                        ({
                          none: labels.punishmentNone,
                          warn: labels.punishmentWarn,
                          mute: labels.punishmentMute,
                          kick: labels.punishmentKick,
                          ban: labels.punishmentBan,
                        })[value] ?? labels.punishmentNone
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{labels.punishmentNone}</SelectItem>
                    <SelectItem value="warn">{labels.punishmentWarn}</SelectItem>
                    <SelectItem value="mute">{labels.punishmentMute}</SelectItem>
                    <SelectItem value="kick">{labels.punishmentKick}</SelectItem>
                    <SelectItem value="ban">{labels.punishmentBan}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{labels.punishmentHint}</p>
              </div>

              {hasList && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label>{labels.strategy}</Label>
                    <Select name="strategy" defaultValue={config.strategy}>
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          {(value: string) =>
                            value === "allowlist" ? labels.strategyAllowlist : labels.strategyBlocklist
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blocklist">{labels.strategyBlocklist}</SelectItem>
                        <SelectItem value="allowlist">{labels.strategyAllowlist}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="list">
                      {filterType === "filterLinks" ? labels.listLinks : labels.listBadWords}
                    </Label>
                    <Textarea
                      id="list"
                      name="list"
                      rows={4}
                      defaultValue={config.list.join("\n")}
                      placeholder={labels.listPlaceholder}
                    />
                    <p className="text-xs text-muted-foreground">{labels.listHint}</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
              <span className="text-sm font-medium">{labels.notifyTitle}</span>
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <span className="text-sm">{labels.notifyUser}</span>
                <Switch name="notifyUser" defaultChecked={config.notifyUser} />
              </label>
            </div>

            <div className="flex flex-col gap-3 border-t border-border/60 pt-4">
              <span className="text-sm font-medium">{labels.scopeTitle}</span>

              <label className="flex cursor-pointer items-center justify-between gap-4">
                <span className="text-sm">{labels.ignoreAdminsAndMods}</span>
                <Switch name="ignoreAdminsAndMods" defaultChecked={config.ignoreAdminsAndMods} />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <span className="text-sm">{labels.ignoreSlashCommands}</span>
                <Switch name="ignoreSlashCommands" defaultChecked={config.ignoreSlashCommands} />
              </label>

              <div className="flex flex-col gap-1.5">
                <Label>{labels.targetRoles}</Label>
                <RolePicker
                  name="targetRoleIds"
                  roles={roles}
                  defaultSelectedIds={config.targetRoleIds}
                  botRolePosition={botRolePosition}
                  hierarchyWarningLabel={labels.hierarchyWarning}
                  addLabel={labels.addRole}
                  emptyLabel={labels.rolesUnavailable}
                />
                <p className="text-xs text-muted-foreground">{labels.targetRolesHint}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>{labels.ignoredRoles}</Label>
                <RolePicker
                  name="ignoredRoleIds"
                  roles={roles}
                  defaultSelectedIds={config.ignoredRoleIds}
                  botRolePosition={botRolePosition}
                  hierarchyWarningLabel={labels.hierarchyWarning}
                  addLabel={labels.addRole}
                  emptyLabel={labels.rolesUnavailable}
                />
                <p className="text-xs text-muted-foreground">{labels.ignoredRolesHint}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>{labels.targetChannels}</Label>
                <ChannelPicker
                  name="targetChannelIds"
                  channels={channels}
                  defaultSelectedIds={config.targetChannelIds}
                  addLabel={labels.addChannel}
                  emptyLabel={labels.channelsUnavailable}
                />
                <p className="text-xs text-muted-foreground">{labels.targetChannelsHint}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>{labels.ignoredChannels}</Label>
                <ChannelPicker
                  name="ignoredChannelIds"
                  channels={channels}
                  defaultSelectedIds={config.ignoredChannelIds}
                  addLabel={labels.addChannel}
                  emptyLabel={labels.channelsUnavailable}
                />
                <p className="text-xs text-muted-foreground">{labels.ignoredChannelsHint}</p>
              </div>
            </div>
          </div>

          <SheetFooter className="shrink-0 border-t border-border/60 p-4">
            <SubmitButton pendingLabel={labels.saving}>{labels.save}</SubmitButton>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
