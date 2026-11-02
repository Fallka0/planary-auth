import type { Env } from "../env";
import { randomToken, sha256 } from "./crypto";

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash: string | null;
  email_verified: number;
  created_at: number;
  /** Set when staff ban the account. The row stays so the email can't sign up again. */
  banned_at: number | null;
  /** Set while staff have suspended the account; it ends at suspended_until, or when lifted if that's NULL. */
  suspended_at: number | null;
  suspended_until: number | null;
  suspend_reason: string | null;
}

/** Whether the account may sign in or use its tokens right now. */
export function blocked(user: User, t = now()): "banned" | "suspended" | null {
  if (user.banned_at) return "banned";
  if (user.suspended_at && (user.suspended_until === null || user.suspended_until > t)) return "suspended";
  return null;
}

/** The same test in SQL, for queries joined on users. ?1 is now. */
const ALLOWED_SQL = "users.banned_at IS NULL AND (users.suspended_at IS NULL OR (users.suspended_until IS NOT NULL AND users.suspended_until <= ?1))";

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
    banned_at: null,
    suspended_at: null,
    suspended_until: null,
    suspend_reason: null,
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
    `SELECT users.* FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.id_hash = ?2 AND sessions.expires_at > ?1 AND ${ALLOWED_SQL}`,
  )
    .bind(now(), await sha256(token))
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
  const user = row ? await userById(env, row.user_id) : null;
  return user && !blocked(user) ? user : null;
}

export async function revokeRefreshToken(env: Env, token: string) {
  await env.DB.prepare("DELETE FROM refresh_tokens WHERE token_hash = ?").bind(await sha256(token)).run();
}

/**
 * Bans an account: it can't sign in again, its sessions, app tokens and mail
 * links are gone, and /api/auth/me refuses its access tokens from now on.
 */
export async function banUser(env: Env, userId: string) {
  await env.DB.batch([
    env.DB.prepare("UPDATE users SET banned_at = COALESCE(banned_at, ?) WHERE id = ?").bind(now(), userId),
    env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId),
    env.DB.prepare("DELETE FROM refresh_tokens WHERE user_id = ?").bind(userId),
    env.DB.prepare("DELETE FROM email_tokens WHERE user_id = ?").bind(userId),
  ]);
}

/** Ends every sign-in of the account: sessions, app tokens and open mail links. It can sign in again unless blocked. */
export async function signOutEverywhere(env: Env, userId: string) {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(userId),
    env.DB.prepare("DELETE FROM refresh_tokens WHERE user_id = ?").bind(userId),
    env.DB.prepare("DELETE FROM email_tokens WHERE user_id = ?").bind(userId),
  ]);
}

/** Suspends the account until `until` (or until lifted) and signs it out everywhere. Nothing is deleted. */
export async function suspendUser(env: Env, userId: string, until: number | null, reason: string) {
  await env.DB.prepare("UPDATE users SET suspended_at = ?, suspended_until = ?, suspend_reason = ? WHERE id = ?").bind(now(), until, reason, userId).run();
  await signOutEverywhere(env, userId);
}

export async function liftSuspension(env: Env, userId: string) {
  await env.DB.prepare("UPDATE users SET suspended_at = NULL, suspended_until = NULL, suspend_reason = NULL WHERE id = ?").bind(userId).run();
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
