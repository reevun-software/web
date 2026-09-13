import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { getServiceStatus } from "@/lib/status";

const DOT_COLOR = {
  operational: "bg-emerald-500",
  issue: "bg-amber-500",
  unavailable: "bg-muted-foreground",
};

export async function StatusPill({ className }: { className?: string }) {
  const status = await getServiceStatus();
  const t = await getTranslations("Status");
  const label =
    status.variant === "issue" && status.incidentTitle
      ? status.incidentTitle
      : t(status.variant);

  return (
    <Link
      href="https://status.reevun.app"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground",
        className,
      )}
    >
      <span className={`size-2 rounded-full ${DOT_COLOR[status.variant]}`} />
      {label}
    </Link>
  );
}
