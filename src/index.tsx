import { Hono, type Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { cors } from "hono/cors";
import type { Env } from "./env";
import { base64url, fromBase64url, hashPassword, safeEqual, sha256, verifyPassword } from "./lib/crypto";
import {
  allow,
  consumeEmailToken,
  consumeRefreshToken,
  createEmailToken,
  createRefreshToken,
  createSession,
  createUser,
  deleteSession,
  normalizeEmail,
  now,
  peekEmailToken,
  revokeRefreshToken,
  SESSION_TTL,
  sessionUser,
  type User,
  userByEmail,
  userById,
} from "./lib/db";
import { ACCESS_TOKEN_TTL, signAccessToken, verifyAccessToken } from "./lib/jwt";
import { mailConfigured, sendResetMail, sendVerifyMail } from "./lib/mail";
import { authorizationUrl, fetchProfile, type Provider, providerEnabled } from "./lib/oauth";
import { SCRIPT } from "./script";
import { STYLES } from "./styles";
import {
  AccountPage,
  CheckMailPage,
  ContinuePage,
  LoginPage,
  MessagePage,
  NewPasswordPage,
  ResetRequestPage,
  SettingsPage,
  SignupPage,
} from "./views/pages";

type C = Context<{ Bindings: Env }>;
const app = new Hono<{ Bindings: Env }>();

const SESSION_COOKIE = "pa_session";
const OAUTH_COOKIE = "pa_oauth";
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

// ── Helpers ───────────────────────────────────────

function allowedOrigins(env: Env) {
  return env.ALLOWED_RETURN_TO_ORIGINS.split(",")
    .map((o) => o.trim().replace(/\/+$/, ""))
    .filter(Boolean);
}

// Allowed return origins that aren't listed on the account page: the casino's games (casino.planary.ch
// stands for them), the admin tool, the customer portal and the old Vercel address of Nerve.
const UNLISTED_APPS = new Set([
  "21.planary.ch",
  "poker.planary.ch",
  "roulette.planary.ch",
  "slots.planary.ch",
  "admin.planary.ch",
  "portal.planary.ch",
  "planary-nerve.vercel.app",
]);

/** The apps the account page links to: the allowlist's https origins, minus the unlisted ones. */
function accountApps(env: Env) {
  return allowedOrigins(env).filter((o) => o.startsWith("https://") && !UNLISTED_APPS.has(new URL(o).host));
}

/** Only ever send tokens back to apps on the allowlist. */
function resolveReturnTo(env: Env, raw: string | undefined | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return allowedOrigins(env).includes(url.origin) ? url.toString() : null;
  } catch {
    return null;
  }
}

function providers(env: Env) {
  return { google: providerEnabled(env, "google"), github: providerEnabled(env, "github") };
}

function secureCookies(env: Env) {
  return env.PUBLIC_URL.startsWith("https://");
}

/** Forms must be posted from our own pages. */
function sameOrigin(c: C) {
  const origin = c.req.header("origin");
  if (!origin) return true;
  return origin === new URL(c.env.PUBLIC_URL).origin || origin === new URL(c.req.url).origin;
}

function clientIp(c: C) {
  return c.req.header("x-forwarded-for")?.split(",")[0]?.trim() || c.req.header("cf-connecting-ip") || "unknown";
}

function cleanName(raw: unknown) {
  return String(raw ?? "")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 24);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function form(c: C) {
  const body = await c.req.parseBody();
  const get = (key: string) => (typeof body[key] === "string" ? (body[key] as string) : "");
  return get;
}

async function startSession(c: C, user: User) {
  const token = await createSession(c.env, user.id);
  setCookie(c, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: secureCookies(c.env),
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_TTL / 1000,
  });
}

/** Hands the app a fresh token pair in the URL hash (same contract as the old planary-auth). */
async function finish(c: C, user: User, returnTo: string | null) {
  if (!returnTo) return c.redirect("/", 303);
  const accessToken = await signAccessToken(user, c.env.JWT_SECRET, c.env.PUBLIC_URL);
  const refreshToken = await createRefreshToken(c.env, user.id);
  const target = new URL(returnTo);
  target.hash = new URLSearchParams({
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: String(ACCESS_TOKEN_TTL),
    token_type: "bearer",
  }).toString();
  return c.redirect(target.toString(), 303);
}

function withReturn(path: string, returnTo: string | null) {
  return returnTo ? `${path}?returnTo=${encodeURIComponent(returnTo)}` : path;
}

