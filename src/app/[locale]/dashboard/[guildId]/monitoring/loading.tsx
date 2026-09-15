import { Loader2 } from "lucide-react";

// The page below deliberately holds this boundary open for a fixed
// minimum (see the setTimeout in page.tsx) instead of just however long
// the real fetches take, so the transition always reads the same way
// regardless of how fast the upstream APIs happen to respond that time -
// and matches the same blur+spinner treatment used when switching between
// projects client-side (see OnlineMonitoringTabs), so the two don't feel
// like two different features.
export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center rounded-lg bg-background/40 backdrop-blur-sm">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
