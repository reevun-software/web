"use client";

import { Check } from "lucide-react";
import { LOCALES, LOCALE_META } from "@/i18n/routing";
import { useLocaleSwitcher } from "@/lib/locale-nav";
import { FlagIcon } from "@/components/flag-icon";
import { Button } from "@/components/ui/button";

export function LanguageList() {
  const { locale, switchTo } = useLocaleSwitcher();

  return (
    <div className="flex flex-col gap-1">
      {LOCALES.map((l) => (
        <Button
          key={l}
          variant="ghost"
          className="w-full cursor-pointer justify-start gap-2"
          onClick={() => switchTo(l)}
        >
          <FlagIcon code={LOCALE_META[l].flag} />
          <span className="flex-1 text-left">{LOCALE_META[l].label}</span>
          {l === locale && <Check className="size-4" />}
        </Button>
      ))}
    </div>
  );
}