// ── Pages ─────────────────────────────────────────

app.get("/styles.css", (c) =>
  c.body(STYLES, 200, { "Content-Type": "text/css; charset=utf-8", "Cache-Control": "public, max-age=31536000, immutable" }),
);

app.get("/auth.js", (c) =>
  c.body(SCRIPT, 200, { "Content-Type": "text/javascript; charset=utf-8", "Cache-Control": "public, max-age=31536000, immutable" }),
);

app.get("/", async (c) => {
  const returnTo = resolveReturnTo(c.env, c.req.query("returnTo"));
  const user = await sessionUser(c.env, getCookie(c, SESSION_COOKIE));
  // auto=silent asks without asking, for apps where signing in is optional: someone signed in
  // goes straight back with a token, someone who isn't goes straight back without one
  // (#sso=none) and never sees this page. returnTo is already checked against the allow list.
  if (returnTo && c.req.query("auto") === "silent") {
    if (user) return finish(c, user, returnTo);
    const back = new URL(returnTo);
    back.hash = "sso=none";
    return c.redirect(back.toString(), 303);
  }
  if (user) {
    // Apps pass auto=1 for single sign-on: an existing session goes straight back without a click.
    if (returnTo && c.req.query("auto") === "1") return finish(c, user, returnTo);
    if (returnTo) return c.html(<ContinuePage name={user.name} email={user.email} returnTo={returnTo} />);
    return c.html(<AccountPage name={user.name} email={user.email} apps={accountApps(c.env)} />);
  }
  const error = c.req.query("error") === "oauth" ? "That sign-in didn't go through. Please try again." : undefined;
  return c.html(<LoginPage returnTo={returnTo} providers={providers(c.env)} error={error} />);
});

app.post("/login", async (c) => {
  const returnTo = resolveReturnTo(c.env, c.req.query("returnTo"));
  if (!sameOrigin(c)) return c.text("Forbidden", 403);
  const get = await form(c);
  const email = normalizeEmail(get("email"));
  const password = get("password");
  // Signing in from /account goes back there, so a failed try keeps the form pointed at it.
  const action = c.req.query("then") === "account" ? `/login${new URL(c.req.url).search}` : undefined;
  const page = (error: string, status: 400 | 401 | 429 = 401) =>
    c.html(<LoginPage returnTo={action ? null : returnTo} providers={providers(c.env)} error={error} email={email} action={action} />, status);

  if (!(await allow(c.env, `login:ip:${clientIp(c)}`, 30, 15 * MINUTE)) || !(await allow(c.env, `login:email:${email}`, 10, 15 * MINUTE))) {
    return page("Too many attempts. Wait a few minutes and try again.", 429);
  }
  const user = await userByEmail(c.env, email);
  const ok = await verifyPassword(password, user?.password_hash ?? null);
  if (!user || !ok) {
    return page(user && !user.password_hash ? "This account uses Google or GitHub. Continue with that button above." : "Wrong email or password.");
  }
  if (!user.email_verified && mailConfigured(c.env)) {
    const token = await createEmailToken(c.env, user.id, "verify", 24 * HOUR);
    await sendVerifyMail(c.env, user.email, user.name, `${c.env.PUBLIC_URL}${withReturn(`/verify/${token}`, returnTo)}`);
    return page("Confirm your email first. We just sent you a new link.", 401);
  }
  await startSession(c, user);
  if (c.req.query("then") === "account") return c.redirect(withReturn("/account", returnTo), 303);
  return finish(c, user, returnTo);
});

app.get("/signup", (c) => {
  const returnTo = resolveReturnTo(c.env, c.req.query("returnTo"));
  return c.html(<SignupPage returnTo={returnTo} providers={providers(c.env)} />);
});

