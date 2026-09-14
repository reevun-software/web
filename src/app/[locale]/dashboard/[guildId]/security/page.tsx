import { eq } from "drizzle-orm";
import { ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { guildSecuritySettings, automodFilterConfig } from "@/lib/db/schema";
import { getGuildRoles, getGuildChannels, getBotHighestRolePosition } from "@/lib/discord-guild";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RolePicker } from "@/components/dashboard/role-picker";
import { MuteSettingsFields } from "@/components/dashboard/mute-settings-fields";
import { SubmitButton } from "@/components/dashboard/submit-button";
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
  const [[settings], roles, channels, botRolePosition, filterConfigRows] = await Promise.all([
    db
      .select()
      .from(guildSecuritySettings)
      .where(eq(guildSecuritySettings.guildId, guildId))
      .limit(1),
    getGuildRoles(guildId),
    getGuildChannels(guildId),
    getBotHighestRolePosition(guildId),
    db.select().from(automodFilterConfig).where(eq(automodFilterConfig.guildId, guildId)),
  ]);

  const current = settings ?? {
    moderatorRoleIds: [] as string[],
    filterLinks: false,
    filterInvites: true,
    filterScamLinks: true,
    filterBadWords: false,
    filterCapsLock: false,
    filterMentionSpam: false,
    muteMode: "timeout",
    muteRoleId: null as string | null,
  };

  const filterConfigs = new Map(filterConfigRows.map((row) => [row.filterType, row]));

  async function save(formData: FormData) {
    "use server";
    const moderatorRoleIds = formData.getAll("moderatorRoleIds") as string[];
    const muteMode = formData.get("muteMode") as string;
    const muteRoleId = (formData.get("muteRoleId") as string) || null;

    const values = {
      guildId,
      moderatorRoleIds,
      filterLinks: formData.get("filterLinks") === "on",
      filterInvites: formData.get("filterInvites") === "on",
      filterScamLinks: formData.get("filterScamLinks") === "on",
      filterBadWords: formData.get("filterBadWords") === "on",
      filterCapsLock: formData.get("filterCapsLock") === "on",
      filterMentionSpam: formData.get("filterMentionSpam") === "on",
      muteMode: muteMode || "timeout",
      muteRoleId,
      updatedAt: new Date(),
    };

    await db
      .insert(guildSecuritySettings)
      .values(values)
      .onConflictDoUpdate({ target: guildSecuritySettings.guildId, set: values });
    revalidatePath(`/dashboard/${guildId}/security`);
  }

  async function saveFilterConfig(filterType: string, formData: FormData) {
    "use server";
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
    settingsButtonLabel: t("filterSettings.settingsButtonLabel"),
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-5 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      </div>

      <form action={save} className="flex flex-col gap-4">
        <Card className="flex flex-col gap-3 p-6">
          <span className="text-sm font-medium">{t("moderatorsTitle")}</span>
          <div className="flex flex-col gap-2">
            <Label>{t("moderatorRoleIds")}</Label>
            <RolePicker
              name="moderatorRoleIds"
              roles={roles}
              defaultSelectedIds={current.moderatorRoleIds}
              botRolePosition={botRolePosition}
              hierarchyWarningLabel={t("hierarchyWarning")}
              addLabel={t("addRole")}
              emptyLabel={t("rolesUnavailable")}
            />
          </div>
        </Card>

        <Card className="flex flex-col divide-y divide-border/60 p-0">
          <div className="px-6 py-4">
            <span className="text-sm font-medium">{t("automodTitle")}</span>
          </div>
          {AUTOMOD_FILTERS.map((key) => (
            <div key={key} className="flex items-center justify-between gap-4 px-6 py-3">
              <label htmlFor={key} className="flex flex-1 cursor-pointer flex-col gap-0.5">
                <span className="text-sm">{t(`filters.${key}.label`)}</span>
                <span className="text-xs text-muted-foreground">
                  {t(`filters.${key}.description`)}
                </span>
              </label>
              <div className="flex items-center gap-1">
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

        <Card className="flex flex-col gap-3 p-6">
          <span className="text-sm font-medium">{t("muteTitle")}</span>
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
        </Card>

        <SubmitButton pendingLabel={t("saving")} className="w-fit">
          {t("save")}
        </SubmitButton>
      </form>
    </div>
  );
}
