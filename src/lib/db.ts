import type { Env } from "../env";
import { randomToken, sha256 } from "./crypto";

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string | null;
  email_verified: number;
  created_at: number;
}

const DAY = 24 * 60 * 60 * 1000;
export const SESSION_TTL = 30 * DAY;
export const REFRESH_TTL = 30 * DAY;

export const now = () => Date.now();

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function userByEmail(env: Env, email: string) {
  return env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(normalizeEmail(email)).first<User>();
}

export async function userById(env: Env, id: string) {
  return env.DB.prepare("SELECT * FROM users WHERE id = ?").bind(id).first<User>();
}

export async function createUser(
  env: Env,
  data: { email: string; name: string; passwordHash: string | null; verified: boolean },
): Promise<User> {
  const user: User = {
    id: crypto.randomUUID(),
    email: normalizeEmail(data.email),
    name: data.name,
    password_hash: data.passwordHash,
    email_verified: data.verified ? 1 : 0,
    created_at: now(),
  };
  await env.DB.prepare(
    "INSERT INTO users (id, email, name, password_hash, email_verified, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(user.id, user.email, user.name, user.password_hash, user.email_verified, user.created_at)
    .run();
  return user;
}

// ── Browser sessions (auth.planary.ch cookie) ─────

export async function createSession(env: Env, userId: string): Promise<string> {
  const token = randomToken();
  await env.DB.prepare("INSERT INTO sessions (id_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .bind(await sha256(token), userId, now() + SESSION_TTL, now())
    .run();
  return token;
}

export async function sessionUser(env: Env, token: string | undefined): Promise<User | null> {
  if (!token) return null;
  return env.DB.prepare(
    "SELECT users.* FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.id_hash = ? AND sessions.expires_at > ?",
  )
    .bind(await sha256(token), now())
    .first<User>();
}

export async function deleteSession(env: Env, token: string | undefined) {
  if (!token) return;
  await env.DB.prepare("DELETE FROM sessions WHERE id_hash = ?").bind(await sha256(token)).run();
}

// ── Refresh tokens (handed to apps) ───────────────

export async function createRefreshToken(env: Env, userId: string): Promise<string> {
  const token = randomToken();
  await env.DB.prepare("INSERT INTO refresh_tokens (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .bind(await sha256(token), userId, now() + REFRESH_TTL, now())
    .run();
  return token;
}

/** Consumes a refresh token (single use) and returns its user. */
export async function consumeRefreshToken(env: Env, token: string): Promise<User | null> {
  const hash = await sha256(token);
  const row = await env.DB.prepare("DELETE FROM refresh_tokens WHERE token_hash = ? AND expires_at > ? RETURNING user_id")
    .bind(hash, now())
    .first<{ user_id: string }>();
  return row ? userById(env, row.user_id) : null;
}

export async function revokeRefreshToken(env: Env, token: string) {
  await env.DB.prepare("DELETE FROM refresh_tokens WHERE token_hash = ?").bind(await sha256(token)).run();
}

// ── Mail links ────────────────────────────────────

export async function createEmailToken(env: Env, userId: string, kind: "verify" | "reset", ttlMs: number) {
  const token = randomToken();
  await env.DB.prepare("DELETE FROM email_tokens WHERE user_id = ? AND kind = ?").bind(userId, kind).run();
  await env.DB.prepare("INSERT INTO email_tokens (token_hash, user_id, kind, expires_at) VALUES (?, ?, ?, ?)")
    .bind(await sha256(token), userId, kind, now() + ttlMs)
    .run();
  return token;
}

/** Validates without consuming (to show the reset form). */
export async function peekEmailToken(env: Env, token: string, kind: "verify" | "reset") {
  return env.DB.prepare("SELECT user_id FROM email_tokens WHERE token_hash = ? AND kind = ? AND expires_at > ?")
    .bind(await sha256(token), kind, now())
    .first<{ user_id: string }>();
}

export async function consumeEmailToken(env: Env, token: string, kind: "verify" | "reset") {
  return env.DB.prepare("DELETE FROM email_tokens WHERE token_hash = ? AND kind = ? AND expires_at > ? RETURNING user_id")
    .bind(await sha256(token), kind, now())
    .first<{ user_id: string }>();
}

// ── Rate limiting ─────────────────────────────────

/** Fixed-window counter. Returns false once `limit` is exceeded within `windowMs`. */
export async function allow(env: Env, key: string, limit: number, windowMs: number): Promise<boolean> {
  const t = now();
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (key, count, reset_at) VALUES (?1, 1, ?2)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN rate_limits.reset_at <= ?3 THEN 1 ELSE rate_limits.count + 1 END,
       reset_at = CASE WHEN rate_limits.reset_at <= ?3 THEN ?2 ELSE rate_limits.reset_at END
     RETURNING count`,
  )
    .bind(key, t + windowMs, t)
    .first<{ count: number }>();
  return (row?.count ?? 0) <= limit;
}
