import { eq, desc } from "drizzle-orm";
import { Ticket as TicketIcon } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { getModuleStates } from "@/lib/guild-modules";
import { Badge } from "@/components/ui/badge";
import { ModuleDisabledNotice } from "@/components/dashboard/module-disabled-notice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function TicketsPage({
  params,
}: PageProps<"/[locale]/dashboard/[guildId]/tickets">) {
  const { guildId } = await params;
  const [t, tDash, locale, moduleStates] = await Promise.all([
    getTranslations("Dashboard.tickets"),
    getTranslations("Dashboard"),
    getLocale(),
    getModuleStates(guildId),
  ]);

  if (!moduleStates.tickets) {
    return <ModuleDisabledNotice title={tDash("moduleDisabledTitle")} body={tDash("moduleDisabledBody")} />;
  }

  const rows = await db
    .select()
    .from(tickets)
    .where(eq(tickets.guildId, guildId))
    .orderBy(desc(tickets.createdAt));

  if (rows.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
        <TicketIcon className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-lg font-medium">{t("emptyTitle")}</h1>
        <p className="max-w-[42ch] text-sm text-muted-foreground">
          {t("emptyBody")}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <TicketIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("colNumber")}</TableHead>
            <TableHead>{t("colType")}</TableHead>
            <TableHead>{t("colStatus")}</TableHead>
            <TableHead>{t("colOpened")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-mono text-xs">{row.id}</TableCell>
              <TableCell>{row.type}</TableCell>
              <TableCell>
                <Badge variant={row.status === "open" ? "default" : "secondary"}>
                  {row.status === "open" ? t("statusOpen") : t("statusClosed")}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {row.createdAt.toLocaleDateString(locale)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
