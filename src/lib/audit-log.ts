// Shared between the full Audit Log page and the Dashboard overview's
// recent-activity widget, so the two never describe the same log type
// differently.
export function describeAuditEntry(
  t: (key: string, values?: Record<string, string | number>) => string,
  target: string,
  entry: { logType: string; oldRank: number | null; newRank: number | null },
): string {
  switch (entry.logType) {
    case "rank_change":
      return t("rankChange", { target, oldRank: entry.oldRank ?? 0, newRank: entry.newRank ?? 0 });
    case "warn_issued":
      return t("warnIssued", { target });
    case "warn_removed":
      return t("warnRemoved", { target });
    case "ban_added":
      return t("banAdded", { target });
    case "ban_removed":
      return t("banRemoved", { target });
    default:
      return t("generic", { target, type: entry.logType });
  }
}
