"use client";

import { useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const DISMISSED_KEY = "reevun-disclaimer-dismissed";

const noopSubscribe = () => () => {};

function readDismissed() {
  try {
    return localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function DisclaimerPopup() {
  // localStorage isn't available during SSR and can disagree with the
  // server's render, so this needs the sync-external-store dance rather than
  // a useEffect+setState read - React renders the server snapshot (false,
  // i.e. visible) through hydration and swaps to the real one right after,
  // with no hydration-mismatch warning.
  const dismissedAtLoad = useSyncExternalStore(noopSubscribe, readDismissed, () => false);
  const [dismissedNow, setDismissedNow] = useState(false);
  const t = useTranslations("Footer");

  if (dismissedAtLoad || dismissedNow) return null;

  function dismiss() {
    setDismissedNow(true);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Private browsing / blocked storage - just won't remember across visits.
    }
  }

  return (
    <div
      role="note"
      className="fixed bottom-4 right-4 left-4 z-40 ml-auto max-w-sm rounded-lg border border-border/60 bg-popover/95 p-4 shadow-lg backdrop-blur sm:left-auto"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">{t("disclaimerTitle")}</p>
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
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{t("disclaimer")}</p>
    </div>
  );
}
