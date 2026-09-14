"use client";

import { useTranslations } from "next-intl";
import { ChevronDown, Check } from "lucide-react";
import { LOCALES, LOCALE_META } from "@/i18n/routing";
import { useLocaleSwitcher } from "@/lib/locale-nav";
import { FlagIcon } from "@/components/flag-icon";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const t = useTranslations("LanguageSwitcher");
  const { locale, switchTo, prefetch } = useLocaleSwitcher();

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        // Switching locale is a real navigation (new RSC render), which
        // otherwise only starts once clicked - noticeably slower than a
        // normal link since this isn't a <Link> Next.js can auto-prefetch.
        // Warm every other locale's route the moment the menu opens instead.
        if (!open) return;
        for (const l of LOCALES) if (l !== locale) prefetch(l);
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
          <DropdownMenuItem key={l} className="cursor-pointer" onClick={() => switchTo(l)}>
            <FlagIcon code={LOCALE_META[l].flag} />
            <span className="flex-1">{LOCALE_META[l].label}</span>
            {l === locale && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
