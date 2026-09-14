"use client";

import { useState } from "react";
import type { OnlineHistoryPoint } from "@/lib/online-monitoring";

const WIDTH = 600;
const HEIGHT = 160;
const PADDING_Y = 8;

export function OnlineHistoryChart({
  points,
  emptyLabel,
  locale,
}: {
  points: OnlineHistoryPoint[];
  emptyLabel: string;
  locale: string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (points.length < 2) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  const values = points.map((p) => p.totalPlayers);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const usableHeight = HEIGHT - PADDING_Y * 2;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * WIDTH;
    const y = PADDING_Y + usableHeight - ((p.totalPlayers - min) / range) * usableHeight;
    return [x, y] as const;
  });

  const linePath = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const areaPath = `${linePath} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z`;
  const hovered = hoverIndex != null ? points[hoverIndex] : null;
  const hoveredCoord = hoverIndex != null ? coords[hoverIndex] : null;

  function handleMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    const index = Math.round(ratio * (points.length - 1));
    setHoverIndex(Math.min(Math.max(index, 0), points.length - 1));
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="h-40 w-full overflow-visible"
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
          <>
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
            <circle
              cx={hoveredCoord[0]}
              cy={hoveredCoord[1]}
              r={3}
              className="fill-foreground"
              vectorEffect="non-scaling-stroke"
            />
          </>
        )}
      </svg>
      {hovered && hoveredCoord && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-md border border-border/60 bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-md"
          style={{ left: `${(hoveredCoord[0] / WIDTH) * 100}%` }}
        >
          <span className="font-medium tabular-nums">{hovered.totalPlayers.toLocaleString()}</span>{" "}
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
  );
}
