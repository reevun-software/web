import type { Metadata } from "next";
import { Settings as SettingsIcon, LogOut, ExternalLink } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { auth, signOut } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/landing/footer";
import { LanguageList } from "@/components/settings/language-list";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/settings">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Settings" });
  return { title: t("metaTitle") };
}

export default async function SettingsPage() {
  const locale = await getLocale();
  const [session, t, tRoot] = await Promise.all([
    auth(),
    getTranslations("Settings"),
    getTranslations(),
  ]);

  if (!session?.user) {
    redirect({ href: "/", locale });
    throw new Error("unreachable"); // proves session.user is defined below to tsc
  }

  const initial = session.user.name?.[0] ?? "?";

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto flex max-w-xl flex-col gap-6 px-6 py-20">
          <div className="flex items-center gap-2">
            <SettingsIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
            <h1 className="text-xl font-semibold tracking-tight">{t("heading")}</h1>
          </div>

          <Card className="flex flex-col gap-4 p-6">
            <span className="text-sm font-medium">{t("profileTitle")}</span>
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarImage src={session.user.image ?? undefined} />
                <AvatarFallback>{initial}</AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{session.user.name}</span>
                {session.discordUsername ? (
                  <span className="truncate text-xs text-muted-foreground">
                    @{session.discordUsername}
                  </span>
                ) : null}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{t("profileNote")}</p>
          </Card>

          <Card className="flex flex-col gap-4 p-6">
            <span className="text-sm font-medium">{t("languageTitle")}</span>
            <LanguageList />
          </Card>

          <Card className="flex flex-col gap-4 p-6">
            <span className="text-sm font-medium">{t("accountTitle")}</span>
            <Button
              render={
                <Link
                  href="https://discord.com/settings/authorized-apps"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              variant="outline"
              className="w-fit cursor-pointer"
            >
              {t("revokeAccess")}
              <ExternalLink className="size-4" />
            </Button>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <Button type="submit" variant="destructive" className="w-fit cursor-pointer">
                <LogOut className="size-4" />
                {tRoot("Header.signOut")}
              </Button>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
