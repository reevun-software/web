import type { ComponentProps } from "react";
import { getLocale } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { OAuthPopupButton } from "@/components/auth/oauth-popup-button";
import type { Button } from "@/components/ui/button";

export async function DiscordSignInButton({
  children,
  ...props
}: ComponentProps<typeof Button>) {
  const locale = await getLocale();
  const startUrl = getPathname({ href: "/auth/popup/discord-signin", locale });

  return (
    <OAuthPopupButton startUrl={startUrl} mode="message" {...props}>
      {children}
    </OAuthPopupButton>
  );
}
