"use client";

import { useRouter as useNextRouter, useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Check } from "lucide-react";
import { usePathname, getPathname } from "@/i18n/navigation";
import { LOCALES, LOCALE_META, type Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// flag-icons' own stylesheet sets width via `.fi.fis` (two classes), which
// beats a plain Tailwind utility class like `size-4` on specificity - the
// utility silently never applied. An inline style always wins instead.
const FLAG_SIZE = { width: 16, height: 16 } as const;

function FlagIcon({ code }: { code: string }) {
  return <span className={`fi fi-${code} fis shrink-0 rounded-[3px]`} style={FLAG_SIZE} />;
}

// Mirrors next-intl's own cookie sync (not exported publicly) - needed
// because we navigate with the plain Next.js router below, bypassing the
// wrapped one that would normally set this.
function syncLocaleCookie(nextLocale: Locale) {
  try {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // Cookies blocked - the locale just won't stick across visits.
  }
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations("LanguageSwitcher");
  const nextRouter = useNextRouter();
  const pathname = usePathname();
  const params = useParams();

  // next-intl's own useRouter() forces a locale prefix whenever a `locale`
  // option is passed - fine for the other locales (they're prefixed anyway
  // under localePrefix: "as-needed"), but Russian is the unprefixed default,
  // so switching to it went through a pointless "/ru" -> "/" redirect that
  // every other locale skips. Computing the href ourselves without forcing a
  // prefix, then navigating with the plain router, gives Russian the same
  // one-hop navigation the rest already had.
  function hrefFor(l: Locale) {
    return getPathname({
      // @ts-expect-error -- pathname/params come from the current (possibly
      // dynamic) route, whose exact param shape next-intl's typed navigation
      // can't know ahead of time here.
      href: { pathname, params },
      locale: l,
    });
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        // Switching locale is a real navigation (new RSC render), which
        // otherwise only starts once clicked - noticeably slower than a
        // normal link since this isn't a <Link> Next.js can auto-prefetch.
        // Warm every other locale's route the moment the menu opens instead.
        if (!open) return;
        for (const l of LOCALES) {
          if (l !== locale) nextRouter.prefetch(hrefFor(l));
        }
      }}
    >
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" aria-label={t("label")} />}
      >
        <FlagIcon code={LOCALE_META[locale].flag} />
        <span className="uppercase">{locale}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {LOCALES.map((l) => (
          <DropdownMenuItem
            key={l}
            className="cursor-pointer"
            onClick={() => {
              syncLocaleCookie(l);
              nextRouter.replace(hrefFor(l));
            }}
          >
            <FlagIcon code={LOCALE_META[l].flag} />
            <span className="flex-1">{LOCALE_META[l].label}</span>
            {l === locale && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
