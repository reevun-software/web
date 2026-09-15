"use client";

import { useMemo, useState } from "react";
import type { CityHistoryPoint } from "@/lib/online-monitoring";

const WIDTH = 600;
const HEIGHT = 220;
const PADDING_Y = 10;
// Reserves clean space on the left for the y-axis number labels, so city
// lines never start right under them - a solid backing behind each label
// worked but read as an ugly cutout box stamped over the lines. Leaving
// the space empty instead means nothing to cover up.
const PADDING_X_LEFT = 40;
const GRID_ROWS = 4;
const X_LABELS = 6;
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

// Rounds a raw span to a "nice" 1/2/5-times-a-power-of-ten step, so the
// y-axis reads 0/7,500/15,000/... instead of whatever the actual min/max of
// the data happened to be.
function niceStep(roughStep: number) {
  const exponent = Math.floor(Math.log10(roughStep));
  const fraction = roughStep / 10 ** exponent;
  const niceFraction = fraction < 1.5 ? 1 : fraction < 3 ? 2 : fraction < 7 ? 5 : 10;
  return niceFraction * 10 ** exponent;
}

// Nearest tick to a target time via binary search - the ticks array can run
// into the tens of thousands at 30 days of per-minute data, and this runs on
// every pointermove, so a linear scan there would visibly lag.
function nearestTick<T extends { t: number }>(ticks: T[], target: number): T {
  let lo = 0;
  let hi = ticks.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (ticks[mid].t < target) lo = mid + 1;
    else hi = mid;
  }
  if (lo > 0 && Math.abs(ticks[lo - 1].t - target) <= Math.abs(ticks[lo].t - target)) {
    return ticks[lo - 1];
  }
  return ticks[lo];
}

type CityMeta = { id: string; name: string; color: string };
type Tick = { t: number; values: Map<string, number> };

