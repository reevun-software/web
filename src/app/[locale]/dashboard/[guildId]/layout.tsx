import { notFound } from "next/navigation";
import { Home } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { redirect, Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { getManageableGuilds } from "@/lib/guilds";
import { getModuleStates } from "@/lib/guild-modules";
import { SUPPORT_DISCORD_URL } from "@/lib/discord";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { AccountMenu } from "@/components/account-menu";
import { Button } from "@/components/ui/button";
import { DiscordIcon } from "@/components/icons/discord-icon";
import { TelegramIcon } from "@/components/icons/telegram-icon";
import { XIcon } from "@/components/icons/x-icon";
import { GithubIcon } from "@/components/icons/github-icon";

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

  const moduleStates = await getModuleStates(guildId);

  return (
    <div className="flex min-h-[calc(100dvh-2rem)] flex-1 flex-col md:flex-row">
      <DashboardSidebar
        guildId={guildId}
        guildName={current.name}
        guilds={guilds}
        moduleStates={moduleStates}
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
          {/* -ml-2.5 cancels the button's own left padding (size="sm" ->
              px-2.5) so its icon lines up with the page heading's icon
              below, which has no such padding in front of it. */}
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2.5 cursor-pointer gap-1.5 text-muted-foreground"
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
          <span>{t("footerCopyright", { year: new Date().getFullYear() })}</span>
          <div className="flex items-center gap-4">
            <span>{t("footerRightsReserved")}</span>
            <div className="flex items-center gap-3">
              <Link
                href={SUPPORT_DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="text-muted-foreground hover:text-foreground"
              >
                <DiscordIcon className="size-4" />
              </Link>
              <Link href="/" aria-label="Telegram" className="text-muted-foreground hover:text-foreground">
                <TelegramIcon className="size-4" />
              </Link>
              <Link href="/" aria-label="X" className="text-muted-foreground hover:text-foreground">
                <XIcon className="size-4" />
              </Link>
              <Link href="/" aria-label="GitHub" className="text-muted-foreground hover:text-foreground">
                <GithubIcon className="size-4" />
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