app.post("/signup", async (c) => {
  const returnTo = resolveReturnTo(c.env, c.req.query("returnTo"));
  if (!sameOrigin(c)) return c.text("Forbidden", 403);
  const get = await form(c);
  const name = cleanName(get("name"));
  const email = normalizeEmail(get("email"));
  const password = get("password");
  const page = (error: string, status: 400 | 409 | 429 = 400) =>
    c.html(<SignupPage returnTo={returnTo} providers={providers(c.env)} error={error} values={{ name, email }} />, status);

  if (!(await allow(c.env, `signup:ip:${clientIp(c)}`, 10, HOUR))) return page("Too many new accounts from here. Try again later.", 429);
  if (name.length < 2) return page("Pick a display name with at least 2 characters.");
  if (!EMAIL.test(email) || email.length > 254) return page("That email address doesn't look right.");
  if (password.length < 8 || password.length > 200) return page("Use a password with at least 8 characters.");
  if (await userByEmail(c.env, email)) return page("There's already an account with this email. Sign in instead.", 409);

  const needsMail = mailConfigured(c.env);
  const user = await createUser(c.env, { email, name, passwordHash: await hashPassword(password), verified: !needsMail });
  if (needsMail) {
    const token = await createEmailToken(c.env, user.id, "verify", 24 * HOUR);
    await sendVerifyMail(c.env, user.email, user.name, `${c.env.PUBLIC_URL}${withReturn(`/verify/${token}`, returnTo)}`);
    return c.html(<CheckMailPage email={user.email} kind="verify" returnTo={returnTo} />);
  }
  await startSession(c, user);
  return finish(c, user, returnTo);
});

app.get("/verify/:token", async (c) => {
  const returnTo = resolveReturnTo(c.env, c.req.query("returnTo"));
  const row = await consumeEmailToken(c.env, c.req.param("token"), "verify");
  if (!row) {
    return c.html(
      <MessagePage
        title="Link expired"
        body="This confirmation link is no longer valid. Sign in and we'll send you a new one."
        action={{ href: withReturn("/", returnTo), label: "Go to sign in" }}
      />,
      400,
    );
  }
  await c.env.DB.prepare("UPDATE users SET email_verified = 1 WHERE id = ?").bind(row.user_id).run();
  const user = await userById(c.env, row.user_id);
  if (!user) return c.redirect("/", 303);
  await startSession(c, user);
  return finish(c, user, returnTo);
});

app.get("/reset", (c) => {
  const returnTo = resolveReturnTo(c.env, c.req.query("returnTo"));
  return c.html(<ResetRequestPage returnTo={returnTo} mailReady={mailConfigured(c.env)} />);
});

app.post("/reset", async (c) => {
  const returnTo = resolveReturnTo(c.env, c.req.query("returnTo"));
  if (!sameOrigin(c)) return c.text("Forbidden", 403);
  if (!mailConfigured(c.env)) return c.html(<ResetRequestPage returnTo={returnTo} mailReady={false} />);
  const email = normalizeEmail((await form(c))("email"));
  if (!(await allow(c.env, `reset:ip:${clientIp(c)}`, 10, HOUR)) || !(await allow(c.env, `reset:email:${email}`, 3, HOUR))) {
    return c.html(<ResetRequestPage returnTo={returnTo} mailReady error="Too many reset requests. Try again in an hour." />, 429);
  }
  const user = await userByEmail(c.env, email);
  if (user) {
    const token = await createEmailToken(c.env, user.id, "reset", HOUR);
    await sendResetMail(c.env, user.email, `${c.env.PUBLIC_URL}/reset/${token}`);
  }
  // Same answer either way, so the form can't be used to find out who has an account.
  return c.html(<CheckMailPage email={email} kind="reset" returnTo={returnTo} />);
});

app.get("/reset/:token", async (c) => {
  const token = c.req.param("token");
  if (!(await peekEmailToken(c.env, token, "reset"))) {
    return c.html(
      <MessagePage title="Link expired" body="This reset link is no longer valid. Ask for a new one." action={{ href: "/reset", label: "Reset password" }} />,
      400,
    );
  }
  return c.html(<NewPasswordPage token={token} />);
});

app.post("/reset/confirm", async (c) => {
  if (!sameOrigin(c)) return c.text("Forbidden", 403);
  const get = await form(c);
  const token = get("token");
  const password = get("password");
  if (password.length < 8 || password.length > 200) {
    return c.html(<NewPasswordPage token={token} error="Use a password with at least 8 characters." />, 400);
  }
  const row = await consumeEmailToken(c.env, token, "reset");
  if (!row) return c.html(<MessagePage title="Link expired" body="This reset link is no longer valid. Ask for a new one." action={{ href: "/reset", label: "Reset password" }} />, 400);
  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE users SET password_hash = ?, email_verified = 1 WHERE id = ?").bind(await hashPassword(password), row.user_id),
    // A new password signs out every existing session and app token.
    c.env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(row.user_id),
    c.env.DB.prepare("DELETE FROM refresh_tokens WHERE user_id = ?").bind(row.user_id),
  ]);
  const user = await userById(c.env, row.user_id);
  if (user) await startSession(c, user);
  return c.redirect("/", 303);
});

// ── Account settings ──────────────────────────────

