"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlagIcon } from "@/components/flag-icon";
import { OnlineHistoryChart } from "@/components/dashboard/online-history-chart";
import { OdometerNumber } from "@/components/dashboard/odometer-number";
import { cn } from "@/lib/utils";
import { OFFICIAL_CITY_COLORS, FALLBACK_CITY_COLORS } from "@/lib/city-colors";
import type { OnlineProjectData, OnlineHistoryPoint, CityHistoryPoint } from "@/lib/online-monitoring";

const LIVE_REFRESH_MS = 60_000;
const RANGE_OPTIONS = [1, 7, 30] as const;
// Matches the fixed minimum the server-side page.tsx holds its own
// loading.tsx open for, so switching projects client-side (an instant
// state flip - every project's data is already loaded) still reads as
// the same "load" beat as opening the page fresh does.
const PROJECT_SWITCH_DELAY_MS = 1000;

// Real history is a blend of resolutions - live recording is per-minute,
// but the 30-day backfill only had hourly/daily data available for its
// older stretches. Filtering by date alone left a chart where most of the
// window was coarse and the last day or so suddenly went dense per-minute,
// which read as broken rather than "we're looking at a month". Each range
// downsamples to ONE consistent bucket size instead, matching the
// resolution the source site itself uses for that same range (1d: minute,
// 7d: hour, 30d: day) - not a live-vs-backfill distinction, a "how zoomed
// out are we" one.
const BUCKET_MS: Record<(typeof RANGE_OPTIONS)[number], number> = {
  1: 60_000,
  7: 60 * 60_000,
  30: 24 * 60 * 60_000,
};

