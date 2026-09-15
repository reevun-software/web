import { eq } from "drizzle-orm";
import { Settings, Lock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { guilds, guildBotSettings } from "@/lib/db/schema";
import { getGuildRoles } from "@/lib/discord-guild";
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

export default async function SettingsPage({
  params,
}: PageProps<"/[locale]/dashboard/[guildId]/settings">) {
  const { guildId } = await params;
  const t = await getTranslations("Dashboard.settings");
  const [[guild], [botSettings], roles] = await Promise.all([
    db.select().from(guilds).where(eq(guilds.id, guildId)).limit(1),
    db.select().from(guildBotSettings).where(eq(guildBotSettings.guildId, guildId)).limit(1),
    getGuildRoles(guildId),
  ]);

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
  };

  async function save(formData: FormData) {
    "use server";
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
      updatedAt: new Date(),
    };

    await db
      .insert(guildBotSettings)
      .values(values)
      .onConflictDoUpdate({ target: guildBotSettings.guildId, set: values });
    revalidatePath(`/dashboard/${guildId}/settings`);
  }

  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <div className="flex items-center gap-2">
        <Settings className="size-5 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      </div>

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

      <SaveForm action={save} savedMessage={t("saved")} className="flex flex-col gap-4">
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

        <SubmitButton pendingLabel={t("saving")} className="w-full">
          {t("save")}
        </SubmitButton>
      </SaveForm>
    </div>
  );
}
