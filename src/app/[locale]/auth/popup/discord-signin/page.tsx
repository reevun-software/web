import { Loader2 } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";
import { signIn } from "@/lib/auth";
import { AutoSubmitForm } from "@/components/auth/auto-submit-form";

export default async function DiscordSignInPopupPage() {
  const [locale, t] = await Promise.all([getLocale(), getTranslations("Auth")]);
  const redirectTo = getPathname({ href: "/auth/popup/complete", locale });

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
