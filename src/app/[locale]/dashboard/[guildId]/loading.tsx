import { Loader2 } from "lucide-react";

// Covers the [guildId]/layout.tsx's own guild lookup too, not just page.tsx -
// Next.js suspends the whole segment (layout included) behind this fallback
// while that fetch (a live Discord API call, only cached for 60s) is pending.
export default function Loading() {
  return (
    <div className="flex min-h-dvh flex-1 items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}
