// Applications created before departmentName was recorded on the ticket
// itself fall back to the raw requestType - either a department's numeric
// id (resolvable against the current department list) or, for tickets
// from before the department system existed at all, the old hardcoded
// Capt/RP section codes.
const LEGACY_REQUEST_TYPE_LABELS: Record<string, string> = {
  capt: "Капт-состав",
  rp: "RP-состав",
};

export function ticketRequestLabel(
  row: { departmentName: string | null; requestType: string | null; category: string },
  departmentsById: Map<string, string>,
): string {
  if (row.departmentName) return row.departmentName;
  if (row.requestType) {
    return (
      departmentsById.get(row.requestType) ??
      LEGACY_REQUEST_TYPE_LABELS[row.requestType.toLowerCase()] ??
      row.requestType
    );
  }
  return row.category;
}
