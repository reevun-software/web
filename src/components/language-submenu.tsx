"use client";

import { useRouter as useNextRouter, useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { usePathname } from "@/i18n/navigation";
import { LOCALES, LOCALE_META, type Locale } from "@/i18n/routing";
import { syncLocaleCookie, localeHref, shouldPrefetchLocale } from "@/lib/locale-nav";
import { FlagIcon } from "@/components/flag-icon";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function LanguageSubmenu() {
  const locale = useLocale() as Locale;
  const t = useTranslations("LanguageSwitcher");
  const nextRouter = useNextRouter();
  const pathname = usePathname();
  const params = useParams();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        className="cursor-pointer"
        onFocus={() => {
          for (const l of LOCALES) {
            if (l !== locale && shouldPrefetchLocale(l)) {
              nextRouter.prefetch(localeHref(pathname, params, l));
            }
          }
        }}
      >
        <FlagIcon code={LOCALE_META[locale].flag} />
        {t("label")}: {LOCALE_META[locale].label}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
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
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
