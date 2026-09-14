import { getPathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

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
// The default locale's route has no prefix ("/" not "/ru"), so unlike every
// other locale it isn't self-describing from the URL alone - the server
// decides it from the NEXT_LOCALE cookie. Prefetching it while the cookie
// still holds the *current* locale bakes that stale locale's content into
// Next.js's client router cache under the "/" key; syncing the cookie and
// navigating there on click then silently reuses that stale entry instead of
// fetching fresh, so the switch to the default locale looked like a no-op.
// Every other locale is safe to prefetch since its own URL prefix - not the
// cookie - determines what the server renders.
export function shouldPrefetchLocale(locale: Locale) {
  return locale !== routing.defaultLocale;
}

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
