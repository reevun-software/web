import { desc, eq } from "drizzle-orm";
import { Ban as BanIcon } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { bans } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function BlacklistPage({
  params,
}: PageProps<"/[locale]/dashboard/[guildId]/blacklist">) {
  const { guildId } = await params;
  const [t, locale] = await Promise.all([
    getTranslations("Dashboard.blacklist"),
    getLocale(),
  ]);
  const rows = await db
    .select()
    .from(bans)
    .where(eq(bans.guildId, guildId))
    .orderBy(desc(bans.createdAt));

  async function addBan(formData: FormData) {
    "use server";
    const discordUserId = (formData.get("discordUserId") as string)?.trim() || null;
    const characterName = (formData.get("characterName") as string)?.trim() || null;
    const reason = (formData.get("reason") as string)?.trim();
    if (!reason || (!discordUserId && !characterName)) return;
    const staff = await auth();
    if (!staff?.discordId) return;

    await db.insert(bans).values({
      guildId,
      discordUserId,
      characterName,
      reason,
      issuedBy: staff.discordId,
    });
    revalidatePath(`/dashboard/${guildId}/blacklist`);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>

      <Card className="p-5">
        <form action={addBan} className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr_auto] sm:items-end">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="discordUserId">{t("discordId")}</Label>
            <Input id="discordUserId" name="discordUserId" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="characterName">{t("characterName")}</Label>
            <Input id="characterName" name="characterName" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="reason">{t("reason")}</Label>
            <Input id="reason" name="reason" required />
          </div>
          <Button type="submit" className="cursor-pointer">
            {t("add")}
          </Button>
        </form>
      </Card>

      {rows.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
          <BanIcon className="size-8 text-muted-foreground" strokeWidth={1.5} />
          <h2 className="text-lg font-medium">{t("emptyTitle")}</h2>
          <p className="max-w-[42ch] text-sm text-muted-foreground">{t("emptyBody")}</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("colTarget")}</TableHead>
              <TableHead>{t("colReason")}</TableHead>
              <TableHead>{t("colDate")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  {row.characterName ?? row.discordUserId ?? "—"}
                  {row.characterName && row.discordUserId ? (
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {row.discordUserId}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="text-muted-foreground">{row.reason}</TableCell>
                <TableCell className="text-muted-foreground">
                  {row.createdAt.toLocaleDateString(locale)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
