import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { getManageableGuilds } from "@/lib/guilds";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { AccountMenu } from "@/components/account-menu";

export default async function GuildLayout({
  children,
  params,
}: LayoutProps<"/[locale]/dashboard/[guildId]">) {
  const { guildId } = await params;
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
        <header className="hidden h-14 items-center justify-end gap-3 border-b border-border/60 px-6 md:flex">
          <AccountMenu
            name={session.user?.name}
            image={session.user?.image}
            username={session.discordUsername}
            discordId={session.discordId}
          />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
