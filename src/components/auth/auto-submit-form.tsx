"use client";

import { useEffect, useRef } from "react";

// The popup window's start page has to POST into next-auth's signIn() (a
// server action) the instant it loads, with no user interaction - a plain
// GET to /api/auth/signin/discord only renders next-auth's built-in picker
// page instead of redirecting to Discord.
export function AutoSubmitForm({ action }: { action: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    formRef.current?.requestSubmit();
  }, []);

  return <form ref={formRef} action={action} className="hidden" />;
}
