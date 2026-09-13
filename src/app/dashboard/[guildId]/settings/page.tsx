import { eq } from "drizzle-orm";
import { Settings } from "lucide-react";
import { db } from "@/lib/db";
import { guilds } from "@/lib/db/schema";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default async function SettingsPage({
  params,
}: PageProps<"/dashboard/[guildId]/settings">) {
  const { guildId } = await params;
  const [guild] = await db
    .select()
    .from(guilds)
    .where(eq(guilds.id, guildId))
    .limit(1);

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <div className="flex items-center gap-2">
        <Settings className="size-5 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-xl font-semibold tracking-tight">Настройки семьи</h1>
      </div>
      <Card className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Название</Label>
          <Input id="name" defaultValue={guild?.name} disabled />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="id">Discord ID сервера</Label>
          <Input id="id" defaultValue={guildId} disabled className="font-mono" />
        </div>
        <p className="text-sm text-muted-foreground">
          Изменение названия и параметров бота выполняется через Discord.
          Здесь появятся настройки, специфичные для панели, когда они
          понадобятся.
        </p>
      </Card>
    </div>
  );
}
