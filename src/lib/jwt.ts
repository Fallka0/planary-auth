import { base64url, fromBase64url } from "./crypto";

// Access tokens are short-lived HS256 JWTs. Apps only read sub/email/name/exp; they verify via /api/auth/me.

export interface AccessClaims {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
  iss: string;
}

export const ACCESS_TOKEN_TTL = 60 * 60;

const encoder = new TextEncoder();

async function key(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

export async function signAccessToken(
  user: { id: string; email: string; name: string },
  secret: string,
  issuer: string,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const claims: AccessClaims = { sub: user.id, email: user.email, name: user.name, iat: now, exp: now + ACCESS_TOKEN_TTL, iss: issuer };
  const head = base64url(encoder.encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = base64url(encoder.encode(JSON.stringify(claims)));
  const signature = await crypto.subtle.sign("HMAC", await key(secret), encoder.encode(`${head}.${body}`));
  return `${head}.${body}.${base64url(signature)}`;
}

export async function verifyAccessToken(token: string, secret: string): Promise<AccessClaims | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [head, body, signature] = parts;
  try {
    const header = JSON.parse(new TextDecoder().decode(fromBase64url(head)));
    if (header.alg !== "HS256") return null;
    const valid = await crypto.subtle.verify("HMAC", await key(secret), fromBase64url(signature), encoder.encode(`${head}.${body}`));
    if (!valid) return null;
    const claims = JSON.parse(new TextDecoder().decode(fromBase64url(body))) as AccessClaims;
    if (typeof claims.exp !== "number" || claims.exp < Math.floor(Date.now() / 1000)) return null;
    return claims;
  } catch {
    return null;
  }
}
