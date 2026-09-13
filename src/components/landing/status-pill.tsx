import Link from "next/link";
import { getServiceStatus } from "@/lib/status";

const DOT_COLOR = {
  operational: "bg-emerald-500",
  issue: "bg-amber-500",
  unknown: "bg-muted-foreground",
};

export async function StatusPill() {
  const status = await getServiceStatus();

  return (
    <Link
      href="https://status.reevun.app"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
    >
      <span className={`size-2 rounded-full ${DOT_COLOR[status.variant]}`} />
      {status.label}
    </Link>
  );
}
