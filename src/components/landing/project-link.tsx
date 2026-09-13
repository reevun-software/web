"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { PROJECT_URLS } from "@/lib/projects";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const PROJECT_LABELS: Record<keyof typeof PROJECT_URLS, string> = {
  majestic: "MajesticRP",
  gta: "GTA 5 RP",
  russia: "Russia Online",
};

const DURATION_MS = 5000;
const RADIUS = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function CountdownRing() {
  const [secondsLeft, setSecondsLeft] = useState(DURATION_MS / 1000);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex size-10 items-center justify-center">
      <svg width="40" height="40" viewBox="0 0 40 40" className="-rotate-90">
        <circle
          cx="20"
          cy="20"
          r={RADIUS}
          strokeWidth="3"
          fill="none"
          className="stroke-white/10"
        />
        {/* Mounting this fresh each time the dialog opens (the parent only
            renders CountdownRing while open) is what makes the keyframe
            animation restart from empty every time - a CSS animation always
            plays from 0% on mount. */}
        <circle
          cx="20"
          cy="20"
          r={RADIUS}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          className="stroke-foreground"
          strokeDasharray={CIRCUMFERENCE}
          style={{
            "--ring-circumference": CIRCUMFERENCE,
            animation: `leaving-ring-deplete ${DURATION_MS}ms linear forwards`,
          } as React.CSSProperties}
        />
      </svg>
      <span className="absolute font-mono text-xs tabular-nums text-muted-foreground">
        {secondsLeft}
      </span>
    </div>
  );
}

export function ProjectLink({
  project,
  children,
}: {
  project: keyof typeof PROJECT_URLS;
  children: ReactNode;
}) {
  const t = useTranslations("Leaving");
  const [open, setOpen] = useState(false);
  const targetUrl = PROJECT_URLS[project];

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      window.location.href = targetUrl;
    }, DURATION_MS);
    return () => clearTimeout(timer);
  }, [open, targetUrl]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-0.5 font-medium text-foreground underline decoration-muted-foreground/40 underline-offset-2 transition-colors hover:decoration-foreground"
      >
        {children}
        <ArrowUpRight className="size-3" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>
              {t("body", { site: PROJECT_LABELS[project] })}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-2">
            {open && <CountdownRing />}
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer"
              onClick={() => setOpen(false)}
            >
              {t("goBack")}
            </Button>
            <Button
              render={<a href={targetUrl} />}
              size="sm"
              className="cursor-pointer"
            >
              {t("continueNow")}
              <ArrowUpRight className="size-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
