"use client";

import { useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { describeAuditEntry } from "@/lib/audit-log";
import type { BotAuditLogEntry } from "@/lib/bot-api";

// The log was hard-capped at 100 rows with no way to see anything older,
// and its one substantial column (description) got force-nowrapped by the
// shared Table default, making every row need horizontal scroll to read.
//
// Formatting (description/admin/date strings) happens here, client side,
// rather than in the server action that fetches more rows - a "use
// server" action can only close over plain data, and formatting needs a
// translator function, which isn't plain data. See loadMore's comment in
// page.tsx for the crash this used to cause.
export function AuditLogTable({
  initialEntries,
  initialHasMore,
  loadMore,
  usernames,
  labels,
}: {
  initialEntries: BotAuditLogEntry[];
  initialHasMore: boolean;
  loadMore: (offset: number) => Promise<{ entries: BotAuditLogEntry[]; hasMore: boolean }>;
  usernames: Record<string, string>;
  labels: {
    colAction: string;
    colAdmin: string;
    colReason: string;
    colDate: string;
    searchPlaceholder: string;
    loadMore: string;
    systemActor: string;
  };
}) {
  const t = useTranslations("Dashboard.auditLog");
  const locale = useLocale();
  const [entries, setEntries] = useState(initialEntries);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();

  const nameOf = (id: string) => usernames[id] ?? id;

  const rows = useMemo(
    () =>
      entries.map((entry) => ({
        id: entry.id,
        description: describeAuditEntry(t, nameOf(entry.userId), entry),
        admin: entry.administratorId ? nameOf(entry.administratorId) : labels.systemActor,
        reason: (entry.reason ?? entry.warningReason) || "—",
        date: new Date(entry.createdAt).toLocaleString(locale),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entries, locale],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        e.admin.toLowerCase().includes(q) ||
        e.reason.toLowerCase().includes(q),
    );
  }, [rows, search]);

  function handleLoadMore() {
    startTransition(async () => {
      const next = await loadMore(entries.length);
      setEntries((prev) => [...prev, ...next.entries]);
      setHasMore(next.hasMore);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={labels.searchPlaceholder}
        className="w-full sm:w-64"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{labels.colAction}</TableHead>
            <TableHead>{labels.colAdmin}</TableHead>
            <TableHead>{labels.colReason}</TableHead>
            <TableHead>{labels.colDate}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visible.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="whitespace-normal">{entry.description}</TableCell>
              <TableCell className="text-muted-foreground">{entry.admin}</TableCell>
              <TableCell className="text-muted-foreground">{entry.reason}</TableCell>
              <TableCell className="text-muted-foreground">{entry.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {hasMore && !search && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={handleLoadMore}
          className="w-fit cursor-pointer gap-1.5"
        >
          {pending && <Loader2 className="size-3.5 animate-spin" />}
          {labels.loadMore}
        </Button>
      )}
    </div>
  );
}
