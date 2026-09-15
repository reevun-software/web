"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
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

type Member = {
  discordUserId: string;
  username: string;
  rank: number;
  rankLabel: string;
  warnings: number;
  isAfk: boolean;
};

type SortKey = "username" | "rank" | "warnings";

function SortHead({
  sortKey,
  onToggle,
  children,
}: {
  sortKey: SortKey;
  onToggle: (key: SortKey) => void;
  children: React.ReactNode;
}) {
  return (
    <TableHead>
      <button
        type="button"
        onClick={() => onToggle(sortKey)}
        className="flex cursor-pointer items-center gap-1 text-inherit hover:text-foreground"
      >
        {children}
        <ArrowUpDown className="size-3" />
      </button>
    </TableHead>
  );
}

// Server-rendered before this was a flat, unsearchable, unsortable list -
// fine on a handful of seed members, a dead end past that. Client-side
// filter/sort is enough at the guild-membership scale this app targets; a
// guild large enough to need server-side paging would need real query
// params instead.
export function MembersTable({
  members,
  labels,
}: {
  members: Member[];
  labels: {
    colMember: string;
    colRank: string;
    colWarnings: string;
    colStatus: string;
    searchPlaceholder: string;
    online: string;
    afk: string;
  };
}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "username", dir: 1 });

  const rows = useMemo(() => {
    const filtered = members.filter((m) =>
      m.username.toLowerCase().includes(search.trim().toLowerCase()),
    );
    return [...filtered].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const cmp = typeof av === "string" ? av.localeCompare(bv as string) : (av as number) - (bv as number);
      return cmp * sort.dir;
    });
  }, [members, search, sort]);

  function toggleSort(key: SortKey) {
    setSort((s) => (s.key === key ? { key, dir: (s.dir * -1) as 1 | -1 } : { key, dir: 1 }));
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
            <SortHead sortKey="username" onToggle={toggleSort}>{labels.colMember}</SortHead>
            <SortHead sortKey="rank" onToggle={toggleSort}>{labels.colRank}</SortHead>
            <SortHead sortKey="warnings" onToggle={toggleSort}>{labels.colWarnings}</SortHead>
            <TableHead>{labels.colStatus}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((m) => (
            <TableRow key={m.discordUserId}>
              <TableCell className="flex items-center gap-2.5">
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs">{m.username[0]}</AvatarFallback>
                </Avatar>
                {m.username}
              </TableCell>
              <TableCell>{m.rankLabel}</TableCell>
              <TableCell>
                {m.warnings > 0 ? (
                  <Badge variant="destructive">{m.warnings}</Badge>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">{m.isAfk ? labels.afk : labels.online}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
