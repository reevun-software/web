"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlagIcon } from "@/components/flag-icon";
import { OnlineHistoryChart } from "@/components/dashboard/online-history-chart";
import { OdometerNumber } from "@/components/dashboard/odometer-number";
import type { OnlineProjectData, OnlineHistoryPoint } from "@/lib/online-monitoring";

const LIVE_REFRESH_MS = 60_000;
const RANGE_OPTIONS = [1, 7, 30, 90] as const;

type Project = {
  key: string;
  label: string;
  logo: string;
  data: OnlineProjectData | null;
  history: OnlineHistoryPoint[];
};

export function OnlineMonitoringTabs({
  projects,
  current,
  peakToday,
  peakAllTime,
  peakInRange,
  unavailable,
  historyEmpty,
  rangeLabels,
}: {
  projects: Project[];
  current: string;
  peakToday: string;
  peakAllTime: string;
  peakInRange: string;
  unavailable: string;
  historyEmpty: string;
  rangeLabels: Record<(typeof RANGE_OPTIONS)[number], string>;
}) {
  const [active, setActive] = useState(projects[0]?.key);
  const [rangeDays, setRangeDays] = useState<(typeof RANGE_OPTIONS)[number]>(1);
  const locale = useLocale();
  const router = useRouter();

  // A stable "now" read once per mount rather than inside the memo below -
  // Date.now() is an impure call the React Compiler refuses to run during
  // render, and the range filter only needs to be roughly current anyway.
  const [now] = useState(() => Date.now());

  // The site's own snapshot recording happens server-side on each page
  // render (see the monitoring page), so refreshing the RSC tree is enough
  // to pull a fresh live value - no separate polling API needed.
  useEffect(() => {
    const id = setInterval(() => router.refresh(), LIVE_REFRESH_MS);
    return () => clearInterval(id);
  }, [router]);

  const project = projects.find((p) => p.key === active) ?? projects[0];
  const data = project?.data;

  const visibleHistory = useMemo(() => {
    if (!project) return [];
    const since = now - rangeDays * 24 * 60 * 60 * 1000;
    return project.history.filter((p) => p.recordedAt.getTime() >= since);
  }, [project, rangeDays, now]);

  const stats = [
    { label: current, value: data?.totalPlayers },
    { label: peakToday, value: data?.peakToday },
    { label: peakAllTime, value: data?.peakAllTime },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {projects.map((p) => (
          <Button
            key={p.key}
            variant={p.key === active ? "default" : "outline"}
            size="sm"
            className="cursor-pointer gap-1.5"
            onClick={() => setActive(p.key)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- external brand logo, hotlinked from the project's own official domain */}
            <img src={p.logo} alt="" className="size-4 rounded-sm object-contain" />
            {p.label}
          </Button>
        ))}
      </div>

      {!data ? (
        <Card className="p-6 text-sm text-muted-foreground">{unavailable}</Card>
      ) : (
        <>
          <Card className="grid grid-cols-1 divide-y divide-border/60 p-0 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-1 px-5 py-4">
                <span className="text-xs text-muted-foreground">{s.label}</span>
                <span className="text-2xl font-semibold tracking-tight">
                  {s.value != null ? <OdometerNumber value={s.value} locale={locale} /> : "—"}
                </span>
              </div>
            ))}
          </Card>

          <Card className="flex flex-col gap-3 p-5 text-foreground">
            <div className="flex flex-wrap gap-1.5">
              {RANGE_OPTIONS.map((days) => (
                <Button
                  key={days}
                  variant={rangeDays === days ? "default" : "ghost"}
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => setRangeDays(days)}
                >
                  {rangeLabels[days]}
                </Button>
              ))}
            </div>
            <OnlineHistoryChart
              points={visibleHistory}
              emptyLabel={historyEmpty}
              peakLabel={peakInRange}
              locale={locale}
              rangeKey={rangeDays}
            />
          </Card>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-border/60 sm:grid-cols-2 lg:grid-cols-3">
            {data.cities.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between gap-3 bg-card px-4 py-3 transition-colors hover:bg-accent/60"
              >
                <span className="flex min-w-0 items-center gap-2 truncate text-sm font-medium">
                  {c.countryCode && <FlagIcon code={c.countryCode} />}
                  <span className="truncate">{c.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                  <OdometerNumber value={c.players} locale={locale} />
                  {c.online !== false && (
                    <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                  )}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
