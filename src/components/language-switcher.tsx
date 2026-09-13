"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALES, LOCALE_META, type Locale } from "@/i18n/routing";
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
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="sm" aria-label={t("label")} />}
      >
        <span className={`fi fi-${LOCALE_META[locale].flag} fis rounded-[3px]`} />
        <span className="uppercase">{locale}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {LOCALES.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() =>
              router.replace(
                // @ts-expect-error -- pathname/params come from the current
                // (possibly dynamic) route, whose exact param shape next-intl's
                // typed navigation can't know ahead of time here.
                { pathname, params },
                { locale: l },
              )
            }
          >
            <span className={`fi fi-${LOCALE_META[l].flag} fis rounded-[3px]`} />
            <span className="flex-1">{LOCALE_META[l].label}</span>
            {l === locale && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
