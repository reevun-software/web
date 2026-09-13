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

// flag-icons' own stylesheet sets width via `.fi.fis` (two classes), which
// beats a plain Tailwind utility class like `size-4` on specificity - the
// utility silently never applied. An inline style always wins instead.
const FLAG_SIZE = { width: 16, height: 16 } as const;

function FlagIcon({ code }: { code: string }) {
  return <span className={`fi fi-${code} fis shrink-0 rounded-[3px]`} style={FLAG_SIZE} />;
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations("LanguageSwitcher");
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        // Switching locale is a real navigation (new RSC render), which
        // otherwise only starts once clicked - noticeably slower than a
        // normal link because next-intl's imperative router.replace() here
        // isn't a <Link>, so Next.js never auto-prefetches it. Warm every
        // other locale's route the moment the menu opens instead, so the
        // actual click just swaps in an already-fetched payload.
        if (!open) return;
        for (const l of LOCALES) {
          if (l === locale) continue;
          router.prefetch(
            // @ts-expect-error -- see the same cast on replace() below.
            { pathname, params },
            { locale: l },
          );
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
            <FlagIcon code={LOCALE_META[l].flag} />
            <span className="flex-1">{LOCALE_META[l].label}</span>
            {l === locale && <Check className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
