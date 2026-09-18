"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Settings2, XIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { SubmitButton } from "@/components/dashboard/submit-button";
import type { DepartmentQuestion } from "@/lib/bot-api";

type QuestionRow = { key: string; question: DepartmentQuestion };

const MAX_QUESTIONS = 4;

// Read back via formData.getAll("questionKeys") + the per-row
// q-{key}-{label,style,required} fields - see settings/page.tsx's
// parseDepartmentQuestions. Up to 4: a 5th application-modal field is
// always the fixed IC-name/level/Static-ID one.
export function DepartmentQuestionsSheet({
  departmentName,
  questions,
  action,
  labels,
}: {
  departmentName: string;
  questions: DepartmentQuestion[];
  action: (formData: FormData) => Promise<void>;
  labels: {
    settingsButtonLabel: string;
    questionsHint: string;
    questionLabel: string;
    questionStyle: string;
    styleShort: string;
    styleParagraph: string;
    required: string;
    addQuestion: string;
    noQuestions: string;
    delete: string;
    save: string;
    saving: string;
    saved: string;
    close: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const initialRows: QuestionRow[] = questions.map((q, i) => ({ key: `existing-${i}`, question: q }));
  const [rows, setRows] = useState<QuestionRow[]>(initialRows);

  function addRow() {
    setRows((r) => [
      ...r,
      { key: `new-${Date.now()}`, question: { id: "", label: "", style: "short", required: true } },
    ]);
  }
  function removeRow(key: string) {
    setRows((r) => r.filter((row) => row.key !== key));
  }

  async function handleSubmit(formData: FormData) {
    await action(formData);
    toast.success(labels.saved);
    setOpen(false);
  }

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setRows(initialRows);
      }}
    >
      <DialogPrimitive.Trigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={labels.settingsButtonLabel}
            className="cursor-pointer self-center text-muted-foreground"
          />
        }
      >
        <Settings2 className="size-3.5" />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs" />
        <DialogPrimitive.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-full max-w-md translate-x-[-50%] translate-y-[-50%] flex-col gap-0 overflow-hidden rounded-xl bg-popover text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none transition-all duration-150 ease-out",
            "data-starting-style:translate-y-[calc(-50%-1rem)] data-starting-style:opacity-0",
            "data-ending-style:translate-y-[calc(-50%-1rem)] data-ending-style:opacity-0",
          )}
        >
          <DialogPrimitive.Close
            render={<Button variant="ghost" size="icon-sm" className="absolute top-3 right-3 cursor-pointer" />}
          >
            <XIcon className="size-4" />
            <span className="sr-only">{labels.close}</span>
          </DialogPrimitive.Close>
          <form action={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 border-b border-border/60 px-6 py-4">
              <DialogPrimitive.Title className="font-heading text-base font-medium text-foreground">
                {departmentName}
              </DialogPrimitive.Title>
              <p className="mt-1 text-xs text-muted-foreground">{labels.questionsHint}</p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-6">
              {rows.length === 0 && <p className="text-sm text-muted-foreground">{labels.noQuestions}</p>}
              {rows.map((row) => (
                <div key={row.key} className="flex flex-col gap-2 rounded-md border border-border/60 p-3">
                  <input type="hidden" name="questionKeys" value={row.key} />
                  <div className="flex items-center gap-2">
                    <Input
                      name={`q-${row.key}-label`}
                      defaultValue={row.question.label}
                      placeholder={labels.questionLabel}
                      aria-label={labels.questionLabel}
                      className="flex-1"
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
                  <div className="flex items-center gap-4">
                    <Select name={`q-${row.key}-style`} defaultValue={row.question.style}>
                      <SelectTrigger className="w-full sm:w-44">
                        <SelectValue>
                          {(value: string) => (value === "paragraph" ? labels.styleParagraph : labels.styleShort)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">{labels.styleShort}</SelectItem>
                        <SelectItem value="paragraph">{labels.styleParagraph}</SelectItem>
                      </SelectContent>
                    </Select>
                    <label className="flex flex-1 cursor-pointer items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">{labels.required}</span>
                      <Switch name={`q-${row.key}-required`} defaultChecked={row.question.required} />
                    </label>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit cursor-pointer gap-1.5"
                disabled={rows.length >= MAX_QUESTIONS}
                onClick={addRow}
              >
                <Plus className="size-4" strokeWidth={1.5} />
                {labels.addQuestion}
              </Button>
            </div>

            <div className="shrink-0 border-t border-border/60 p-4">
              <SubmitButton pendingLabel={labels.saving} className="w-full">
                {labels.save}
              </SubmitButton>
            </div>
          </form>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
