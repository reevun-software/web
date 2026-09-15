"use client";

import { useState } from "react";
import type { OnlineHistoryPoint } from "@/lib/online-monitoring";

const WIDTH = 600;
const HEIGHT = 220;
const PADDING_Y = 10;
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

export function OnlineHistoryChart({
  points,
  emptyLabel,
  peakLabel,
  shortHistoryLabel,
  locale,
  rangeKey,
}: {
  points: OnlineHistoryPoint[];
  emptyLabel: string;
  peakLabel: string;
  // "{date}" placeholder replaced with the oldest point's formatted date/time.
  shortHistoryLabel: string;
  locale: string;
  // Also the selected day-range count itself (see OnlineMonitoringTabs) -
  // used both to key the crossfade below and to tell whether the actual
  // recorded history is shorter than the range that was asked for.
  rangeKey: number;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (points.length < 2) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  const values = points.map((p) => p.totalPlayers);
  const peak = Math.max(...values);
  const rawMax = peak || 1;
  // Zero-based, "nice" axis (0 / 7,500 / 15,000 / ...) instead of an axis
  // tied exactly to the data's own min/max, which produced ugly values like
  // 28,985 / 28,806 and made the line look arbitrary rather than gridded.
  const step = niceStep(rawMax / GRID_ROWS);
  const axisMax = Math.ceil(rawMax / step) * step;
  const usableHeight = HEIGHT - PADDING_Y * 2;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * WIDTH;
    const y = PADDING_Y + usableHeight - (p.totalPlayers / axisMax) * usableHeight;
    return [x, y] as const;
  });

  const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const areaPath = `${linePath} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;
  const hovered = hoverIndex != null ? points[hoverIndex] : null;
  const hoveredCoord = hoverIndex != null ? coords[hoverIndex] : null;

  const rows = Math.round(axisMax / step);
  const gridLines = Array.from({ length: rows + 1 }, (_, i) => {
    const value = axisMax - i * step;
    const y = PADDING_Y + usableHeight * (i / rows);
    return { y, value };
  });

  // Repeating the same date across every tick (all points fall on "14.09")
  // read as broken - switch to a time-of-day format once the visible span
  // is short enough that the date alone stops being useful.
  const spanMs = points[points.length - 1].recordedAt.getTime() - points[0].recordedAt.getTime();
  const showTime = spanMs < TWO_DAYS_MS;

  // Every range button (1d/7d/30d/...) filters the same underlying history,
  // so once the range asked for is wider than what's actually been recorded
  // so far, every button shows the identical, full dataset - which reads as
  // "the range picker does nothing". Surfacing how far back real data goes
  // makes that self-explanatory instead of looking broken.
  const requestedSpanMs = rangeKey * 24 * 60 * 60 * 1000;
  const oldestPoint = points[0].recordedAt;
  const hasShortHistory = spanMs < requestedSpanMs * 0.95;

  const xLabels = Array.from({ length: X_LABELS }, (_, i) => {
    const t = i / (X_LABELS - 1);
    const index = Math.round(t * (points.length - 1));
    const recordedAt = points[index].recordedAt;
    return {
      x: (index / (points.length - 1)) * WIDTH,
      label: showTime
        ? recordedAt.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
        : recordedAt.toLocaleDateString(locale, { day: "2-digit", month: "2-digit" }),
    };
  });

  function handleMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const index = Math.round(ratio * (points.length - 1));
    setHoverIndex(Math.min(Math.max(index, 0), points.length - 1));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-muted-foreground">{peakLabel}</span>
        <span className="text-sm font-semibold tabular-nums">{peak.toLocaleString(locale)}</span>
      </div>

      <div className="relative">
        <svg
          key={rangeKey}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="h-56 w-full overflow-visible animate-in fade-in duration-200 ease-out"
          role="img"
          aria-label="Online players over time"
          onPointerMove={handleMove}
          onPointerLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="online-history-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
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
          <path d={areaPath} fill="url(#online-history-fill)" className="text-foreground" />
          <path
            d={linePath}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="text-foreground/80"
          />
          {hoveredCoord && (
            <line
              x1={hoveredCoord[0]}
              y1={0}
              x2={hoveredCoord[0]}
              y2={HEIGHT}
              stroke="currentColor"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              className="text-border"
            />
          )}
        </svg>

        {/* Y-axis labels, positioned as HTML rather than SVG text so they
            never get stretched by the non-uniform viewBox scale below. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex flex-col justify-between py-1 text-[10px] text-muted-foreground">
          {gridLines.map((g) => (
            <span key={g.y}>{g.value.toLocaleString(locale)}</span>
          ))}
        </div>

        {/* Hover dot as an HTML overlay (percentage-positioned) instead of an
            SVG circle: the chart's viewBox width (600) rarely matches its
            rendered pixel width, and preserveAspectRatio="none" scales x/y
            independently, which stretched a plain SVG <circle> into an
            oversized ellipse. */}
        {hoveredCoord && (
          <span
            className="pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
            style={{
              left: `${(hoveredCoord[0] / WIDTH) * 100}%`,
              top: `${(hoveredCoord[1] / HEIGHT) * 100}%`,
            }}
          />
        )}

        {hovered && hoveredCoord && (
          <div
            className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md border border-border/60 bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-md"
            style={{ left: `${(hoveredCoord[0] / WIDTH) * 100}%` }}
          >
            <span className="font-medium tabular-nums">{hovered.totalPlayers.toLocaleString(locale)}</span>{" "}
            <span className="text-muted-foreground">
              {hovered.recordedAt.toLocaleString(locale, {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
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
            oldestPoint.toLocaleString(locale, {
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
