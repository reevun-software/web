// Shared between the full Audit Log page and the Dashboard overview's
// recent-activity widget, so the two never describe the same log type
// differently. logType/warnAction match the bot's own user_logs shape
// ("rank" | "warn", with warnAction "issued" | "removed" distinguishing
// the warn subtype) - this is the bot's real audit trail, not a separate
// site-side log.
export function describeAuditEntry(
  t: (key: string, values?: Record<string, string | number>) => string,
  target: string,
  entry: { logType: string; oldRank: number | null; newRank: number | null; warnAction?: string | null },
): string {
  switch (entry.logType) {
    case "rank":
      return t("rankChange", { target, oldRank: entry.oldRank ?? 0, newRank: entry.newRank ?? 0 });
    case "warn":
      return entry.warnAction === "removed"
        ? t("warnRemoved", { target })
        : t("warnIssued", { target });
    case "ban_added":
      return t("banAdded", { target });
    case "ban_removed":
      return t("banRemoved", { target });
    default:
      return t("generic", { target, type: entry.logType });
  }
}
