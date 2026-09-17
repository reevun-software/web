import { eq } from "drizzle-orm";
import { ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { guildSecuritySettings, automodFilterConfig, guildBotSettings } from "@/lib/db/schema";
import { updateBotGuildConfig } from "@/lib/bot-api";
import { getGuildRoles, getGuildChannels, getBotHighestRolePosition } from "@/lib/discord-guild";
import { requireGuildManager } from "@/lib/guild-auth";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RolePicker } from "@/components/dashboard/role-picker";
import { MuteSettingsFields } from "@/components/dashboard/mute-settings-fields";
import { SubmitButton } from "@/components/dashboard/submit-button";
import { SaveForm } from "@/components/dashboard/save-form";
import { FilterSettingsSheet, type FilterConfig } from "@/components/dashboard/filter-settings-sheet";

const AUTOMOD_FILTERS = [
  "filterLinks",
  "filterInvites",
  "filterScamLinks",
  "filterBadWords",
  "filterCapsLock",
  "filterMentionSpam",
] as const;

const DEFAULT_FILTER_CONFIG: FilterConfig = {
  deleteMessage: true,
  punishment: "none",
  strategy: "blocklist",
  list: [],
  notifyUser: false,
  ignoreAdminsAndMods: false,
  ignoreSlashCommands: false,
  targetRoleIds: [],
  ignoredRoleIds: [],
  targetChannelIds: [],
  ignoredChannelIds: [],
};

