import { Loader2 } from "lucide-react";

// The page below deliberately holds this boundary open for a fixed
// minimum (see the setTimeout in page.tsx) instead of just however long
// the real fetches take, so the transition always reads the same way
// regardless of how fast the upstream APIs happen to respond that time.
export default function Loading() {
  return (
    <div className="relative flex flex-col gap-4">
      <div className="h-7 w-48 animate-pulse rounded-md bg-muted" />
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-border/60 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex flex-col gap-2 bg-card px-5 py-4">
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
            <div className="h-6 w-24 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-lg bg-card" />
      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg bg-border/60 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-11 animate-pulse bg-card" />
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/40 backdrop-blur-sm">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}
