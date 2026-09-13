import type { ComponentProps } from "react";
import { signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function DiscordSignInButton({
  children,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("discord");
      }}
    >
      <Button type="submit" {...props}>
        {children}
      </Button>
    </form>
  );
}
