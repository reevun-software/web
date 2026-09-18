import { Layers, Plus } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { getManageableGuilds } from "@/lib/guilds";
import { DISCORD_BOT_INVITE_URL } from "@/lib/discord";
import { Button } from "@/components/ui/button";
import { OAuthPopupButton } from "@/components/auth/oauth-popup-button";
import { FamilyPicker } from "@/components/dashboard/family-picker";

export default async function DashboardPage() {
  const locale = await getLocale();
  const session = await auth();
  if (!session?.accessToken) {
    redirect({ href: "/", locale });
    throw new Error("unreachable"); // proves accessToken is defined below to tsc
  }
  const guilds = await getManageableGuilds(session.accessToken);
  const installed = guilds.filter((g) => g.botInstalled);
  const [t, tRoot] = await Promise.all([getTranslations("Dashboard"), getTranslations()]);

  if (installed.length === 1)
    redirect({ href: `/dashboard/${installed[0].id}`, locale });

  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      {installed.length === 0 ? (
        <>
          <Layers className="size-8 text-muted-foreground" strokeWidth={1.5} />
          <h1 className="text-xl font-medium">{t("noFamiliesTitle")}</h1>
          <p className="max-w-[46ch] text-sm text-muted-foreground">
            {t("noFamiliesBody")}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <OAuthPopupButton startUrl={DISCORD_BOT_INVITE_URL} mode="external">
              <Plus className="size-4" />
              {tRoot("Cta.addBot")}
            </OAuthPopupButton>
            <Button render={<Link href="/" />} variant="outline">
              {tRoot("NotFound.home")}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <Layers className="size-7 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{t("chooseFamilyTitle")}</h1>
          <FamilyPicker
            families={installed.map((g) => ({ id: g.id, name: g.name, icon: g.icon }))}
          />
        </>
      )}
    </div>
  );
}
