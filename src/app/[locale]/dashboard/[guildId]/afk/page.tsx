import { desc, eq } from "drizzle-orm";
import { Moon } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { afkSessions, guildMembers } from "@/lib/db/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AfkPage({
  params,
}: PageProps<"/[locale]/dashboard/[guildId]/afk">) {
  const { guildId } = await params;
  const [t, locale] = await Promise.all([
    getTranslations("Dashboard.afk"),
    getLocale(),
  ]);
  const [sessions, members] = await Promise.all([
    db
      .select()
      .from(afkSessions)
      .where(eq(afkSessions.guildId, guildId))
      .orderBy(desc(afkSessions.startedAt)),
    db.select().from(guildMembers).where(eq(guildMembers.guildId, guildId)),
  ]);
  const usernames = new Map(members.map((m) => [m.discordUserId, m.username]));

  if (sessions.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
        <Moon className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-lg font-medium">{t("emptyTitle")}</h1>
        <p className="max-w-[42ch] text-sm text-muted-foreground">{t("emptyBody")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("colMember")}</TableHead>
            <TableHead>{t("colReason")}</TableHead>
            <TableHead>{t("colSince")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((s) => {
            const username = usernames.get(s.discordUserId) ?? s.discordUserId;
            return (
              <TableRow key={s.discordUserId}>
                <TableCell className="flex items-center gap-2.5">
                  <Avatar className="size-7">
                    <AvatarFallback className="text-xs">{username[0]}</AvatarFallback>
                  </Avatar>
                  {username}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {s.reason ?? t("noReason")}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {s.startedAt.toLocaleString(locale)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
