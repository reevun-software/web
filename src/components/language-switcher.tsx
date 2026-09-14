"use client";

import { useRouter as useNextRouter, useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Check } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { LOCALES, LOCALE_META, type Locale } from "@/i18n/routing";
import { syncLocaleCookie, localeHref, shouldPrefetchLocale } from "@/lib/locale-nav";
import { FlagIcon } from "@/components/flag-icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations("LanguageSwitcher");
  const nextRouter = useNextRouter();
  const pathname = usePathname();
  const params = useParams();

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        // Switching locale is a real navigation (new RSC render), which
        // otherwise only starts once clicked - noticeably slower than a
        // normal link since this isn't a <Link> Next.js can auto-prefetch.
        // Warm every other locale's route the moment the menu opens instead.
        if (!open) return;
        for (const l of LOCALES) {
          if (l !== locale && shouldPrefetchLocale(l)) {
            nextRouter.prefetch(localeHref(pathname, params, l));
          }
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
              nextRouter.replace(localeHref(pathname, params, l));
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
