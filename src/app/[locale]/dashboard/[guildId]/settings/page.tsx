import { and, eq } from "drizzle-orm";
import { Settings, Lock, ShieldOff } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { guilds, guildBotSettings, guildModules, guildDepartments, guildMembers } from "@/lib/db/schema";
import { getGuildRoles } from "@/lib/discord-guild";
import { auth } from "@/lib/auth";
import { getModuleStates } from "@/lib/guild-modules";
import { MODULE_KEYS } from "@/lib/modules";
import { getMajesticOnline, getRussiaOnlineOnline, getGta5rpOnline } from "@/lib/online-monitoring";
import { LOCALES, LOCALE_META } from "@/i18n/routing";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RolePicker } from "@/components/dashboard/role-picker";
import { ColorInput } from "@/components/dashboard/color-input";
import { SaveForm } from "@/components/dashboard/save-form";
import { SubmitButton } from "@/components/dashboard/submit-button";
import { DepartmentsManager } from "@/components/dashboard/departments-manager";
import { ProjectServerSelector } from "@/components/dashboard/project-server-selector";

export default async function SettingsPage({
  params,
}: PageProps<"/[locale]/dashboard/[guildId]/settings">) {
  const { guildId } = await params;
  const t = await getTranslations("Dashboard.settings");
  const [
    session,
    [guild],
    [botSettings],
    roles,
    moduleStates,
    departments,
    members,
    majestic,
    russiaOnline,
    gta5rp,
  ] = await Promise.all([
    auth(),
    db.select().from(guilds).where(eq(guilds.id, guildId)).limit(1),
    db.select().from(guildBotSettings).where(eq(guildBotSettings.guildId, guildId)).limit(1),
    getGuildRoles(guildId),
    getModuleStates(guildId),
    db.select().from(guildDepartments).where(eq(guildDepartments.guildId, guildId)),
    db.select().from(guildMembers).where(eq(guildMembers.guildId, guildId)),
    getMajesticOnline(),
    getRussiaOnlineOnline(),
    getGta5rpOnline(),
  ]);

  const isOwner = !!session?.discordId && session.discordId === guild?.ownerDiscordId;

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
    const project = isOwner ? (formData.get("project") as string) || null : current.project;
    const server = isOwner
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
      trustedAdminRoleIds: formData.getAll("trustedAdminRoleIds") as string[],
      defaultRoleIds: formData.getAll("defaultRoleIds") as string[],
      alwaysAssignDefaultRoles: formData.get("alwaysAssignDefaultRoles") === "on",
      restoreNicknameOnRejoin: formData.get("restoreNicknameOnRejoin") === "on",
      restoreOldRolesOnRejoin: formData.get("restoreOldRolesOnRejoin") === "on",
      restorableRoleIds: formData.getAll("restorableRoleIds") as string[],
      exemptRoleIds: formData.getAll("exemptRoleIds") as string[],
      project,
      server,
      updatedAt: new Date(),
    };

    await db
      .insert(guildBotSettings)
      .values(values)
      .onConflictDoUpdate({ target: guildBotSettings.guildId, set: values });

    if (isOwner) {
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
    }

    revalidatePath(`/dashboard/${guildId}/settings`);
    revalidatePath(`/dashboard/${guildId}/monitoring`);
    revalidatePath(`/dashboard/${guildId}`, "layout");
  }

  async function createDepartment(name: string) {
    "use server";
    if (!isOwner || !name.trim()) return;
    await db.insert(guildDepartments).values({ guildId, name: name.trim() });
    revalidatePath(`/dashboard/${guildId}/settings`);
  }

  async function deleteDepartment(id: number) {
    "use server";
    if (!isOwner) return;
    await db
      .delete(guildDepartments)
      .where(and(eq(guildDepartments.id, id), eq(guildDepartments.guildId, guildId)));
    revalidatePath(`/dashboard/${guildId}/settings`);
  }

  async function updateDepartmentMembers(id: number, memberIds: string[]) {
    "use server";
    if (!isOwner) return;
    await db
      .update(guildDepartments)
      .set({ memberDiscordIds: memberIds })
      .where(and(eq(guildDepartments.id, id), eq(guildDepartments.guildId, guildId)));
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
      <Card className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">{t("name")}</Label>
          <div className="relative">
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
      </Card>

      <div className="flex flex-col gap-4">
        <Card className="flex flex-col gap-4 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="interfaceLanguage">{t("interfaceLanguage")}</Label>
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
        </Card>

        <Card className="flex flex-col divide-y divide-border/60 p-0">
          <div className="px-6 py-4">
            <span className="text-sm font-medium">{t("accessSecurityTitle")}</span>
          </div>
          <div className="flex flex-col gap-1.5 px-6 py-4">
            <Label htmlFor="trustedAdminRoleIds" className="-translate-y-3">
              {t("trustedAdminRoles")}
            </Label>
            <div className="-translate-y-2">
              <RolePicker
                id="trustedAdminRoleIds"
                name="trustedAdminRoleIds"
                roles={roles}
                defaultSelectedIds={current.trustedAdminRoleIds}
                addLabel={t("selectRoles")}
                emptyLabel={t("rolesUnavailable")}
              />
            </div>
            <p className="text-xs text-muted-foreground">{t("trustedAdminRolesHint")}</p>
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
                  defaultSelectedIds={current.defaultRoleIds}
                  addLabel={t("selectRoles")}
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
                  defaultChecked={current.alwaysAssignDefaultRoles}
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
                  defaultChecked={current.restoreNicknameOnRejoin}
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
                  defaultChecked={current.restoreOldRolesOnRejoin}
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
                  defaultSelectedIds={current.restorableRoleIds}
                  addLabel={t("selectRoles")}
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
                  defaultSelectedIds={current.exemptRoleIds}
                  addLabel={t("selectRoles")}
                  emptyLabel={t("rolesUnavailable")}
                />
                <p className="text-xs text-muted-foreground">{t("exemptRolesHint")}</p>
              </div>
            </div>
          </div>
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
                <span className="text-sm font-medium">{t("projectTitle")}</span>
              </div>
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
            </Card>

            <Card className="flex flex-col divide-y divide-border/60 p-0">
              <div className="px-6 py-4">
                <span className="text-sm font-medium">{t("modulesTitle")}</span>
                <p className="text-xs text-muted-foreground">{t("modulesHint")}</p>
              </div>
              <div className="-translate-y-2 flex flex-col gap-4 px-6 py-4">
                {(
                  [
                    ["warnings", t("moduleWarnings")],
                    ["tickets", t("moduleTickets")],
                    ["afk", t("moduleAfk")],
                    ["blacklist", t("moduleBlacklist")],
                    ["departments", t("moduleDepartments")],
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
                <p className="text-xs text-muted-foreground">
                  {moduleStates.departments ? t("departmentsHint") : t("departmentsDisabledHint")}
                </p>
              </div>
              {moduleStates.departments && (
                <div className="-translate-y-2 px-6 py-4">
                  <DepartmentsManager
                    departments={departments}
                    members={members.map((m) => ({
                      discordUserId: m.discordUserId,
                      username: m.username,
                    }))}
                    createDepartment={createDepartment}
                    deleteDepartment={deleteDepartment}
                    updateDepartmentMembers={updateDepartmentMembers}
                    labels={{
                      addDepartment: t("addDepartment"),
                      namePlaceholder: t("departmentNamePlaceholder"),
                      noDepartments: t("noDepartments"),
                      members: t("departmentMembers"),
                      addMembers: t("addMembers"),
                      noMembers: t("noMembers"),
                      searchMembers: t("searchMembers"),
                      delete: t("deleteDepartment"),
                    }}
                  />
                </div>
              )}
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
