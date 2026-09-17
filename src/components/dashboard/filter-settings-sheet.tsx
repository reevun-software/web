"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Settings2, XIcon } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
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
  action: (formData: FormData) => Promise<{ error?: boolean } | void>;
  labels: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const hasList = LIST_BASED_FILTERS.has(filterType);

  async function handleSubmit(formData: FormData) {
    const result = await action(formData);
    if (result?.error) {
      toast.error(labels.saveFailed);
      return;
    }
    toast.success(labels.saved);
    setOpen(false);
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
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
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs" />
        {/* A centered modal, not a side panel - matches the Juniper
            reference. Entrance is a downward slide + fade rather than the
            shared Dialog's zoom, so it reads as "dropping in from the
            settings icon" instead of growing from the center. Header and
            footer are plain shrink-0 flex siblings around a single
            scrolling middle section, not position:sticky - a transformed
            ancestor (this popup's own enter/exit transform) breaks sticky
            for every descendant. */}
        <DialogPrimitive.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-full max-w-md translate-x-[-50%] translate-y-[-50%] flex-col gap-0 overflow-hidden rounded-xl bg-popover text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none transition-all duration-150 ease-out",
            "data-starting-style:translate-y-[calc(-50%-1rem)] data-starting-style:opacity-0",
            "data-ending-style:translate-y-[calc(-50%-1rem)] data-ending-style:opacity-0",
          )}
        >
          <DialogPrimitive.Close
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-3 right-3 cursor-pointer"
              />
            }
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
          <form action={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 border-b border-border/60 px-6 py-4">
              <DialogPrimitive.Title className="font-heading text-base font-medium text-foreground">
                {filterLabel}
              </DialogPrimitive.Title>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
            <div className="flex flex-col gap-3">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <span className="text-sm">{labels.deleteMessage}</span>
                <Switch name="deleteMessage" defaultChecked={config.deleteMessage} />
              </label>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${filterType}-punishment`}>{labels.punishment}</Label>
                <Select name="punishment" defaultValue={config.punishment}>
                  <SelectTrigger id={`${filterType}-punishment`} className="w-full">
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
                    <Label htmlFor={`${filterType}-strategy`}>{labels.strategy}</Label>
                    <Select name="strategy" defaultValue={config.strategy}>
                      <SelectTrigger id={`${filterType}-strategy`} className="w-full">
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
                <Label htmlFor={`${filterType}-targetRoleIds`}>{labels.targetRoles}</Label>
                <RolePicker
                  id={`${filterType}-targetRoleIds`}
                  name="targetRoleIds"
                  roles={roles}
                  defaultSelectedIds={config.targetRoleIds}
                  botRolePosition={botRolePosition}
                  hierarchyWarningLabel={labels.hierarchyWarning}
                  addLabel={labels.addRole}
                  emptyLabel={labels.rolesUnavailable}
                  searchPlaceholder={labels.searchRoles}
                />
                <p className="text-xs text-muted-foreground">{labels.targetRolesHint}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${filterType}-ignoredRoleIds`}>{labels.ignoredRoles}</Label>
                <RolePicker
                  id={`${filterType}-ignoredRoleIds`}
                  name="ignoredRoleIds"
                  roles={roles}
                  defaultSelectedIds={config.ignoredRoleIds}
                  botRolePosition={botRolePosition}
                  hierarchyWarningLabel={labels.hierarchyWarning}
                  addLabel={labels.addRole}
                  emptyLabel={labels.rolesUnavailable}
                  searchPlaceholder={labels.searchRoles}
                />
                <p className="text-xs text-muted-foreground">{labels.ignoredRolesHint}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${filterType}-targetChannelIds`}>{labels.targetChannels}</Label>
                <ChannelPicker
                  id={`${filterType}-targetChannelIds`}
                  name="targetChannelIds"
                  channels={channels}
                  defaultSelectedIds={config.targetChannelIds}
                  addLabel={labels.addChannel}
                  emptyLabel={labels.channelsUnavailable}
                  searchPlaceholder={labels.searchChannels}
                />
                <p className="text-xs text-muted-foreground">{labels.targetChannelsHint}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${filterType}-ignoredChannelIds`}>{labels.ignoredChannels}</Label>
                <ChannelPicker
                  id={`${filterType}-ignoredChannelIds`}
                  name="ignoredChannelIds"
                  channels={channels}
                  defaultSelectedIds={config.ignoredChannelIds}
                  addLabel={labels.addChannel}
                  emptyLabel={labels.channelsUnavailable}
                  searchPlaceholder={labels.searchChannels}
                />
                <p className="text-xs text-muted-foreground">{labels.ignoredChannelsHint}</p>
              </div>
            </div>
          </div>

            <div className="shrink-0 border-t border-border/60 p-4">
              <SubmitButton pendingLabel={labels.saving} className="w-full">
                {labels.save}
              </SubmitButton>
            </div>
          </form>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
