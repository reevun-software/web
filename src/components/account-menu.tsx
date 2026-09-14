import { LayoutDashboard, Settings } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { signOut } from "@/lib/auth";
import { signIntercomJwt } from "@/lib/intercom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LanguageSubmenu } from "@/components/language-submenu";
import { SupportSubmenu } from "@/components/support-submenu";
import { SignOutMenuItem } from "@/components/sign-out-menu-item";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export async function AccountMenu({
  name,
  image,
  username,
  discordId,
}: {
  name: string | null | undefined;
  image: string | null | undefined;
  username?: string | null | undefined;
  discordId?: string;
}) {
  const [t, tRoot] = await Promise.all([getTranslations("Header"), getTranslations()]);
  const initial = name?.[0] ?? "?";
  const intercomJwt = discordId ? signIntercomJwt({ user_id: discordId }) : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={t("accountMenu")}
            className="cursor-pointer rounded-full"
          />
        }
      >
        <Avatar>
          <AvatarImage src={image ?? undefined} />
          <AvatarFallback className="text-xs">{initial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="flex items-center gap-3 p-2">
          <Avatar className="size-10">
            <AvatarImage src={image ?? undefined} />
            <AvatarFallback className="text-xs">{initial}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{name}</span>
            {username ? (
              <span className="truncate text-xs text-muted-foreground">@{username}</span>
            ) : null}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/dashboard" />} className="cursor-pointer">
          <LayoutDashboard className="size-4" strokeWidth={1.5} />
          {t("dashboardAria")}
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings" />} className="cursor-pointer">
          <Settings className="size-4" strokeWidth={1.5} />
          {tRoot("Settings.heading")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <LanguageSubmenu />
        <SupportSubmenu
          label={tRoot("Footer.support")}
          discordLabel={t("supportDiscord")}
          chatLabel={t("supportChat")}
          userId={discordId}
          name={name ?? undefined}
          userJwt={intercomJwt ?? undefined}
        />
        <DropdownMenuSeparator />
        <SignOutMenuItem
          label={t("signOut")}
          action={async () => {
            "use server";
            await signOut();
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
