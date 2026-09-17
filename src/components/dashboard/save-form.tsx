"use client";

import { toast } from "sonner";

// The page's own <form action={save}> gave no feedback once the server
// action resolved - it just sat there, leaving no way to tell "saved" apart
// from "did that even go through". Wrapping the action in a client handler
// that toasts on success mirrors the same pattern FilterSettingsSheet
// already uses for its own save.
export function SaveForm({
  action,
  savedMessage,
  errorMessage,
  className,
  children,
}: {
  action: (formData: FormData) => Promise<{ error?: boolean } | void>;
  savedMessage: string;
  errorMessage: string;
  className?: string;
  children: React.ReactNode;
}) {
  async function handleSubmit(formData: FormData) {
    const result = await action(formData);
    if (result?.error) {
      toast.error(errorMessage);
      return;
    }
    toast.success(savedMessage);
  }

  return (
    <form action={handleSubmit} className={className}>
      {children}
    </form>
  );
}
