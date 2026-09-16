import Image from "next/image";
import { LogIn } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { auth } from "@/lib/auth";
import { AccountMenu } from "@/components/account-menu";
import { DiscordSignInButton } from "@/components/discord-signin-button";
import { LanguageSwitcher } from "@/components/language-switcher";

// Shared across the landing page and standalone pages (privacy, terms,
// cookies) so those aren't dead ends with no way back - previously each such
// page rendered bare, with no header/logo link, so the only way out was the
// browser's back button.
export async function SiteHeader() {
  const [session, t] = await Promise.all([auth(), getTranslations()]);

  return (
    // top-8, not top-0: the beta banner is position:fixed at the very top
    // (z-50) with a matching pt-8 reserving its space in flow - a sticky
    // header stuck at top-0 would end up sliding underneath that banner
    // once scrolled, instead of resting right below it.
    <header className="sticky top-8 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Reevun"
            width={24}
            height={24}
            className="rounded-sm"
            priority
          />
          <span className="text-lg font-semibold tracking-tight">Reevun</span>
        </Link>
        <div className="flex items-center gap-2">
          {session?.user ? (
            // Once signed in, the language picker moves into the account
            // menu (it already needs a place for the rest of the profile
            // settings) instead of sitting next to the avatar as its own
            // control. Signed-out visitors have no account menu yet, so they
            // still get the standalone switcher.
            <AccountMenu
              name={session.user.name}
              image={session.user.image}
              username={session.discordUsername}
              discordId={session.discordId}
            />
          ) : (
            <>
              <LanguageSwitcher />
              <DiscordSignInButton size="sm" className="btn-glass">
                <LogIn className="size-4" />
                {t("Header.signIn")}
              </DiscordSignInButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