function downsample(points: CityHistoryPoint[], bucketMs: number): CityHistoryPoint[] {
  const buckets = new Map<
    string,
    { cityId: string; cityName: string; sum: number; count: number; t: number }
  >();
  for (const p of points) {
    const t = Math.floor(p.recordedAt.getTime() / bucketMs) * bucketMs;
    const key = `${p.cityId}:${t}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.sum += p.players;
      bucket.count += 1;
    } else {
      buckets.set(key, { cityId: p.cityId, cityName: p.cityName, sum: p.players, count: 1, t });
    }
  }
  return [...buckets.values()].map((b) => ({
    cityId: b.cityId,
    cityName: b.cityName,
    players: Math.round(b.sum / b.count),
    recordedAt: new Date(b.t),
  }));
}

type Project = {
  key: string;
  label: string;
  logo: string;
  data: OnlineProjectData | null;
  history: OnlineHistoryPoint[];
  cityHistory: CityHistoryPoint[];
};

export function OnlineMonitoringTabs({
  projects,
  current,
  peakToday,
  peakAllTime,
  peakInRange,
  unavailable,
  historyEmpty,
  chartLabel,
  colDate,
  colPlayers,
  rangeLabels,
}: {
  projects: Project[];
  current: string;
  peakToday: string;
  peakAllTime: string;
  peakInRange: string;
  unavailable: string;
  historyEmpty: string;
  chartLabel: string;
  colDate: string;
  colPlayers: string;
  rangeLabels: Record<(typeof RANGE_OPTIONS)[number], string>;
}) {
  const [active, setActive] = useState(projects[0]?.key);
  const [rangeDays, setRangeDays] = useState<(typeof RANGE_OPTIONS)[number]>(1);
  const [isolatedCityId, setIsolatedCityId] = useState<string | null>(null);
  // Held for a fixed beat (not a key remount) on project switch: the stat
  // numbers below stay mounted the whole time, so once `active` actually
  // flips at the end of the delay, OdometerNumber sees its value prop
  // change on an already-mounted element and rolls to it - a remount here
  // would reset its digit positions and make it snap instead.
  const [switching, setSwitching] = useState(false);
  // Highlights the clicked tab immediately even though the data behind it
  // (and `active`) doesn't swap until the delay below finishes - without
  // this the button a person just clicked looked unresponsive for a beat.
  const [pendingKey, setPendingKey] = useState<string | undefined>(undefined);
  const switchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (switchTimeout.current) clearTimeout(switchTimeout.current);
    };
  }, []);

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

  function selectProject(key: string) {
    if (key === active) return;
    setPendingKey(key);
    setSwitching(true);
    if (switchTimeout.current) clearTimeout(switchTimeout.current);
    switchTimeout.current = setTimeout(() => {
      setActive(key);
      setIsolatedCityId(null); // a city id from one project means nothing on another
      setSwitching(false);
      setPendingKey(undefined);
    }, PROJECT_SWITCH_DELAY_MS);
  }

  const since = now - rangeDays * 24 * 60 * 60 * 1000;
  const visibleCityHistory = useMemo(() => {
    if (!project) return [];
    const filtered = project.cityHistory.filter((p) => p.recordedAt.getTime() >= since);
    return downsample(filtered, BUCKET_MS[rangeDays]);
  }, [project, since, rangeDays]);

  // Colors keyed off the live cities list (data.cities), which is also what
  // renders the list below - not off visibleCityHistory, whose ordering is
  // "whichever city's data happened to arrive first" and can disagree.
  const cityColors = useMemo(() => {
    const colors: Record<string, string> = {};
    let fallbackIndex = 0;
    data?.cities.forEach((c) => {
      colors[c.id] = OFFICIAL_CITY_COLORS[c.id] ?? FALLBACK_CITY_COLORS[fallbackIndex++ % FALLBACK_CITY_COLORS.length];
    });
    return colors;
  }, [data]);

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
            variant={p.key === (pendingKey ?? active) ? "default" : "outline"}
            size="sm"
            className="cursor-pointer gap-1.5"
            onClick={() => selectProject(p.key)}
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
        // Not keyed by project - a remount here would reset OdometerNumber's
        // digit positions on every switch, making it snap to the new value
        // instead of rolling to it. `active` (and so every value below)
        // only flips once PROJECT_SWITCH_DELAY_MS ends, so the reveal and
        // the digit roll land on the same beat.
        <div className="relative flex flex-col gap-4">
          {switching && (
            // A plain centered spinner, siblings with the blurred content
            // below rather than layered on top of it via backdrop-blur -
            // backdrop-filter only reliably samples what's within its own
            // compositing tile, which broke down once this section (stat
            // cards + chart + a tall city list) ran taller than one
            // viewport: only the top portion actually came out blurred.
            // Blurring the content div itself has no such limit since it
            // rasterizes its own pixels rather than sampling through a
            // layer boundary.
            <div className="absolute inset-0 z-20 flex items-start justify-center pt-24">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}
          <div
            aria-hidden={switching || undefined}
            className={cn(
              "flex flex-col gap-4 transition-[filter] duration-300 ease-out",
              switching && "pointer-events-none blur-sm",
            )}
          >
          {/* gap-0 overrides the Card component's own default gap
              (--card-spacing, ~16px). Without it, that gap sat between
              every column *in addition to* the divide-x border, so
              columns 2/3 had a visible gap-plus-border gutter before
              their content that column 1 (nothing precedes it) never
              had - reading as those two columns starting further right
              than the first, even though every column's own padding is
              identical. Zeroing the gap makes the columns actually touch,
              so the divider sits right at the seam with no extra space
              around it. */}
          <Card className="grid grid-cols-1 gap-0 divide-y divide-border/60 p-0 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
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
              drawKey={project?.key}
              cityPoints={visibleCityHistory}
              cityColors={cityColors}
              emptyLabel={historyEmpty}
              peakLabel={peakInRange}
              chartLabel={chartLabel.replace("{project}", project?.label ?? "")}
              colDate={colDate}
              colPlayers={colPlayers}
              locale={locale}
              rangeKey={rangeDays}
              isolatedCityId={isolatedCityId}
            />
          </Card>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-border/60 sm:grid-cols-2 lg:grid-cols-3">
            {data.cities.map((c) => {
              const isolated = isolatedCityId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setIsolatedCityId(isolated ? null : c.id)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 bg-card px-4 py-3 text-left transition-colors hover:bg-accent/60",
                    isolatedCityId && !isolated && "opacity-50",
                    isolated && "bg-accent/60",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2 truncate text-sm font-medium">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: cityColors[c.id] }}
                      aria-hidden
                    />
                    {c.countryCode && <FlagIcon code={c.countryCode} />}
                    <span className="truncate">{c.name}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground">
                    <OdometerNumber value={c.players} locale={locale} />
                    {c.online !== false && (
                      <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