function accountLogin(c: C, returnTo: string | null) {
  const action = `/login?then=account${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ""}`;
  return c.html(<LoginPage returnTo={null} providers={providers(c.env)} info="Sign in to change your name or password." action={action} />);
}

app.get("/account", async (c) => {
  const returnTo = resolveReturnTo(c.env, c.req.query("returnTo"));
  const user = await sessionUser(c.env, getCookie(c, SESSION_COOKIE));
  if (!user) return accountLogin(c, returnTo);
  const saved = c.req.query("saved");
  return c.html(
    <SettingsPage
      name={user.name}
      email={user.email}
      hasPassword={Boolean(user.password_hash)}
      returnTo={returnTo}
      saved={saved === "name" || saved === "password" ? saved : undefined}
    />,
  );
});

app.post("/account/name", async (c) => {
  const returnTo = resolveReturnTo(c.env, c.req.query("returnTo"));
  if (!sameOrigin(c)) return c.text("Forbidden", 403);
  const user = await sessionUser(c.env, getCookie(c, SESSION_COOKIE));
  if (!user) return accountLogin(c, returnTo);
  const name = cleanName((await form(c))("name"));
  const page = (message: string, status: 400 | 429) =>
    c.html(
      <SettingsPage name={user.name} email={user.email} hasPassword={Boolean(user.password_hash)} returnTo={returnTo} error={{ form: "name", message }} nameValue={name} />,
      status,
    );
  if (!(await allow(c.env, `name:user:${user.id}`, 10, HOUR))) return page("You changed your name a lot just now. Try again in an hour.", 429);
  if (name.length < 2) return page("Pick a display name with at least 2 characters.", 400);
  if (name !== user.name) await c.env.DB.prepare("UPDATE users SET name = ? WHERE id = ?").bind(name, user.id).run();
  return c.redirect(`${withReturn("/account", returnTo)}${returnTo ? "&" : "?"}saved=name`, 303);
});

app.post("/account/password", async (c) => {
  const returnTo = resolveReturnTo(c.env, c.req.query("returnTo"));
  if (!sameOrigin(c)) return c.text("Forbidden", 403);
  const sessionToken = getCookie(c, SESSION_COOKIE);
  const user = await sessionUser(c.env, sessionToken);
  if (!user || !sessionToken) return accountLogin(c, returnTo);
  const get = await form(c);
  const password = get("password");
  const page = (message: string, status: 400 | 401 | 429) =>
    c.html(<SettingsPage name={user.name} email={user.email} hasPassword={Boolean(user.password_hash)} returnTo={returnTo} error={{ form: "password", message }} />, status);

  if (!(await allow(c.env, `password:user:${user.id}`, 10, 15 * MINUTE))) return page("Too many attempts. Wait a few minutes and try again.", 429);
  // Accounts that only use Google or GitHub have no password to confirm yet.
  if (user.password_hash && !(await verifyPassword(get("current"), user.password_hash))) return page("Your current password isn't right.", 401);
  if (password.length < 8 || password.length > 200) return page("Use a password with at least 8 characters.", 400);
  if (password !== get("confirm")) return page("The two new passwords don't match.", 400);

  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?").bind(await hashPassword(password), user.id),
    // A new password signs out every other session and every app token; this browser stays signed in.
    c.env.DB.prepare("DELETE FROM sessions WHERE user_id = ? AND id_hash <> ?").bind(user.id, await sha256(sessionToken)),
    c.env.DB.prepare("DELETE FROM refresh_tokens WHERE user_id = ?").bind(user.id),
  ]);
  return c.redirect(`${withReturn("/account", returnTo)}${returnTo ? "&" : "?"}saved=password`, 303);
});

app.post("/continue", async (c) => {
  const returnTo = resolveReturnTo(c.env, c.req.query("returnTo"));
  if (!sameOrigin(c)) return c.text("Forbidden", 403);
  const user = await sessionUser(c.env, getCookie(c, SESSION_COOKIE));
  if (!user) return c.redirect(withReturn("/", returnTo), 303);
  return finish(c, user, returnTo);
});

app.get("/logout", async (c) => {
  const returnTo = resolveReturnTo(c.env, c.req.query("returnTo"));
  await deleteSession(c.env, getCookie(c, SESSION_COOKIE));
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.redirect(withReturn("/", returnTo), 303);
});

// ── Google / GitHub ───────────────────────────────

