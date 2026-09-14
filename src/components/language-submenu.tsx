"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { LOCALES, LOCALE_META } from "@/i18n/routing";
import { useLocaleSwitcher } from "@/lib/locale-nav";
import { FlagIcon } from "@/components/flag-icon";
import {
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function LanguageSubmenu() {
  const t = useTranslations("LanguageSwitcher");
  const { locale, switchTo, prefetch } = useLocaleSwitcher();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        className="cursor-pointer"
        onFocus={() => {
          for (const l of LOCALES) if (l !== locale) prefetch(l);
        }}
      >
        <FlagIcon code={LOCALE_META[locale].flag} />
        {t("label")}: {LOCALE_META[locale].label}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {LOCALES.map((l) => (
          <DropdownMenuItem key={l} className="cursor-pointer" onClick={() => switchTo(l)}>
            <FlagIcon code={LOCALE_META[l].flag} />
            <span className="flex-1">{LOCALE_META[l].label}</span>
            {l === locale && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