export default async function SecurityPage({
  params,
}: PageProps<"/[locale]/dashboard/[guildId]/security">) {
  const { guildId } = await params;
  const t = await getTranslations("Dashboard.security");
  const [[settings], [botSettings], roles, channels, botRolePosition, filterConfigRows] = await Promise.all([
    db
      .select()
      .from(guildSecuritySettings)
      .where(eq(guildSecuritySettings.guildId, guildId))
      .limit(1),
    db.select().from(guildBotSettings).where(eq(guildBotSettings.guildId, guildId)).limit(1),
    getGuildRoles(guildId),
    getGuildChannels(guildId),
    getBotHighestRolePosition(guildId),
    db.select().from(automodFilterConfig).where(eq(automodFilterConfig.guildId, guildId)),
  ]);

  const current = settings ?? {
    moderatorRoleIds: [] as string[],
    ignoreCommandCooldownForMods: false,
    allowHigherModsToModerateLower: false,
    filterLinks: false,
    filterInvites: true,
    filterScamLinks: true,
    filterBadWords: false,
    filterCapsLock: false,
    filterMentionSpam: false,
    muteMode: "timeout",
    muteRoleId: null as string | null,
    muteBlocksReactions: false,
  };

  // guild_bot_settings is shared with the Settings page (language, color,
  // slash/text command toggles, project/server) - this page only owns the
  // trusted-admin and member-joining columns on it.
  const currentBot = botSettings ?? {
    interfaceLanguage: "ru",
    systemMessageColor: "#79040C",
    enableSlashCommands: true,
    enableTextCommands: true,
    trustedAdminRoleIds: [] as string[],
    defaultRoleIds: [] as string[],
    alwaysAssignDefaultRoles: false,
    restoreNicknameOnRejoin: false,
    restoreOldRolesOnRejoin: false,
    restorableRoleIds: [] as string[],
    exemptRoleIds: [] as string[],
    project: null as string | null,
    server: null as string | null,
  };

  const filterConfigs = new Map(filterConfigRows.map((row) => [row.filterType, row]));

  async function save(formData: FormData) {
    "use server";
    await requireGuildManager(guildId);
    const moderatorRoleIds = formData.getAll("moderatorRoleIds") as string[];
    const muteMode = formData.get("muteMode") as string;
    const muteRoleId = (formData.get("muteRoleId") as string) || null;

    const values = {
      guildId,
      moderatorRoleIds,
      ignoreCommandCooldownForMods: formData.get("ignoreCommandCooldownForMods") === "on",
      allowHigherModsToModerateLower: formData.get("allowHigherModsToModerateLower") === "on",
      filterLinks: formData.get("filterLinks") === "on",
      filterInvites: formData.get("filterInvites") === "on",
      filterScamLinks: formData.get("filterScamLinks") === "on",
      filterBadWords: formData.get("filterBadWords") === "on",
      filterCapsLock: formData.get("filterCapsLock") === "on",
      filterMentionSpam: formData.get("filterMentionSpam") === "on",
      muteMode: muteMode || "timeout",
      muteRoleId,
      muteBlocksReactions: formData.get("muteBlocksReactions") === "on",
      updatedAt: new Date(),
    };

    await db
      .insert(guildSecuritySettings)
      .values(values)
      .onConflictDoUpdate({ target: guildSecuritySettings.guildId, set: values });

    // Carry the columns this page doesn't own forward from what was already
    // fetched, so this save only touches trusted-admin/member-joining.
    // ponytail: read-modify-write race with a concurrent Settings-page save
    // on the same row - acceptable given how rarely both get edited at once.
    const botValues = {
      guildId,
      interfaceLanguage: currentBot.interfaceLanguage,
      systemMessageColor: currentBot.systemMessageColor,
      enableSlashCommands: currentBot.enableSlashCommands,
      enableTextCommands: currentBot.enableTextCommands,
      trustedAdminRoleIds: formData.getAll("trustedAdminRoleIds") as string[],
      defaultRoleIds: formData.getAll("defaultRoleIds") as string[],
      alwaysAssignDefaultRoles: formData.get("alwaysAssignDefaultRoles") === "on",
      restoreNicknameOnRejoin: formData.get("restoreNicknameOnRejoin") === "on",
      restoreOldRolesOnRejoin: formData.get("restoreOldRolesOnRejoin") === "on",
      restorableRoleIds: formData.getAll("restorableRoleIds") as string[],
      exemptRoleIds: formData.getAll("exemptRoleIds") as string[],
      project: currentBot.project,
      server: currentBot.server,
      updatedAt: new Date(),
    };
    await db
      .insert(guildBotSettings)
      .values(botValues)
      .onConflictDoUpdate({ target: guildBotSettings.guildId, set: botValues });

    // "Роли администраторов" (moderatorRoleIds) doubles as the bot's
    // leadershipRoleIds - who gets pinged on applications and counts as
    // family leadership - so there's no separate field for it anymore.
    await updateBotGuildConfig(guildId, { leadershipRoleIds: moderatorRoleIds });

    revalidatePath(`/dashboard/${guildId}/security`);
    revalidatePath(`/dashboard/${guildId}/settings`);
  }

  async function saveFilterConfig(filterType: string, formData: FormData) {
    "use server";
    await requireGuildManager(guildId);
    const list = (formData.get("list") as string | null)
      ?.split("\n")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

    const values = {
      guildId,
      filterType,
      deleteMessage: formData.get("deleteMessage") === "on",
      punishment: (formData.get("punishment") as string) || "none",
      strategy: (formData.get("strategy") as string) || "blocklist",
      list,
      notifyUser: formData.get("notifyUser") === "on",
      ignoreAdminsAndMods: formData.get("ignoreAdminsAndMods") === "on",
      ignoreSlashCommands: formData.get("ignoreSlashCommands") === "on",
      targetRoleIds: formData.getAll("targetRoleIds") as string[],
      ignoredRoleIds: formData.getAll("ignoredRoleIds") as string[],
      targetChannelIds: formData.getAll("targetChannelIds") as string[],
      ignoredChannelIds: formData.getAll("ignoredChannelIds") as string[],
      updatedAt: new Date(),
    };

    await db
      .insert(automodFilterConfig)
      .values(values)
      .onConflictDoUpdate({
        target: [automodFilterConfig.guildId, automodFilterConfig.filterType],
        set: values,
      });
    revalidatePath(`/dashboard/${guildId}/security`);
  }

  const filterSheetLabels = {
    deleteMessage: t("filterSettings.deleteMessage"),
    punishment: t("filterSettings.punishment"),
    punishmentHint: t("filterSettings.punishmentHint"),
    punishmentNone: t("filterSettings.punishmentNone"),
    punishmentWarn: t("filterSettings.punishmentWarn"),
    punishmentMute: t("filterSettings.punishmentMute"),
    punishmentKick: t("filterSettings.punishmentKick"),
    punishmentBan: t("filterSettings.punishmentBan"),
    strategy: t("filterSettings.strategy"),
    strategyBlocklist: t("filterSettings.strategyBlocklist"),
    strategyAllowlist: t("filterSettings.strategyAllowlist"),
    listLinks: t("filterSettings.listLinks"),
    listBadWords: t("filterSettings.listBadWords"),
    listHint: t("filterSettings.listHint"),
    listPlaceholder: t("filterSettings.listPlaceholder"),
    notifyTitle: t("filterSettings.notifyTitle"),
    notifyUser: t("filterSettings.notifyUser"),
    scopeTitle: t("filterSettings.scopeTitle"),
    ignoreAdminsAndMods: t("filterSettings.ignoreAdminsAndMods"),
    ignoreSlashCommands: t("filterSettings.ignoreSlashCommands"),
    targetRoles: t("filterSettings.targetRoles"),
    targetRolesHint: t("filterSettings.targetRolesHint"),
    ignoredRoles: t("filterSettings.ignoredRoles"),
    ignoredRolesHint: t("filterSettings.ignoredRolesHint"),
    targetChannels: t("filterSettings.targetChannels"),
    targetChannelsHint: t("filterSettings.targetChannelsHint"),
    ignoredChannels: t("filterSettings.ignoredChannels"),
    ignoredChannelsHint: t("filterSettings.ignoredChannelsHint"),
    addRole: t("addRole"),
    addChannel: t("filterSettings.addChannel"),
    rolesUnavailable: t("rolesUnavailable"),
    channelsUnavailable: t("filterSettings.channelsUnavailable"),
    hierarchyWarning: t("hierarchyWarning"),
    save: t("save"),
    saving: t("saving"),
    saved: t("saved"),
    settingsButtonLabel: t("filterSettings.settingsButtonLabel"),
    searchRoles: t("searchRoles"),
    searchChannels: t("searchChannels"),
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-5 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      </div>

      <SaveForm action={save} savedMessage={t("saved")} className="flex flex-col gap-4">
        <Card className="flex flex-col divide-y divide-border/60 p-0">
          <div className="px-6 py-4">
            <span className="text-sm font-medium">{t("moderatorsTitle")}</span>
          </div>
          <div className="flex flex-col gap-4 px-6 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="moderatorRoleIds" className="-translate-y-3">
                {t("moderatorRoleIds")}
              </Label>
              {/* A touch less than the label's own -translate-y-3, so a
                  small gap remains between label and field instead of
                  sitting flush. */}
              <div className="-translate-y-2">
                <RolePicker
                  id="moderatorRoleIds"
                  name="moderatorRoleIds"
                  roles={roles}
                  defaultSelectedIds={current.moderatorRoleIds}
                  botRolePosition={botRolePosition}
                  hierarchyWarningLabel={t("hierarchyWarning")}
                  addLabel={t("addRole")}
                  emptyLabel={t("rolesUnavailable")}
                  searchPlaceholder={t("searchRoles")}
                />
              </div>
            </div>
            <label
              htmlFor="ignoreCommandCooldownForMods"
              className="flex -translate-y-1 cursor-pointer items-center justify-between gap-4"
            >
              <span className="text-sm">{t("ignoreCommandCooldownForMods")}</span>
              <Switch
                id="ignoreCommandCooldownForMods"
                name="ignoreCommandCooldownForMods"
                defaultChecked={current.ignoreCommandCooldownForMods}
              />
            </label>
            <label
              htmlFor="allowHigherModsToModerateLower"
              className="flex -translate-y-2 cursor-pointer items-center justify-between gap-4"
            >
              <span className="text-sm">{t("allowHigherModsToModerateLower")}</span>
              <Switch
                id="allowHigherModsToModerateLower"
                name="allowHigherModsToModerateLower"
                defaultChecked={current.allowHigherModsToModerateLower}
              />
            </label>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="trustedAdminRoleIds">{t("trustedAdminRoles")}</Label>
              <RolePicker
                id="trustedAdminRoleIds"
                name="trustedAdminRoleIds"
                roles={roles}
                defaultSelectedIds={currentBot.trustedAdminRoleIds}
                addLabel={t("addRole")}
                emptyLabel={t("rolesUnavailable")}
              />
              <p className="text-xs text-muted-foreground">{t("trustedAdminRolesHint")}</p>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col divide-y divide-border/60 p-0">
          <div className="px-6 py-4">
            <span className="text-sm font-medium">{t("memberJoiningTitle")}</span>
          </div>
          <div className="flex flex-col divide-y divide-border/60">
            <div className="flex flex-col gap-1.5 px-6 py-4">
              <Label htmlFor="defaultRoleIds" className="-translate-y-3">
                {t("defaultRoles")}
              </Label>
              <div className="-translate-y-2">
                <RolePicker
                  id="defaultRoleIds"
                  name="defaultRoleIds"
                  roles={roles}
                  defaultSelectedIds={currentBot.defaultRoleIds}
                  addLabel={t("addRole")}
                  emptyLabel={t("rolesUnavailable")}
                />
              </div>
              <p className="-translate-y-1 text-xs text-muted-foreground">
                {t("defaultRolesHint")}
              </p>
            </div>

            <div className="flex flex-col gap-4 px-6 py-4">
              <label
                htmlFor="alwaysAssignDefaultRoles"
                className="flex cursor-pointer items-center justify-between gap-4"
              >
                <span className="text-sm">{t("alwaysAssignDefaultRoles")}</span>
                <Switch
                  id="alwaysAssignDefaultRoles"
                  name="alwaysAssignDefaultRoles"
                  defaultChecked={currentBot.alwaysAssignDefaultRoles}
                />
              </label>
              <label
                htmlFor="restoreNicknameOnRejoin"
                className="flex cursor-pointer items-center justify-between gap-4"
              >
                <span className="text-sm">{t("restoreNickname")}</span>
                <Switch
                  id="restoreNicknameOnRejoin"
                  name="restoreNicknameOnRejoin"
                  defaultChecked={currentBot.restoreNicknameOnRejoin}
                />
              </label>
              <label
                htmlFor="restoreOldRolesOnRejoin"
                className="flex cursor-pointer items-center justify-between gap-4"
              >
                <span className="text-sm">{t("restoreOldRoles")}</span>
                <Switch
                  id="restoreOldRolesOnRejoin"
                  name="restoreOldRolesOnRejoin"
                  defaultChecked={currentBot.restoreOldRolesOnRejoin}
                />
              </label>
            </div>

            <div className="grid gap-4 px-6 py-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="restorableRoleIds">{t("restorableRoles")}</Label>
                <RolePicker
                  id="restorableRoleIds"
                  name="restorableRoleIds"
                  roles={roles}
                  defaultSelectedIds={currentBot.restorableRoleIds}
                  addLabel={t("addRole")}
                  emptyLabel={t("rolesUnavailable")}
                />
                <p className="text-xs text-muted-foreground">{t("restorableRolesHint")}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="exemptRoleIds">{t("exemptRoles")}</Label>
                <RolePicker
                  id="exemptRoleIds"
                  name="exemptRoleIds"
                  roles={roles}
                  defaultSelectedIds={currentBot.exemptRoleIds}
                  addLabel={t("addRole")}
                  emptyLabel={t("rolesUnavailable")}
                />
                <p className="text-xs text-muted-foreground">{t("exemptRolesHint")}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col divide-y divide-border/60 p-0">
          <div className="px-6 py-4">
            <span className="text-sm font-medium">{t("automodTitle")}</span>
          </div>
          {AUTOMOD_FILTERS.map((key) => (
            <div key={key} className="flex items-center justify-between gap-4 px-6 py-2.5">
              <label htmlFor={key} className="flex flex-1 -translate-y-2 cursor-pointer flex-col gap-1">
                <span className="text-sm leading-none">{t(`filters.${key}.label`)}</span>
                <span className="text-xs leading-none text-muted-foreground">
                  {t(`filters.${key}.description`)}
                </span>
              </label>
              <div className="flex -translate-y-2 items-center gap-1">
                <FilterSettingsSheet
                  filterType={key}
                  filterLabel={t(`filters.${key}.label`)}
                  config={filterConfigs.get(key) ?? DEFAULT_FILTER_CONFIG}
                  roles={roles}
                  channels={channels}
                  botRolePosition={botRolePosition}
                  action={saveFilterConfig.bind(null, key)}
                  labels={filterSheetLabels}
                />
                <Switch id={key} name={key} defaultChecked={current[key]} />
              </div>
            </div>
          ))}
        </Card>

        <Card className="flex flex-col divide-y divide-border/60 p-0">
          <div className="px-6 py-4">
            <span className="text-sm font-medium">{t("muteTitle")}</span>
          </div>
          <div className="flex flex-col gap-4 px-6 py-4">
            <label
              htmlFor="muteBlocksReactions"
              className="flex cursor-pointer items-center justify-between gap-4"
            >
              <span className="flex -translate-y-3 flex-col gap-1">
                <span className="text-sm leading-none">{t("muteBlocksReactions")}</span>
                <span className="text-xs leading-none text-muted-foreground">
                  {t("muteBlocksReactionsHint")}
                </span>
              </span>
              <Switch
                id="muteBlocksReactions"
                name="muteBlocksReactions"
                defaultChecked={current.muteBlocksReactions}
                className="-translate-y-3"
              />
            </label>
            <MuteSettingsFields
              roles={roles}
              defaultMuteMode={current.muteMode}
              defaultMuteRoleId={current.muteRoleId}
              botRolePosition={botRolePosition}
              labels={{
                muteMode: t("muteMode"),
                muteModeHint: t("muteModeHint"),
                muteModeTimeout: t("muteModeTimeout"),
                muteModeRole: t("muteModeRole"),
                muteModeBoth: t("muteModeBoth"),
                muteRoleId: t("muteRoleId"),
                muteRoleIdHint: t("muteRoleIdHint"),
                muteRoleIdPlaceholder: t("muteRoleIdPlaceholder"),
                rolesUnavailable: t("rolesUnavailable"),
                hierarchyWarning: t("hierarchyWarning"),
              }}
            />
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              {t("timeoutLimitNotice")}
            </p>
          </div>
        </Card>

        <SubmitButton pendingLabel={t("saving")} className="w-fit">
          {t("save")}
        </SubmitButton>
      </SaveForm>
    </div>
  );
}
