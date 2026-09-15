import { eq } from "drizzle-orm";
import { ShieldAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { guildMembers } from "@/lib/db/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function WarningsPage({
  params,
}: PageProps<"/[locale]/dashboard/[guildId]/warnings">) {
  const { guildId } = await params;
  const t = await getTranslations("Dashboard.warnings");
  const members = await db
    .select()
    .from(guildMembers)
    .where(eq(guildMembers.guildId, guildId));
  const warned = members.filter((m) => m.warnings > 0).sort((a, b) => b.warnings - a.warnings);

  if (warned.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
        <ShieldAlert className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-lg font-medium">{t("emptyTitle")}</h1>
        <p className="max-w-[42ch] text-sm text-muted-foreground">{t("emptyBody")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ShieldAlert className="size-5 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("colMember")}</TableHead>
            <TableHead>{t("colWarnings")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warned.map((m) => (
            <TableRow key={m.discordUserId}>
              <TableCell className="flex items-center gap-2.5">
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs">{m.username[0]}</AvatarFallback>
                </Avatar>
                {m.username}
              </TableCell>
              <TableCell>
                <Badge variant="destructive">{m.warnings}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
