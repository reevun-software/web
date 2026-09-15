import { cn } from "@/lib/utils";

// Percentage-based translateY relative to the digit strip's own height (10
// stacked digits = 1000% tall, so 10% = exactly one digit) - moves whatever
// the actual pixel size ends up being, per the odometer recipe.
function DigitColumn({ digit }: { digit: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden align-bottom">
      <span
        className="odometer-digit absolute inset-x-0 top-0 flex flex-col transition-transform duration-[900ms] ease-[cubic-bezier(0.77,0,0.175,1)]"
        style={{ transform: `translateY(${-digit * 10}%)` }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="h-[1em] leading-[1em]">
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}

// Live count that rolls to its new value like an odometer/iOS time picker
// instead of jumping - the site's monitoring numbers refresh on their own
// every ~60s (see OnlineMonitoringTabs), so a silent value swap read as
// broken/stale. State-indication motion, not decoration: it's the one signal
// that the page is actually live.
//
// `locale` picks the thousands separator (toLocaleString() with no locale
// falls back to the runtime default, which showed English commas even on
// the Russian UI) and must match the separator character the digit columns
// don't cover.
export function OdometerNumber({
  value,
  locale,
  className,
}: {
  value: number;
  locale: string;
  className?: string;
}) {
  const formatted = value.toLocaleString(locale);
  return (
    <span className={cn("inline-flex align-middle tabular-nums", className)}>
      {formatted.split("").map((char, i) =>
        /\d/.test(char) ? (
          <DigitColumn key={i} digit={Number(char)} />
        ) : (
          // Matches the digit column's own box (1em tall, align-bottom) so
          // separators sit on the same baseline instead of floating relative
          // to the rolling digits.
          <span key={i} className="inline-block h-[1em] leading-[1em] align-bottom">
            {char}
          </span>
        ),
      )}
    </span>
  );
}
