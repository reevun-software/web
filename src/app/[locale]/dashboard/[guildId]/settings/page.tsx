import { and, eq } from "drizzle-orm";
import { Settings, Lock, ShieldOff } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { guildBotSettings, guildModules } from "@/lib/db/schema";
import { getGuildRoles, getGuildChannels } from "@/lib/discord-guild";
import { getGuild } from "@/lib/guilds";
import {
  getBotGuildConfig,
  updateBotGuildConfig,
  getBotGuildMembers,
  getBotGuildDepartments,
  createBotGuildDepartment,
  deleteBotGuildDepartment,
  updateBotGuildDepartment,
  type RankDefinition,
  type DepartmentQuestion,
  type WarnPunishmentMode,
} from "@/lib/bot-api";
import { getModuleStates } from "@/lib/guild-modules";
import { requireGuildManager, isGuildOwner } from "@/lib/guild-auth";
import { MODULE_KEYS } from "@/lib/modules";
import { getMajesticOnline, getRussiaOnlineOnline, getGta5rpOnline } from "@/lib/online-monitoring";
import { LOCALES, LOCALE_META } from "@/i18n/routing";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ColorInput } from "@/components/dashboard/color-input";
import { SaveForm } from "@/components/dashboard/save-form";
import { SubmitButton } from "@/components/dashboard/submit-button";
import { DepartmentsManager } from "@/components/dashboard/departments-manager";
import { BotConfigManager } from "@/components/dashboard/bot-config-manager";
import { WarnRolesManager } from "@/components/dashboard/warn-roles-manager";
import { ProjectServerSelector } from "@/components/dashboard/project-server-selector";