app.get("/oauth/:provider", async (c) => {
  const provider = c.req.param("provider") as Provider;
  if ((provider !== "google" && provider !== "github") || !providerEnabled(c.env, provider)) return c.notFound();
  const returnTo = resolveReturnTo(c.env, c.req.query("returnTo"));
  const { url, state, verifier } = await authorizationUrl(c.env, provider);
  setCookie(c, OAUTH_COOKIE, base64url(new TextEncoder().encode(JSON.stringify({ state, verifier, provider, returnTo }))), {
    httpOnly: true,
    secure: secureCookies(c.env),
    sameSite: "Lax",
    path: "/oauth",
    maxAge: 600,
  });
  return c.redirect(url, 302);
});

app.get("/oauth/:provider/callback", async (c) => {
  const provider = c.req.param("provider") as Provider;
  const raw = getCookie(c, OAUTH_COOKIE);
  deleteCookie(c, OAUTH_COOKIE, { path: "/oauth" });
  let saved: { state: string; verifier: string; provider: Provider; returnTo: string | null } | null = null;
  try {
    saved = raw ? JSON.parse(new TextDecoder().decode(fromBase64url(raw))) : null;
  } catch {
    saved = null;
  }
  const code = c.req.query("code");
  if (!saved || saved.provider !== provider || saved.state !== c.req.query("state") || !code) {
    return c.redirect("/?error=oauth", 303);
  }
  const returnTo = resolveReturnTo(c.env, saved.returnTo);

  try {
    const profile = await fetchProfile(c.env, provider, code, saved.verifier);
    const linked = await c.env.DB.prepare("SELECT user_id FROM oauth_accounts WHERE provider = ? AND provider_user_id = ?")
      .bind(provider, profile.providerUserId)
      .first<{ user_id: string }>();

    let user = linked ? await userById(c.env, linked.user_id) : null;
    if (!user) {
      if (!profile.emailVerified) return c.redirect(withReturn("/?error=oauth", returnTo), 303);
      // Same verified email as an existing account: link them instead of creating a duplicate.
      user =
        (await userByEmail(c.env, profile.email)) ??
        (await createUser(c.env, { email: profile.email, name: cleanName(profile.name) || "Player", passwordHash: null, verified: true }));
      await c.env.DB.batch([
        c.env.DB.prepare("INSERT OR IGNORE INTO oauth_accounts (provider, provider_user_id, user_id, created_at) VALUES (?, ?, ?, ?)").bind(
          provider,
          profile.providerUserId,
          user.id,
          now(),
        ),
        c.env.DB.prepare("UPDATE users SET email_verified = 1 WHERE id = ?").bind(user.id),
      ]);
    }
    await startSession(c, user);
    return finish(c, user, returnTo);
  } catch (error) {
    console.error("oauth callback failed", provider, error);
    return c.redirect(withReturn("/?error=oauth", returnTo), 303);
  }
});

// ── API for Planary apps ──────────────────────────

app.use(
  "/api/*",
  cors({
    origin: (origin, c) => (allowedOrigins(c.env).includes(origin) ? origin : null),
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Authorization", "Content-Type"],
    // planary.ch asks /api/session with the session cookie (same site, so the Lax cookie goes along).
    credentials: true,
    maxAge: 86400,
  }),
);

app.get("/api/health", (c) => c.json({ status: "ok" }));

app.get("/api/config", (c) => c.json({ appOrigins: allowedOrigins(c.env) }));

/**
 * Who is signed in on auth.planary.ch, read from the session cookie. For pages without their own
 * token, like planary.ch, to show a profile menu instead of "Sign in". CORS keeps the answer to
 * the allowed Planary origins.
 */
app.get("/api/session", async (c) => {
  c.header("Cache-Control", "no-store");
  const user = await sessionUser(c.env, getCookie(c, SESSION_COOKIE));
  if (!user) return c.json({ signedIn: false });
  return c.json({ signedIn: true, user: { name: user.name, email: user.email } });
});

app.get("/api/auth/me", async (c) => {
  const token = c.req.header("authorization")?.replace(/^Bearer\s+/i, "");
  const claims = token ? await verifyAccessToken(token, c.env.JWT_SECRET) : null;
  const user = claims ? await userById(c.env, claims.sub) : null;
  if (!user) return c.json({ error: "not authenticated" }, 401);
  return c.json({ user: { id: user.id, email: user.email, name: user.name, createdAt: new Date(user.created_at).toISOString() } });
});

