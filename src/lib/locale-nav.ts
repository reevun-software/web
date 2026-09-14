import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

// Mirrors next-intl's own cookie sync (not exported publicly) - needed
// whenever we navigate with the plain Next.js router, bypassing the wrapped
// one that would normally set this.
export function syncLocaleCookie(nextLocale: Locale) {
  try {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    // Cookies blocked - the locale just won't stick across visits.
  }
}

// next-intl's own useRouter() forces a locale prefix whenever a `locale`
// option is passed - fine for non-default locales (prefixed anyway under
// localePrefix: "as-needed"), but pointless for the unprefixed default
// locale, where it causes an extra "/ru" -> "/" redirect. Computing the href
// directly and navigating with the plain router avoids that for every
// locale uniformly.
export function localeHref(
  pathname: string,
  params: Record<string, string | string[] | undefined>,
  locale: Locale,
) {
  return getPathname({
    // @ts-expect-error -- pathname/params come from the current (possibly
    // dynamic) route, whose exact param shape next-intl's typed navigation
    // can't know ahead of time here.
    href: { pathname, params },
    locale,
  });
}
