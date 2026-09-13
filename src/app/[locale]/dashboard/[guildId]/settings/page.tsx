import { eq } from "drizzle-orm";
import { Settings } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { guilds } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default async function SettingsPage({
  params,
}: PageProps<"/[locale]/dashboard/[guildId]/settings">) {
  const { guildId } = await params;
  const t = await getTranslations("Dashboard.settings");
  const [guild] = await db
    .select()
    .from(guilds)
    .where(eq(guilds.id, guildId))
    .limit(1);

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div className="flex items-center gap-2">
        <Settings className="size-5 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      </div>
      <Card className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">{t("name")}</Label>
          <Input id="name" defaultValue={guild?.name} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="id">{t("serverId")}</Label>
          <Input id="id" defaultValue={guildId} disabled className="font-mono" />
        </div>
        <p className="text-sm text-muted-foreground">{t("note")}</p>
      </Card>
    </div>
  );
}