/** Swaps a refresh token for a new pair (rotation: every refresh token works once). */
app.post("/api/auth/refresh", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { refresh_token?: string };
  if (!body.refresh_token) return c.json({ error: "missing refresh_token" }, 400);
  const user = await consumeRefreshToken(c.env, body.refresh_token);
  if (!user) return c.json({ error: "invalid refresh token" }, 401);
  return c.json({
    access_token: await signAccessToken(user, c.env.JWT_SECRET, c.env.PUBLIC_URL),
    refresh_token: await createRefreshToken(c.env, user.id),
    expires_in: ACCESS_TOKEN_TTL,
    token_type: "bearer",
  });
});

app.post("/api/auth/logout", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as { refresh_token?: string };
  if (body.refresh_token) await revokeRefreshToken(c.env, body.refresh_token);
  return c.json({ ok: true });
});

// ── Staff API (called by the casino API for admin.planary.ch) ─

/** Only callers holding ADMIN_API_KEY. Off entirely while it isn't set. */
function staffKeyOk(c: C) {
  const expected = c.env.ADMIN_API_KEY;
  const given = c.req.header("x-admin-key");
  if (!expected || !given) return false;
  const encoder = new TextEncoder();
  return safeEqual(encoder.encode(given), encoder.encode(expected));
}

/**
 * A link that lets the player choose a new password. Staff hand it over (and
 * it's mailed too when mail is set up); the password itself never passes
 * through anyone but the player.
 */
app.post("/api/admin/users/:id/reset-link", async (c) => {
  if (!staffKeyOk(c)) return c.json({ error: "forbidden" }, 403);
  const user = await userById(c.env, c.req.param("id"));
  if (!user) return c.json({ error: "No Planary account with that id." }, 404);
  const ttl = 24 * HOUR;
  const token = await createEmailToken(c.env, user.id, "reset", ttl);
  const link = `${c.env.PUBLIC_URL}/reset/${token}`;
  let mailed = false;
  if (mailConfigured(c.env)) {
    try {
      await sendResetMail(c.env, user.email, link, "24 hours");
      mailed = true;
    } catch (error) {
      console.error("reset mail failed", error);
    }
  }
  return c.json({ link, expiresAt: now() + ttl, mailed });
});

/**
 * Account totals for the Planary Console's overview, asked for by planary-org.
 * Counts only: no account is listed. Answers 404 without the internal key.
 */
app.get("/api/internal/stats", async (c) => {
  const expected = c.env.INTERNAL_KEY;
  const given = c.req.header("x-internal-key");
  const encoder = new TextEncoder();
  if (!expected || !given || !safeEqual(encoder.encode(given), encoder.encode(expected))) return c.json({ error: "not found" }, 404);
  const days = Math.min(Math.max(Number.parseInt(c.req.query("days") ?? "30", 10) || 30, 1), 365);
  const DAY = 24 * HOUR;
  const end = Math.floor(now() / DAY) * DAY + DAY;
  const start = end - days * DAY;
  const total = await c.env.DB.prepare("SELECT COUNT(*) AS n FROM users").first<{ n: number }>();
  const { results } = await c.env.DB.prepare(
    "SELECT CAST((created_at - ?1) / ?2 AS INTEGER) AS d, COUNT(*) AS n FROM users WHERE created_at >= ?1 AND created_at < ?3 GROUP BY d",
  )
    .bind(start, DAY, end)
    .all<{ d: number; n: number }>();
  const signups = Array.from({ length: days }, () => 0);
  for (const r of results) if (r.d >= 0 && r.d < days) signups[r.d] = r.n;
  // Active today (UTC): signed in here, or an app refreshed its token (refresh tokens rotate on every use).
  const active = await c.env.DB.prepare(
    "SELECT COUNT(DISTINCT user_id) AS n FROM (SELECT user_id FROM sessions WHERE created_at >= ?1 UNION ALL SELECT user_id FROM refresh_tokens WHERE created_at >= ?1)",
  )
    .bind(end - DAY)
    .first<{ n: number }>();
  return c.json({ accounts: total?.n ?? 0, accountsNew: signups.reduce((a, b) => a + b, 0), signups, activeToday: active?.n ?? 0 });
});

app.notFound((c) => c.html(<MessagePage title="Not found" body="There's nothing at this address." action={{ href: "/", label: "Go to sign in" }} />, 404));

app.onError((error, c) => {
  console.error(error);
  return c.html(<MessagePage title="Something went wrong" body="That didn't work on our side. Please try again in a moment." action={{ href: "/", label: "Back to sign in" }} />, 500);
});

export default app;
