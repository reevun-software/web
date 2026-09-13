import { desc, eq } from "drizzle-orm";
import { Users } from "lucide-react";
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

export default async function MembersPage({
  params,
}: PageProps<"/dashboard/[guildId]">) {
  const { guildId } = await params;
  const members = await db
    .select()
    .from(guildMembers)
    .where(eq(guildMembers.guildId, guildId))
    .orderBy(desc(guildMembers.joinedAt));

  if (members.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
        <Users className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-lg font-medium">Пока нет участников</h1>
        <p className="max-w-[42ch] text-sm text-muted-foreground">
          Как только бот запишет первых участников этой семьи, они появятся
          здесь.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight">Участники</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Участник</TableHead>
            <TableHead>Ранг</TableHead>
            <TableHead>Предупреждения</TableHead>
            <TableHead>Статус</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.discordUserId}>
              <TableCell className="flex items-center gap-2.5">
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs">
                    {m.username[0]}
                  </AvatarFallback>
                </Avatar>
                {m.username}
              </TableCell>
              <TableCell>Ранг {m.rank}</TableCell>
              <TableCell>
                {m.warnings > 0 ? (
                  <Badge variant="destructive">{m.warnings}</Badge>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {m.isAfk ? "AFK" : "На связи"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
