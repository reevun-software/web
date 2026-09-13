"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

const REDIRECT_SECONDS = 5;

export function LeavingRedirect({ targetUrl }: { targetUrl: string }) {
  const t = useTranslations("Leaving");
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    if (secondsLeft <= 0) {
      window.location.href = targetUrl;
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft, targetUrl]);

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="font-mono text-sm text-muted-foreground">
        {t("countdown", { seconds: secondsLeft })}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button render={<a href={targetUrl} />} size="sm">
          {t("continueNow")}
          <ArrowUpRight className="size-4" />
        </Button>
        <Button render={<Link href="/" />} variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          {t("goBack")}
        </Button>
      </div>
    </div>
  );
}
