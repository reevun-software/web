import { Moon } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { getModuleStates } from "@/lib/guild-modules";
import { getBotAfkSessions, getBotGuildMembers } from "@/lib/bot-api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ModuleDisabledNotice } from "@/components/dashboard/module-disabled-notice";
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
  const [t, tDash, locale, moduleStates] = await Promise.all([
    getTranslations("Dashboard.afk"),
    getTranslations("Dashboard"),
    getLocale(),
    getModuleStates(guildId),
  ]);

  if (!moduleStates.afk) {
    return <ModuleDisabledNotice title={tDash("moduleDisabledTitle")} body={tDash("moduleDisabledBody")} />;
  }

  const [sessionsRaw, members] = await Promise.all([
    getBotAfkSessions(guildId),
    getBotGuildMembers(guildId),
  ]);
  const sessions = [...sessionsRaw].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
  const usernames = new Map(members.map((m) => [m.discordId, m.username]));

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
      <div className="flex items-center gap-2">
        <Moon className="size-5 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      </div>
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
            const username = usernames.get(s.userId) ?? s.userId;
            return (
              <TableRow key={s.userId}>
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
                  {new Date(s.startedAt).toLocaleString(locale)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
