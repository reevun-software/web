import type { ComponentProps } from "react";
import { getLocale } from "next-intl/server";
import { signIn } from "@/lib/auth";
import { getPathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function DiscordSignInButton({
  children,
  ...props
}: ComponentProps<typeof Button>) {
  const locale = await getLocale();
  const redirectTo = getPathname({ href: "/dashboard", locale });

  return (
    <form
      action={async () => {
        "use server";
        await signIn("discord", { redirectTo });
      }}
    >
      <Button type="submit" {...props}>
        {children}
      </Button>
    </form>
  );
}
