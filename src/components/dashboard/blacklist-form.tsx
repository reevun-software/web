"use client";

import { toast } from "sonner";

// addBan silently no-op'd server-side when neither ID field was filled - the
// form looked submitted but nothing happened and nothing told the admin why.
// This surfaces that result as a toast instead of leaving it silent.
export function BlacklistForm({
  action,
  missingTargetError,
  botUnreachableError,
  addedMessage,
  className,
  children,
}: {
  action: (formData: FormData) => Promise<{ error?: string }>;
  missingTargetError: string;
  botUnreachableError: string;
  addedMessage: string;
  className?: string;
  children: React.ReactNode;
}) {
  async function handleSubmit(formData: FormData) {
    const result = await action(formData);
    if (result?.error === "botUnreachable") {
      toast.error(botUnreachableError);
    } else if (result?.error) {
      toast.error(missingTargetError);
    } else {
      toast.success(addedMessage);
    }
  }

  return (
    <form action={handleSubmit} className={className}>
      {children}
    </form>
  );
}
