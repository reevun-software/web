"use client";

import { useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const DISCLAIMER_KEY = "reevun-disclaimer-dismissed";
const COOKIES_KEY = "reevun-cookies-dismissed";

type NoticeId = "disclaimer" | "cookies";

const noopSubscribe = () => () => {};

function isDismissed(key: string) {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    // Storage unreadable (private browsing, blocked) - fail closed rather
    // than nag on every load with no way to make it stick.
    return true;
  }
}

function firstUndismissed(): NoticeId | null {
  if (!isDismissed(DISCLAIMER_KEY)) return "disclaimer";
  if (!isDismissed(COOKIES_KEY)) return "cookies";
  return null;
}

// Server-rendered HTML and the first client paint always match this - "no
// notice" - regardless of what's actually in localStorage. If it instead
// defaulted to "show", a visitor who already dismissed everything would see
// it flash on screen for a frame on every reload, before the real
// localStorage check (which only runs after hydration) hides it again.
// A first-time visitor just sees it pop in a beat after load instead of
// pre-rendered, which is the trade worth making here.
function serverSnapshot(): null {
  return null;
}

export function NoticeStack() {
  const synced = useSyncExternalStore(noopSubscribe, firstUndismissed, serverSnapshot);
  const [override, setOverride] = useState<NoticeId | null | undefined>(undefined);
  const t = useTranslations("Footer");

  const active = override === undefined ? synced : override;
  if (!active) return null;

  function dismiss() {
    const key = active === "disclaimer" ? DISCLAIMER_KEY : COOKIES_KEY;
    try {
      localStorage.setItem(key, "1");
    } catch {
      // Private browsing / blocked storage - just won't remember across visits.
    }
    setOverride(active === "disclaimer" && !isDismissed(COOKIES_KEY) ? "cookies" : null);
  }

  return (
    <div
      role="note"
      className="fixed bottom-4 right-4 left-4 z-40 ml-auto max-w-sm rounded-lg border border-border/60 bg-popover/95 p-4 shadow-lg backdrop-blur sm:left-auto"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">
          {active === "disclaimer" ? t("disclaimerTitle") : t("cookiesTitle")}
        </p>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("dismissDisclaimer")}
          onClick={dismiss}
          className="-mt-1 -mr-1"
        >
          <X className="size-4" />
        </Button>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {active === "disclaimer" ? (
          t("disclaimer")
        ) : (
          <>
            {t("cookiesBody")}{" "}
            <Link href="/cookies" className="underline underline-offset-2 hover:text-foreground">
              {t("cookiesLearnMore")}
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
