"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { MemberPicker, type PickableMember } from "@/components/dashboard/member-picker";
import { DepartmentQuestionsSheet } from "@/components/dashboard/department-questions-sheet";
import type { DepartmentQuestion } from "@/lib/bot-api";

export type Department = {
  id: number;
  name: string;
  memberDiscordIds: string[];
  questions: DepartmentQuestion[];
  recruitmentOpen: boolean;
};

export function DepartmentsManager({
  departments,
  members,
  createDepartment,
  deleteDepartment,
  updateDepartmentMembers,
  updateDepartmentQuestions,
  updateDepartmentRecruitment,
  labels,
}: {
  departments: Department[];
  members: PickableMember[];
  createDepartment: (name: string) => Promise<void>;
  deleteDepartment: (id: number) => Promise<void>;
  updateDepartmentMembers: (id: number, memberIds: string[]) => Promise<void>;
  updateDepartmentQuestions: (id: number, formData: FormData) => Promise<void>;
  updateDepartmentRecruitment: (id: number, open: boolean) => Promise<void>;
  labels: {
    addDepartment: string;
    namePlaceholder: string;
    noDepartments: string;
    recruitmentOpen: string;
    members: string;
    addMembers: string;
    noMembers: string;
    searchMembers: string;
    delete: string;
    confirmDelete: string;
    questionsSettings: string;
    questionsHint: string;
    questionLabel: string;
    questionStyle: string;
    styleShort: string;
    styleParagraph: string;
    required: string;
    addQuestion: string;
    noQuestions: string;
    save: string;
    saving: string;
    saved: string;
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
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground">{labels.recruitmentOpen}</span>
                    <Switch
                      checked={dept.recruitmentOpen}
                      onCheckedChange={(checked) =>
                        startTransition(() => updateDepartmentRecruitment(dept.id, checked))
                      }
                    />
                  </div>
                  <DepartmentQuestionsSheet
                    departmentName={dept.name}
                    questions={dept.questions}
                    action={(formData) => updateDepartmentQuestions(dept.id, formData)}
                    labels={{
                      settingsButtonLabel: labels.questionsSettings,
                      questionsHint: labels.questionsHint,
                      questionLabel: labels.questionLabel,
                      questionStyle: labels.questionStyle,
                      styleShort: labels.styleShort,
                      styleParagraph: labels.styleParagraph,
                      required: labels.required,
                      addQuestion: labels.addQuestion,
                      noQuestions: labels.noQuestions,
                      delete: labels.delete,
                      save: labels.save,
                      saving: labels.saving,
                      saved: labels.saved,
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="cursor-pointer text-muted-foreground hover:text-destructive"
                    aria-label={labels.delete}
                    onClick={() => {
                      if (!confirm(labels.confirmDelete)) return;
                      startTransition(() => deleteDepartment(dept.id));
                    }}
                  >
                    <Trash2 className="size-4" strokeWidth={1.5} />
                  </Button>
                </div>
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
