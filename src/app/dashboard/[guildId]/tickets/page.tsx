import { eq, desc } from "drizzle-orm";
import { Ticket as TicketIcon } from "lucide-react";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";
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
}: PageProps<"/dashboard/[guildId]/tickets">) {
  const { guildId } = await params;
  const rows = await db
    .select()
    .from(tickets)
    .where(eq(tickets.guildId, guildId))
    .orderBy(desc(tickets.createdAt));

  if (rows.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
        <TicketIcon className="size-8 text-muted-foreground" strokeWidth={1.5} />
        <h1 className="text-lg font-medium">Пока нет обращений</h1>
        <p className="max-w-[42ch] text-sm text-muted-foreground">
          Тикеты и апелляции, созданные через бота, появятся в этом списке.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight">Обращения</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Номер</TableHead>
            <TableHead>Тип</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead>Открыт</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-mono text-xs">{t.id}</TableCell>
              <TableCell>{t.type}</TableCell>
              <TableCell>
                <Badge variant={t.status === "open" ? "default" : "secondary"}>
                  {t.status === "open" ? "открыт" : "закрыт"}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {t.createdAt.toLocaleDateString("ru-RU")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
