"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// A plain <Button type="submit"> gives no feedback while its server action
// is in flight - clicking it just looked inert for however long the
// round-trip took. useFormStatus is the one way to read that pending state
// without turning the whole form client-side.
export function SubmitButton({
  children,
  pendingLabel,
  className,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className={cn("cursor-pointer gap-1.5", className)}>
      {pending && <Loader2 className="size-3.5 animate-spin" />}
      {pending ? pendingLabel : children}
    </Button>
  );
}
