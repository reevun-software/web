// Role/channel pickers only ever emit real Discord snowflakes and the
// ColorInput only ever emits a 6-digit hex string - but a server action
// reads raw FormData, which is a trust boundary a hand-crafted POST can
// bypass regardless of what the widget renders. Sanitize here rather than
// trusting the client shape.
const SNOWFLAKE = /^\d{17,20}$/;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export function sanitizeSnowflake(value: FormDataEntryValue | null): string | null {
  const str = typeof value === "string" ? value : "";
  return SNOWFLAKE.test(str) ? str : null;
}

export function sanitizeSnowflakes(values: FormDataEntryValue[]): string[] {
  return values.filter((v): v is string => typeof v === "string" && SNOWFLAKE.test(v));
}

export function sanitizeHexColor(value: FormDataEntryValue | null, fallback: string): string {
  const str = typeof value === "string" ? value : "";
  return HEX_COLOR.test(str) ? str : fallback;
}
