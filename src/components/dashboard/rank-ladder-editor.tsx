"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RolePicker } from "@/components/dashboard/role-picker";
import type { DiscordRole } from "@/lib/discord-guild";
import type { RankDefinition } from "@/lib/bot-api";

type RankRow = { key: string; rank: number; def: RankDefinition };

// Reads back via formData.getAll("rankKeys") + the per-row
// rank-{key}-{number,label,nickname,roles} fields - see settings/page.tsx's
// parseRankRows. Arbitrary rank count and labels, not a fixed ladder: a
// family can have 5 ranks or 20, named however they like.
export function RankLadderEditor({
  roles,
  defaultRanks,
  labels,
}: {
  roles: DiscordRole[];
  defaultRanks: Record<string, RankDefinition>;
  labels: {
    addRank: string;
    rankNumber: string;
    rankLabel: string;
    nicknamePrefix: string;
    selectRoles: string;
    rolesUnavailable: string;
    searchRoles: string;
    delete: string;
    noRanks: string;
  };
}) {
  const initialRows: RankRow[] = Object.entries(defaultRanks)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([rank, def], i) => ({ key: `existing-${i}`, rank: Number(rank), def }));
  const [rows, setRows] = useState<RankRow[]>(initialRows);

  function addRow() {
    const nextRank = (rows.at(-1)?.rank ?? 0) + 1;
    setRows((r) => [
      ...r,
      { key: `new-${Date.now()}`, rank: nextRank, def: { roleIds: [], label: String(nextRank), nicknamePrefix: String(nextRank) } },
    ]);
  }
  function removeRow(key: string) {
    setRows((r) => r.filter((row) => row.key !== key));
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.length === 0 && <p className="text-sm text-muted-foreground">{labels.noRanks}</p>}
      {rows.map((row) => (
        <div key={row.key} className="flex flex-col gap-2 rounded-md border border-border/60 p-3">
          <input type="hidden" name="rankKeys" value={row.key} />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              name={`rank-${row.key}-number`}
              defaultValue={row.rank}
              aria-label={labels.rankNumber}
              className="w-16 shrink-0"
              min={1}
            />
            <Input
              name={`rank-${row.key}-label`}
              defaultValue={row.def.label}
              placeholder={labels.rankLabel}
              aria-label={labels.rankLabel}
              className="flex-1"
            />
            <Input
              name={`rank-${row.key}-nickname`}
              defaultValue={row.def.nicknamePrefix}
              placeholder={labels.nicknamePrefix}
              aria-label={labels.nicknamePrefix}
              className="w-32 shrink-0"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="shrink-0 cursor-pointer text-muted-foreground hover:text-destructive"
              aria-label={labels.delete}
              onClick={() => removeRow(row.key)}
            >
              <Trash2 className="size-4" strokeWidth={1.5} />
            </Button>
          </div>
          <RolePicker
            name={`rank-${row.key}-roles`}
            roles={roles}
            defaultSelectedIds={row.def.roleIds}
            addLabel={labels.selectRoles}
            emptyLabel={labels.rolesUnavailable}
            searchPlaceholder={labels.searchRoles}
          />
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="w-fit cursor-pointer gap-1.5" onClick={addRow}>
        <Plus className="size-4" strokeWidth={1.5} />
        {labels.addRank}
      </Button>
    </div>
  );
}