export function OnlineHistoryChart({
  cityPoints,
  cityColors,
  emptyLabel,
  peakLabel,
  shortHistoryLabel,
  chartLabel,
  colDate,
  colPlayers,
  locale,
  rangeKey,
  isolatedCityId,
}: {
  cityPoints: CityHistoryPoint[];
  // Colors are assigned by the parent from the live (not historical) city
  // list, so a city's line color matches its dot in the list below even
  // when the two orderings would otherwise disagree.
  cityColors: Record<string, string>;
  emptyLabel: string;
  peakLabel: string;
  // "{date}" placeholder replaced with the oldest point's formatted date/time.
  shortHistoryLabel: string;
  // The chart itself is pointer-only (hover to read a value) - this table
  // is the actual accessible path to the data for keyboard/screen-reader
  // users, not just an aria-label summary of the SVG.
  chartLabel: string;
  colDate: string;
  colPlayers: string;
  locale: string;
  // Also the selected day-range count itself (see OnlineMonitoringTabs) -
  // used both to key the crossfade below and to tell whether the actual
  // recorded history is shorter than the range that was asked for.
  rangeKey: number;
  // Set by clicking a city in the list below the chart - narrows the chart
  // (and its tooltip) down to just that one city's line.
  isolatedCityId: string | null;
}) {
  const [hoverT, setHoverT] = useState<number | null>(null);

  const { cities, ticks } = useMemo(() => {
    const cityMap = new Map<string, CityMeta>();
    const tickMap = new Map<number, Map<string, number>>();
    for (const p of cityPoints) {
      if (!cityMap.has(p.cityId)) {
        cityMap.set(p.cityId, {
          id: p.cityId,
          name: p.cityName,
          color: cityColors[p.cityId] ?? "currentColor",
        });
      }
      let values = tickMap.get(p.recordedAt.getTime());
      if (!values) {
        values = new Map();
        tickMap.set(p.recordedAt.getTime(), values);
      }
      values.set(p.cityId, p.players);
    }
    const ticks: Tick[] = [...tickMap.entries()]
      .map(([t, values]) => ({ t, values }))
      .sort((a, b) => a.t - b.t);
    return { cities: [...cityMap.values()], ticks };
  }, [cityPoints, cityColors]);

  const visibleCities = isolatedCityId ? cities.filter((c) => c.id === isolatedCityId) : cities;

  if (ticks.length < 2 || visibleCities.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  const minT = ticks[0].t;
  const maxT = ticks[ticks.length - 1].t;
  const spanT = maxT - minT || 1;

  // "Peak for period" is the combined total across cities - what actually
  // answers "what's the most players we've seen at once".
  const peak = Math.max(
    ...ticks.map((tick) =>
      visibleCities.reduce((sum, c) => sum + (tick.values.get(c.id) ?? 0), 0),
    ),
  );
  // The Y axis scales to the tallest INDIVIDUAL line instead, since these
  // are separate per-city lines, not a stacked area - scaling every line to
  // the summed total (a much bigger number) squashed each one flat near the
  // bottom of the chart.
  const maxSeriesValue = Math.max(
    ...ticks.flatMap((tick) => visibleCities.map((c) => tick.values.get(c.id) ?? 0)),
  );
  const rawMax = maxSeriesValue || 1;
  // Zero-based, "nice" axis instead of one tied exactly to the data's own
  // min/max, which produced ugly, seemingly-arbitrary grid values.
  const step = niceStep(rawMax / GRID_ROWS);
  const axisMax = Math.ceil(rawMax / step) * step;
  const usableHeight = HEIGHT - PADDING_Y * 2;

  function xFor(t: number) {
    return PADDING_X_LEFT + ((t - minT) / spanT) * (WIDTH - PADDING_X_LEFT);
  }
  function yFor(players: number) {
    return PADDING_Y + usableHeight - (players / axisMax) * usableHeight;
  }

  const linePaths = visibleCities.map((city) => {
    let d = "";
    let started = false;
    for (const tick of ticks) {
      const players = tick.values.get(city.id);
      if (players == null) {
        started = false; // gap in this city's own data - break the line, don't bridge it
        continue;
      }
      d += `${started ? "L" : "M"}${xFor(tick.t)},${yFor(players)} `;
      started = true;
    }
    return { ...city, d };
  });

  const rows = Math.round(axisMax / step);
  const gridLines = Array.from({ length: rows + 1 }, (_, i) => {
    const value = axisMax - i * step;
    const y = PADDING_Y + usableHeight * (i / rows);
    return { y, value };
  });

  // Repeating the same date across every tick read as broken - switch to a
  // time-of-day format once the visible span is short enough for the date
  // alone to stop being useful.
  const showTime = spanT < TWO_DAYS_MS;

  // Every range button filters the same underlying history, so once the
  // range asked for is wider than what's actually been recorded so far,
  // every button shows the identical, full dataset - surfacing how far back
  // real data goes makes that self-explanatory instead of looking broken.
  const requestedSpanMs = rangeKey * 24 * 60 * 60 * 1000;
  const hasShortHistory = spanT < requestedSpanMs * 0.95;

  // Snapped to real recorded tick indices, not evenly-spaced points in
  // continuous time - picking arbitrary time fractions produced labels like
  // 20:19 / 20:21 / 20:22 with inconsistent 1-2 minute gaps between them
  // whenever the real data didn't divide evenly, which read as broken.
  // Evenly spaced across the real TIME SPAN, each then snapped to its own
  // nearest real tick - not evenly spaced by index. Backfilled history mixes
  // dense recent data (per-minute) with sparse older data (hourly/daily), so
  // picking evenly-spaced indices oversamples whichever window happens to be
  // denser and left every label showing today's date.
  const xLabels = Array.from({ length: X_LABELS }, (_, i) => {
    const frac = i / (X_LABELS - 1);
    const tick = nearestTick(ticks, minT + frac * spanT);
    const date = new Date(tick.t);
    return {
      x: xFor(tick.t),
      label: showTime
        ? date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
        : date.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" }),
    };
  });

  function handleMove(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    // Inverts xFor(): pixel position -> viewBox x -> ratio across the
    // plotted span (which starts at PADDING_X_LEFT, not 0). Skipping this
    // offset would point the hover indicator to the left of the cursor by
    // however wide that left margin is.
    const viewBoxX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const ratio = Math.max(0, (viewBoxX - PADDING_X_LEFT) / (WIDTH - PADDING_X_LEFT));
    setHoverT(nearestTick(ticks, minT + ratio * spanT).t);
  }

  const hoverTick = hoverT != null ? ticks.find((tick) => tick.t === hoverT) : undefined;
  const hoverEntries = hoverTick
    ? visibleCities
        .map((c) => ({ ...c, players: hoverTick.values.get(c.id) }))
        .filter((e): e is CityMeta & { players: number } => e.players != null)
        .sort((a, b) => b.players - a.players)
    : [];
  const hoverTotal = hoverEntries.reduce((sum, e) => sum + e.players, 0);
  const hoverX = hoverT != null ? xFor(hoverT) : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">{peakLabel}</span>
        <span className="text-sm font-semibold tabular-nums">{peak.toLocaleString(locale)}</span>
      </div>

      {/* The SVG below is pointer-only - this table is the real
          keyboard/screen-reader path to the same data, not decoration.
          sr-only has to sit on a wrapping div, not the table itself: a
          <table> ignores an explicit 1px height even under overflow-hidden
          (its internal layout algorithm sizes to content regardless), so
          putting the class directly on the table left a 2800px+ invisible
          box in normal flow. */}
      <div className="sr-only">
        <table>
          <caption>{chartLabel}</caption>
          <thead>
            <tr>
              <th>{colDate}</th>
              <th>{colPlayers}</th>
            </tr>
          </thead>
          <tbody>
            {ticks.map((tick) => (
              <tr key={tick.t}>
                <td>
                  {new Date(tick.t).toLocaleString(locale, {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td>{[...tick.values.values()].reduce((sum, v) => sum + v, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* onPointerMove/Leave live here, not on the svg - the tooltip below
          takes pointer events (so its own list can be scrolled), and it
          visually overlaps the svg's own box near the hovered point. With
          the handlers on the svg alone, moving the cursor those last few
          pixels toward the tooltip landed ON the tooltip instead of the
          svg beneath it: pointermove stopped firing (hover got "stuck"),
          and pointerleave fired and cleared it entirely. Handling both on
          the shared wrapper covers the tooltip's own area too, so hover
          keeps tracking the cursor anywhere over the chart, tooltip
          included, and only clears on leaving the whole area. */}
      <div className="relative" onPointerMove={handleMove} onPointerLeave={() => setHoverT(null)}>
        <svg
          key={`${rangeKey}-${isolatedCityId ?? "all"}`}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="h-56 w-full overflow-visible animate-in fade-in duration-200 ease-out"
          aria-hidden="true"
        >
          {gridLines.map((g) => (
            <line
              key={g.y}
              x1={0}
              y1={g.y}
              x2={WIDTH}
              y2={g.y}
              stroke="currentColor"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              strokeDasharray="2 3"
              className="text-border"
            />
          ))}
          <g className="animate-chart-draw">
            {linePaths.map((city) => (
              <path
                key={city.id}
                d={city.d}
                fill="none"
                stroke={city.color}
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
          {hoverX != null && (
            <line
              x1={hoverX}
              y1={0}
              x2={hoverX}
              y2={HEIGHT}
              stroke="currentColor"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              className="text-border"
            />
          )}
        </svg>

        {/* Y-axis labels, positioned as HTML rather than SVG text so they
            never get stretched by the non-uniform viewBox scale below.
            PADDING_X_LEFT above keeps every city's line clear of this
            column, so there's nothing for these to be crossed out by. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex flex-col justify-between py-1 text-[10px] text-muted-foreground">
          {gridLines.map((g) => (
            <span key={g.y}>{g.value.toLocaleString(locale)}</span>
          ))}
        </div>

        {hoverX != null && hoverEntries.length > 0 && (
          // Centering the tooltip on the hovered point pushed half of it
          // past the container's edge whenever the hover point itself was
          // near the far left or right - anchor to the near edge instead
          // once close enough to one.
          <div
            // Not pointer-events-none like the y-axis labels below - with
            // enough cities this list needs its own scroll, which
            // pointer-events-none would silently defeat (wheel input hit-
            // tests straight through to whatever's behind it instead).
            className="absolute top-0 z-10 flex max-h-full w-max flex-col gap-1 overflow-y-auto rounded-md border border-border/60 bg-popover px-2.5 py-1.5 text-xs whitespace-nowrap text-popover-foreground shadow-md"
            style={{
              left: `${(hoverX / WIDTH) * 100}%`,
              transform:
                hoverX / WIDTH < 0.12
                  ? "translateX(0)"
                  : hoverX / WIDTH > 0.88
                    ? "translateX(-100%)"
                    : "translateX(-50%)",
            }}
          >
            <span className="font-medium text-muted-foreground">
              {new Date(hoverT!).toLocaleString(locale, {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {!isolatedCityId && hoverEntries.length > 1 && (
              <span className="font-semibold tabular-nums">
                {hoverTotal.toLocaleString(locale)}
              </span>
            )}
            {hoverEntries.map((e) => (
              <span key={e.id} className="flex items-center gap-1.5 tabular-nums">
                <span
                  className="size-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: e.color }}
                />
                <span className="flex-1 text-muted-foreground">{e.name}</span>
                {e.players.toLocaleString(locale)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pl-9 text-[10px] text-muted-foreground">
        {xLabels.map((l, i) => (
          <span key={i}>{l.label}</span>
        ))}
      </div>

      {hasShortHistory && (
        <p className="pl-9 text-xs text-muted-foreground">
          {shortHistoryLabel.replace(
            "{date}",
            new Date(minT).toLocaleString(locale, {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
          )}
        </p>
      )}
    </div>
  );
}
