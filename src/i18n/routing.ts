import { defineRouting } from "next-intl/routing";

export const LOCALES = ["ru", "en", "de", "tr", "zh", "es"] as const;
export type Locale = (typeof LOCALES)[number];

// Flag (flag-icons country code) and label shown in the language switcher.
export const LOCALE_META: Record<Locale, { flag: string; label: string }> = {
  ru: { flag: "ru", label: "Русский" },
  en: { flag: "us", label: "English, US" },
  de: { flag: "de", label: "Deutsch" },
  tr: { flag: "tr", label: "Türkçe" },
  zh: { flag: "cn", label: "简体中文" },
  es: { flag: "es", label: "Español" },
};

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: "ru",
  localePrefix: "as-needed",
});
