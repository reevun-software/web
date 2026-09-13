// Auth.js error types are opaque strings ("OAuthCallbackError") - not
// meaningful to a non-technical visitor. Map the ones we handle to a short
// numeric code instead, closer to what people expect from an error screen.
const AUTH_ERROR_CODES = {
  AccessDenied: 4001,
  OAuthAccountNotLinked: 4002,
  OAuthCallbackError: 4003,
  Configuration: 5001,
  Verification: 4004,
} as const;

export type AuthErrorReasonKey = keyof typeof AUTH_ERROR_CODES | "Default";

const DEFAULT_NUMERIC_CODE = 4000;

export function authErrorReasonKey(code: string): AuthErrorReasonKey {
  return code in AUTH_ERROR_CODES ? (code as keyof typeof AUTH_ERROR_CODES) : "Default";
}

export function authErrorNumericCode(code: string): number {
  const key = authErrorReasonKey(code);
  return key === "Default" ? DEFAULT_NUMERIC_CODE : AUTH_ERROR_CODES[key];
}
