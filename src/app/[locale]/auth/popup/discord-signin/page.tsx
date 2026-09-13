import { Loader2 } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { signIn } from "@/lib/auth";
import { AutoSubmitForm } from "@/components/auth/auto-submit-form";

export default async function DiscordSignInPopupPage({
  searchParams,
}: PageProps<"/[locale]/auth/popup/discord-signin">) {
  const [{ direct }, locale, t] = await Promise.all([
    searchParams,
    getLocale(),
    getTranslations("Auth"),
  ]);
  // Reached directly (no popup, mobile fallback) when ?direct=1 - land on the
  // dashboard instead of the popup's own "you can close this window" page,
  // which has nothing useful to show outside an actual popup.
  const redirectTo = getPathname({ href: direct ? "/dashboard" : "/auth/popup/complete", locale });

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 px-6 text-center text-sm text-muted-foreground">
      <Loader2 className="size-6 animate-spin" />
      {t("redirecting")}
      <AutoSubmitForm
        action={async () => {
          "use server";
          await signIn("discord", { redirectTo });
        }}
      />
    </div>
  );
}
