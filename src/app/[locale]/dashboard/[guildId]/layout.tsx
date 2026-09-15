import { notFound } from "next/navigation";
import { Home, Send, Globe } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect, Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { getManageableGuilds } from "@/lib/guilds";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { AccountMenu } from "@/components/account-menu";
import { Button } from "@/components/ui/button";
import { DiscordIcon } from "@/components/icons/discord-icon";

export default async function GuildLayout({
  children,
  params,
}: LayoutProps<"/[locale]/dashboard/[guildId]">) {
  const { guildId } = await params;
  const t = await getTranslations("Dashboard");
  const session = await auth();
  if (!session?.accessToken) {
    redirect({ href: "/", locale: await getLocale() });
    throw new Error("unreachable"); // proves accessToken is defined below to tsc
  }
  const guilds = await getManageableGuilds(session.accessToken);
  const current = guilds.find((g) => g.id === guildId);

  if (!current || !current.botInstalled) notFound();

  return (
    <div className="flex min-h-dvh flex-1 flex-col md:flex-row">
      <DashboardSidebar
        guildId={guildId}
        guildName={current.name}
        guilds={guilds}
        accountMenu={
          <AccountMenu
            name={session.user?.name}
            image={session.user?.image}
            username={session.discordUsername}
            discordId={session.discordId}
          />
        }
      />
      <div className="flex flex-1 flex-col">
        <header className="hidden h-14 items-center justify-between gap-3 border-b border-border/60 px-6 md:flex">
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer gap-1.5 text-muted-foreground"
            render={<Link href="/" />}
          >
            <Home className="size-4" strokeWidth={1.5} />
            {t("backToSite")}
          </Button>
          <AccountMenu
            name={session.user?.name}
            image={session.user?.image}
            username={session.discordUsername}
            discordId={session.discordId}
          />
        </header>
        <main className="flex-1 p-6">{children}</main>
        <footer className="flex flex-col items-center gap-3 border-t border-border/60 px-6 py-4 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <span>{t("footerRights", { year: new Date().getFullYear() })}</span>
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Discord" className="text-muted-foreground hover:text-foreground">
              <DiscordIcon className="size-4" />
            </Link>
            <Link href="/" aria-label="Telegram" className="text-muted-foreground hover:text-foreground">
              <Send className="size-4" strokeWidth={1.5} />
            </Link>
            <Link href="/" aria-label="Reevun" className="text-muted-foreground hover:text-foreground">
              <Globe className="size-4" strokeWidth={1.5} />
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
