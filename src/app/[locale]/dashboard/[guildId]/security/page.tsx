import { eq } from "drizzle-orm";
import { ShieldCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { guildSecuritySettings } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const AUTOMOD_FILTERS = [
  "filterLinks",
  "filterInvites",
  "filterScamLinks",
  "filterBadWords",
  "filterCapsLock",
  "filterMentionSpam",
] as const;

export default async function SecurityPage({
  params,
}: PageProps<"/[locale]/dashboard/[guildId]/security">) {
  const { guildId } = await params;
  const t = await getTranslations("Dashboard.security");
  const [settings] = await db
    .select()
    .from(guildSecuritySettings)
    .where(eq(guildSecuritySettings.guildId, guildId))
    .limit(1);

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

  async function save(formData: FormData) {
    "use server";
    const moderatorRoleIds = (formData.get("moderatorRoleIds") as string)
      .split(/[\n,]/)
      .map((id) => id.trim())
      .filter(Boolean);
    const muteMode = formData.get("muteMode") as string;
    const muteRoleId = (formData.get("muteRoleId") as string)?.trim() || null;

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-5 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      </div>

      <form action={save} className="flex flex-col gap-4">
        <Card className="flex flex-col gap-3 p-6">
          <span className="text-sm font-medium">{t("moderatorsTitle")}</span>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="moderatorRoleIds">{t("moderatorRoleIds")}</Label>
            <Textarea
              id="moderatorRoleIds"
              name="moderatorRoleIds"
              rows={3}
              defaultValue={current.moderatorRoleIds.join("\n")}
              placeholder={t("moderatorRoleIdsPlaceholder")}
              className="font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground">{t("moderatorRoleIdsNote")}</p>
          </div>
        </Card>

        <Card className="flex flex-col divide-y divide-border/60 p-0">
          <div className="px-6 py-4">
            <span className="text-sm font-medium">{t("automodTitle")}</span>
          </div>
          {AUTOMOD_FILTERS.map((key) => (
            <label
              key={key}
              htmlFor={key}
              className="flex cursor-pointer items-center justify-between gap-4 px-6 py-3"
            >
              <span className="flex flex-col gap-0.5">
                <span className="text-sm">{t(`filters.${key}.label`)}</span>
                <span className="text-xs text-muted-foreground">
                  {t(`filters.${key}.description`)}
                </span>
              </span>
              <Switch id={key} name={key} defaultChecked={current[key]} />
            </label>
          ))}
        </Card>

        <Card className="flex flex-col gap-3 p-6">
          <span className="text-sm font-medium">{t("muteTitle")}</span>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="muteMode">{t("muteMode")}</Label>
            <Select name="muteMode" defaultValue={current.muteMode}>
              <SelectTrigger id="muteMode" className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="timeout">{t("muteModeTimeout")}</SelectItem>
                <SelectItem value="role">{t("muteModeRole")}</SelectItem>
                <SelectItem value="both">{t("muteModeBoth")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="muteRoleId">{t("muteRoleId")}</Label>
            <Input
              id="muteRoleId"
              name="muteRoleId"
              defaultValue={current.muteRoleId ?? ""}
              className="font-mono text-xs sm:w-64"
            />
          </div>
        </Card>

        <Button type="submit" className="w-fit cursor-pointer">
          {t("save")}
        </Button>
      </form>
    </div>
  );
}