export default async function SettingsPage({
  params,
}: PageProps<"/[locale]/dashboard/[guildId]/settings">) {
  const { guildId } = await params;
  const t = await getTranslations("Dashboard.settings");
  const [
    guild,
    [botSettings],
    roles,
    channels,
    botConfig,
    moduleStates,
    departments,
    members,
    majestic,
    russiaOnline,
    gta5rp,
    isOwner,
  ] = await Promise.all([
    getGuild(guildId),
    db.select().from(guildBotSettings).where(eq(guildBotSettings.guildId, guildId)).limit(1),
    getGuildRoles(guildId),
    getGuildChannels(guildId),
    getBotGuildConfig(guildId),
    getModuleStates(guildId),
    getBotGuildDepartments(guildId),
    getBotGuildMembers(guildId),
    getMajesticOnline(),
    getRussiaOnlineOnline(),
    getGta5rpOnline(),
    isGuildOwner(guildId),
  ]);

  const citiesByProject = {
    majestic: majestic?.cities ?? [],
    russiaonline: russiaOnline?.cities ?? [],
    gta5rp: gta5rp?.cities ?? [],
  };

  const current = botSettings ?? {
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

  async function saveAll(formData: FormData) {
    "use server";
    await requireGuildManager(guildId);
    const freshIsOwner = await isGuildOwner(guildId);
    const project = freshIsOwner ? (formData.get("project") as string) || null : current.project;
    const server = freshIsOwner
      ? project
        ? (formData.get("server") as string) || null
        : null
      : current.server;

    const values = {
      guildId,
      interfaceLanguage: (formData.get("interfaceLanguage") as string) || "ru",
      systemMessageColor: (formData.get("systemMessageColor") as string) || "#79040C",
      enableSlashCommands: formData.get("enableSlashCommands") === "on",
      enableTextCommands: formData.get("enableTextCommands") === "on",
      // Trusted-admin roles and member-joining behavior moved to the
      // Security page's own form - carry the current values forward here
      // instead of reading formData, since this form no longer submits them.
      trustedAdminRoleIds: current.trustedAdminRoleIds,
      defaultRoleIds: current.defaultRoleIds,
      alwaysAssignDefaultRoles: current.alwaysAssignDefaultRoles,
      restoreNicknameOnRejoin: current.restoreNicknameOnRejoin,
      restoreOldRolesOnRejoin: current.restoreOldRolesOnRejoin,
      restorableRoleIds: current.restorableRoleIds,
      exemptRoleIds: current.exemptRoleIds,
      project,
      server,
      updatedAt: new Date(),
    };

    await db
      .insert(guildBotSettings)
      .values(values)
      .onConflictDoUpdate({ target: guildBotSettings.guildId, set: values });

    if (freshIsOwner) {
      for (const key of MODULE_KEYS) {
        const enabled = formData.get(key) === "on";
        if (enabled) {
          await db
            .delete(guildModules)
            .where(and(eq(guildModules.guildId, guildId), eq(guildModules.moduleKey, key)));
        } else {
          const moduleValues = { guildId, moduleKey: key, enabled: false, updatedAt: new Date() };
          await db
            .insert(guildModules)
            .values(moduleValues)
            .onConflictDoUpdate({
              target: [guildModules.guildId, guildModules.moduleKey],
              set: moduleValues,
            });
        }
      }

      // Bot-owned config (roles, channels, ranks) - the BotConfigManager
      // card's fields live in this same page form now, not a separate one.
      const rankKeys = [...new Set(formData.getAll("rankKeys") as string[])];
      const rankRoleIds: Record<string, RankDefinition> = {};
      for (const key of rankKeys) {
        const number = formData.get(`rank-${key}-number`);
        if (!number) continue;
        const label = String(formData.get(`rank-${key}-label`) || number);
        rankRoleIds[String(number)] = {
          roleIds: formData.getAll(`rank-${key}-roles`) as string[],
          label,
          nicknamePrefix: String(formData.get(`rank-${key}-nickname`) || label),
        };
      }

      await updateBotGuildConfig(guildId, {
        // leadershipRoleIds is not submitted by this form - it's kept in
        // sync with the Security page's "Роли администраторов" instead.
        verifiedMemberRoleId: (formData.get("verifiedMemberRoleId") as string) || null,
        logChannelId: (formData.get("logChannelId") as string) || null,
        applicationsChannelId: (formData.get("applicationsChannelId") as string) || null,
        applicationPanelChannelId: (formData.get("applicationPanelChannelId") as string) || null,
        supportPanelChannelId: (formData.get("supportPanelChannelId") as string) || null,
        adminPanelChannelId: (formData.get("adminPanelChannelId") as string) || null,
        warnRoleIds: {
          1: (formData.get("warnRole1") as string) || "",
          2: (formData.get("warnRole2") as string) || "",
        },
        warnPunishmentMode: (formData.get("warnPunishmentMode") as WarnPunishmentMode) || "stripRoles",
        warnPunishmentRoleId: (formData.get("warnPunishmentRoleId") as string) || null,
        rankRoleIds,
      });
    }

    revalidatePath(`/dashboard/${guildId}/settings`);
    revalidatePath(`/dashboard/${guildId}/monitoring`);
    revalidatePath(`/dashboard/${guildId}`, "layout");
  }

  // Re-checked fresh here, not the render-time `isOwner` read above - this
  // closure is bound once at page render and never re-runs, so a tab that
  // loaded before ownership changed would otherwise keep acting on stale
  // permissions forever.
  async function createDepartment(name: string) {
    "use server";
    if (!name.trim() || !(await isGuildOwner(guildId))) return;
    await createBotGuildDepartment(guildId, name.trim());
    revalidatePath(`/dashboard/${guildId}/settings`);
  }

  async function deleteDepartment(id: number) {
    "use server";
    if (!(await isGuildOwner(guildId))) return;
    await deleteBotGuildDepartment(guildId, id);
    revalidatePath(`/dashboard/${guildId}/settings`);
  }

  async function updateDepartmentMembers(id: number, memberIds: string[]) {
    "use server";
    if (!(await isGuildOwner(guildId))) return;
    await updateBotGuildDepartment(guildId, id, { memberDiscordIds: memberIds });
    revalidatePath(`/dashboard/${guildId}/settings`);
  }

  async function updateDepartmentQuestions(id: number, formData: FormData) {
    "use server";
    if (!(await isGuildOwner(guildId))) return;
    const keys = [...new Set(formData.getAll("questionKeys") as string[])];
    const questions: DepartmentQuestion[] = [];
    for (const key of keys) {
      const label = String(formData.get(`q-${key}-label`) || "").trim();
      if (!label) continue;
      questions.push({
        id: key,
        label,
        style: formData.get(`q-${key}-style`) === "paragraph" ? "paragraph" : "short",
        required: formData.get(`q-${key}-required`) === "on",
      });
    }
    await updateBotGuildDepartment(guildId, id, { questions: questions.slice(0, 4) });
    revalidatePath(`/dashboard/${guildId}/settings`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Settings className="size-5 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      </div>

      <SaveForm action={saveAll} savedMessage={t("saved")} className="flex flex-col gap-4">
      <div className="grid items-start gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        <Card className="flex flex-col divide-y divide-border/60 p-0">
          <div className="px-6 py-4">
            <span className="text-sm font-medium">{t("generalSettingsTitle")}</span>
          </div>
          <div className="flex flex-col gap-4 px-6 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="-translate-y-3">{t("name")}</Label>
              <div className="relative -translate-y-2">
                <Input id="name" defaultValue={guild?.name} disabled className="pr-9" />
                <Lock
                  className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="id">{t("serverId")}</Label>
              <div className="relative">
                <Input id="id" defaultValue={guildId} disabled className="pr-9 font-mono" />
                <Lock
                  className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{t("note")}</p>
          </div>

          <div className="flex flex-col gap-4 px-6 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="interfaceLanguage" className="-translate-y-3">{t("interfaceLanguage")}</Label>
                {/* This page is a Server Component - a SelectValue children
                    render-function (the pattern used elsewhere in this
                    codebase, e.g. mute-settings-fields.tsx) only works from a
                    "use client" parent, since a plain function can't cross
                    the server/client boundary as a prop. The `items` map is
                    plain serializable data, so it works from here instead. */}
                <Select
                  name="interfaceLanguage"
                  defaultValue={current.interfaceLanguage}
                  items={Object.fromEntries(LOCALES.map((l) => [l, LOCALE_META[l].label]))}
                >
                  <SelectTrigger id="interfaceLanguage" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCALES.map((locale) => (
                      <SelectItem key={locale} value={locale}>
                        {LOCALE_META[locale].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="systemMessageColor">{t("systemMessageColor")}</Label>
                <ColorInput name="systemMessageColor" defaultValue={current.systemMessageColor} />
              </div>
            </div>

            <label htmlFor="enableSlashCommands" className="flex cursor-pointer items-center justify-between gap-4">
              <span className="text-sm">{t("enableSlashCommands")}</span>
              <Switch
                id="enableSlashCommands"
                name="enableSlashCommands"
                defaultChecked={current.enableSlashCommands}
              />
            </label>
            <label htmlFor="enableTextCommands" className="flex cursor-pointer items-center justify-between gap-4">
              <span className="text-sm">{t("enableTextCommands")}</span>
              <Switch
                id="enableTextCommands"
                name="enableTextCommands"
                defaultChecked={current.enableTextCommands}
              />
            </label>
          </div>

          {isOwner && (
            <div className="-translate-y-2 flex flex-col gap-1.5 px-6 py-4">
              <ProjectServerSelector
                defaultProject={current.project}
                defaultServer={current.server}
                citiesByProject={citiesByProject}
                labels={{
                  projectLabel: t("projectLabel"),
                  serverLabel: t("serverLabel"),
                  projectNone: t("projectNone"),
                  serverNone: t("serverNone"),
                  majestic: t("projectMajestic"),
                  russiaonline: t("projectRussiaOnline"),
                  gta5rp: t("projectGta5rp"),
                }}
              />
              <p className="text-xs text-muted-foreground">{t("projectHint")}</p>
            </div>
          )}
        </Card>
      </div>
      </div>

      <div className="flex flex-col gap-4">
        {!isOwner ? (
          <Card className="flex flex-col items-center gap-2 p-8 text-center">
            <ShieldOff className="size-6 text-muted-foreground" strokeWidth={1.5} />
            <span className="text-sm font-medium">{t("ownerOnlyTitle")}</span>
            <p className="max-w-[36ch] text-sm text-muted-foreground">{t("ownerOnlyBody")}</p>
          </Card>
        ) : (
          <>
            <Card className="flex flex-col divide-y divide-border/60 p-0">
              <div className="px-6 py-4">
                <span className="text-sm font-medium">{t("modulesTitle")}</span>
                <p className="text-xs text-muted-foreground">{t("modulesHint")}</p>
              </div>
              <div className="flex flex-col gap-4 px-6 py-4">
                {(
                  [
                    ["warnings", t("moduleWarnings")],
                    ["tickets", t("moduleTickets")],
                    ["afk", t("moduleAfk")],
                    ["blacklist", t("moduleBlacklist")],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} htmlFor={key} className="flex cursor-pointer items-center justify-between gap-4">
                    <span className="text-sm">{label}</span>
                    <Switch id={key} name={key} defaultChecked={moduleStates[key]} />
                  </label>
                ))}
              </div>
            </Card>

            <Card className="flex flex-col divide-y divide-border/60 p-0">
              <div className="px-6 py-4">
                <span className="text-sm font-medium">{t("departmentsTitle")}</span>
                <p className="text-xs text-muted-foreground">{t("departmentsHint")}</p>
              </div>
              <div className="-translate-y-2 px-6 py-4">
                <DepartmentsManager
                  departments={departments}
                  members={members.map((m) => ({
                    discordUserId: m.discordId,
                    username: m.username,
                  }))}
                  createDepartment={createDepartment}
                  deleteDepartment={deleteDepartment}
                  updateDepartmentMembers={updateDepartmentMembers}
                  updateDepartmentQuestions={updateDepartmentQuestions}
                  labels={{
                    addDepartment: t("addDepartment"),
                    namePlaceholder: t("departmentNamePlaceholder"),
                    noDepartments: t("noDepartments"),
                    members: t("departmentMembers"),
                    addMembers: t("addMembers"),
                    noMembers: t("noMembers"),
                    searchMembers: t("searchMembers"),
                    delete: t("deleteDepartment"),
                    confirmDelete: t("confirmDeleteDepartment"),
                    questionsSettings: t("departmentQuestionsSettings"),
                    questionsHint: t("departmentQuestionsHint"),
                    questionLabel: t("departmentQuestionLabel"),
                    questionStyle: t("departmentQuestionStyle"),
                    styleShort: t("departmentQuestionStyleShort"),
                    styleParagraph: t("departmentQuestionStyleParagraph"),
                    required: t("departmentQuestionRequired"),
                    addQuestion: t("departmentAddQuestion"),
                    noQuestions: t("departmentNoQuestions"),
                    save: t("save"),
                    saving: t("saving"),
                    saved: t("saved"),
                  }}
                />
              </div>
            </Card>

            <Card className="flex flex-col divide-y divide-border/60 p-0">
              <div className="px-6 py-4">
                <span className="text-sm font-medium">{t("warnRolesTitle")}</span>
                <p className="text-xs text-muted-foreground">{t("warnRolesHint")}</p>
              </div>
              <div className="-translate-y-2 px-6 py-4">
                <WarnRolesManager
                  roles={roles}
                  defaultWarnRole1={botConfig.warnRoleIds["1"] ?? null}
                  defaultWarnRole2={botConfig.warnRoleIds["2"] ?? null}
                  defaultPunishmentMode={botConfig.warnPunishmentMode}
                  defaultPunishmentRoleId={botConfig.warnPunishmentRoleId}
                  labels={{
                    warnRole1: t("botWarnRole1"),
                    warnRole2: t("botWarnRole2"),
                    roleNone: t("botRoleNone"),
                    rolesUnavailable: t("rolesUnavailable"),
                    punishmentMode: t("warnPunishmentMode"),
                    punishmentModeHint: t("warnPunishmentModeHint"),
                    punishmentModeStripRoles: t("warnPunishmentModeStripRoles"),
                    punishmentModeKick: t("warnPunishmentModeKick"),
                    punishmentModeBan: t("warnPunishmentModeBan"),
                    punishmentModeAssignRole: t("warnPunishmentModeAssignRole"),
                    punishmentRole: t("warnPunishmentRole"),
                    punishmentRolePlaceholder: t("botRoleNone"),
                  }}
                />
              </div>
            </Card>

            <Card className="flex flex-col divide-y divide-border/60 p-0">
              <div className="px-6 py-4">
                <span className="text-sm font-medium">{t("botConfigTitle")}</span>
                <p className="text-xs text-muted-foreground">{t("botConfigHint")}</p>
              </div>
              <div className="-translate-y-2 px-6 py-4">
                <BotConfigManager
                  roles={roles}
                  channels={channels}
                  initialConfig={botConfig}
                  labels={{
                    selectRoles: t("selectRoles"),
                    rolesUnavailable: t("rolesUnavailable"),
                    searchRoles: t("searchRoles"),
                    verifiedMemberRole: t("botVerifiedMemberRole"),
                    roleNone: t("botRoleNone"),
                    channelNone: t("botChannelNone"),
                    logChannel: t("botLogChannel"),
                    applicationsChannel: t("botApplicationsChannel"),
                    applicationPanelChannel: t("botApplicationPanelChannel"),
                    supportPanelChannel: t("botSupportPanelChannel"),
                    adminPanelChannel: t("botAdminPanelChannel"),
                    ranksTitle: t("botRanksTitle"),
                    ranksHint: t("botRanksHint"),
                    addRank: t("botAddRank"),
                    rankNumber: t("botRankNumber"),
                    rankLabel: t("botRankLabel"),
                    nicknamePrefix: t("botNicknamePrefix"),
                    noRanks: t("botNoRanks"),
                    delete: t("botDeleteRank"),
                  }}
                />
              </div>
            </Card>
          </>
        )}
      </div>
      </div>

      <SubmitButton pendingLabel={t("saving")} className="w-full">
        {t("save")}
      </SubmitButton>
      </SaveForm>
    </div>
  );
}
