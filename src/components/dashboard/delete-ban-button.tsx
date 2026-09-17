"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// One-way CRUD (add-only, no delete) meant a mistaken ban was permanent.
// A native confirm() is the lazy-correct call here - this is the only
// destructive control in the app, so a whole AlertDialog component isn't
// worth building for one button.
export function DeleteBanButton({
  action,
  confirmLabel,
  label,
  errorMessage,
}: {
  action: () => Promise<{ error?: boolean } | void>;
  confirmLabel: string;
  label: string;
  errorMessage: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      disabled={pending}
      className="cursor-pointer text-muted-foreground hover:text-destructive"
      onClick={() => {
        if (!confirm(confirmLabel)) return;
        startTransition(async () => {
          const result = await action();
          if (result?.error) toast.error(errorMessage);
        });
      }}
    >
      {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
    </Button>
  );
}
