import { createHmac } from "crypto";

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Intercom's "Secure the Messenger for web" flow just needs a standard
// HS256 JWT signed with the Messenger API secret - not worth pulling in
// `jsonwebtoken` for ten lines of HMAC.
export function signIntercomJwt(
  claims: Record<string, unknown>,
  expiresInSeconds = 24 * 60 * 60,
): string | null {
  const secret = process.env.INTERCOM_JWT_SECRET;
  if (!secret) return null;

  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({ ...claims, exp }));
  const signature = base64url(createHmac("sha256", secret).update(`${header}.${payload}`).digest());
  return `${header}.${payload}.${signature}`;
}
