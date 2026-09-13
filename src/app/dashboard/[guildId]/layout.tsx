import { notFound, redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { getManageableGuilds } from "@/lib/guilds";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default async function GuildLayout({
  children,
  params,
}: LayoutProps<"/dashboard/[guildId]">) {
  const { guildId } = await params;
  const session = await auth();
  if (!session?.accessToken) redirect("/");
  const guilds = await getManageableGuilds(session.accessToken);
  const current = guilds.find((g) => g.id === guildId);

  if (!current || !current.botInstalled) notFound();

  return (
    <div className="flex min-h-full flex-1">
      <DashboardSidebar
        guildId={guildId}
        guildName={current.name}
        guilds={guilds}
      />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-end gap-3 border-b border-border/60 px-6">
          <Avatar className="size-7">
            <AvatarFallback className="text-xs">
              {session.user?.name?.[0] ?? "?"}
            </AvatarFallback>
          </Avatar>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="size-7"
            >
              <LogOut className="size-4" strokeWidth={1.5} />
            </Button>
          </form>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
