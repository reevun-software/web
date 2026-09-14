import type { OnlineHistoryPoint } from "@/lib/online-monitoring";

const WIDTH = 600;
const HEIGHT = 160;
const PADDING_Y = 8;

export function OnlineHistoryChart({
  points,
  emptyLabel,
}: {
  points: OnlineHistoryPoint[];
  emptyLabel: string;
}) {
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

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="none"
      className="h-40 w-full overflow-visible"
      role="img"
      aria-label="Online players over time"
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
    </svg>
  );
}
