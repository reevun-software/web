"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MemberPicker, type PickableMember } from "@/components/dashboard/member-picker";

export type Department = { id: number; name: string; memberDiscordIds: string[] };

export function DepartmentsManager({
  departments,
  members,
  createDepartment,
  deleteDepartment,
  updateDepartmentMembers,
  labels,
}: {
  departments: Department[];
  members: PickableMember[];
  createDepartment: (name: string) => Promise<void>;
  deleteDepartment: (id: number) => Promise<void>;
  updateDepartmentMembers: (id: number, memberIds: string[]) => Promise<void>;
  labels: {
    addDepartment: string;
    namePlaceholder: string;
    noDepartments: string;
    members: string;
    addMembers: string;
    noMembers: string;
    searchMembers: string;
    delete: string;
  };
}) {
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  function submitCreate() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setName("");
    startTransition(() => createDepartment(trimmed));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitCreate();
            }
          }}
          placeholder={labels.namePlaceholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="cursor-pointer shrink-0"
          disabled={!name.trim() || isPending}
          onClick={submitCreate}
        >
          <Plus className="size-4" strokeWidth={1.5} />
        </Button>
      </div>

      {departments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{labels.noDepartments}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {departments.map((dept) => (
            <Card key={dept.id} className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{dept.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-muted-foreground hover:text-destructive"
                  aria-label={labels.delete}
                  onClick={() => startTransition(() => deleteDepartment(dept.id))}
                >
                  <Trash2 className="size-4" strokeWidth={1.5} />
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">{labels.members}</span>
              <MemberPicker
                members={members}
                selectedIds={dept.memberDiscordIds}
                onChange={(ids) => startTransition(() => updateDepartmentMembers(dept.id, ids))}
                addLabel={labels.addMembers}
                emptyLabel={labels.noMembers}
                searchPlaceholder={labels.searchMembers}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
