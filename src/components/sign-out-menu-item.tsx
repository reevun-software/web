"use client";

import { LogOut } from "lucide-react";
import { shutdown } from "@intercom/messenger-js-sdk";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

// Intercom identifies visitors via its own persistent browser cookie,
// independent of our session - signing out of Reevun alone left the
// Messenger still greeting the previous account by name on the next visit.
// shutdown() clears that identity before the sign-out server action runs.
export function SignOutMenuItem({
  label,
  action,
}: {
  label: string;
  action: () => Promise<void>;
}) {
  return (
    <form
      action={async () => {
        shutdown();
        await action();
      }}
      className="contents"
    >
      <DropdownMenuItem
        render={<button type="submit" className="w-full" />}
        variant="destructive"
        className="cursor-pointer"
      >
        <LogOut className="size-4" strokeWidth={1.5} />
        {label}
      </DropdownMenuItem>
    </form>
  );
}
