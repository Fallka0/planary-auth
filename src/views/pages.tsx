import type { Child } from "hono/jsx";
import { Layout } from "./Layout";

export interface Providers {
  google: boolean;
  github: boolean;
}

function withReturn(path: string, returnTo: string | null) {
  return returnTo ? `${path}?returnTo=${encodeURIComponent(returnTo)}` : path;
}

function Notice({ kind = "error", children }: { kind?: "error" | "info"; children: Child }) {
  return (
    <p class={`notice notice-${kind}`} role={kind === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}

function ReturnHint({ returnTo }: { returnTo: string | null }) {
  if (!returnTo) return null;
  return (
    <p class="return-hint">
      Afterwards you&rsquo;ll go back to <strong>{new URL(returnTo).host}</strong>
    </p>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.7V6.6h-4a12 12 0 0 0 0 10.9l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.7 0 3.3.6 4.5 1.8l3.4-3.4A11.9 11.9 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z"
      />
    </svg>
  );
}

function SocialButtons({ providers, returnTo, verb }: { providers: Providers; returnTo: string | null; verb: string }) {
  if (!providers.google && !providers.github) return null;
  return (
    <>
      <div class="social">
        {providers.google ? (
          <a class="btn btn-social" href={withReturn("/oauth/google", returnTo)}>
            <GoogleIcon /> {verb} with Google
          </a>
        ) : null}
        {providers.github ? (
          <a class="btn btn-social" href={withReturn("/oauth/github", returnTo)}>
            <GitHubIcon /> {verb} with GitHub
          </a>
        ) : null}
      </div>
      <p class="divider">
        <span>or with email</span>
      </p>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  autocomplete,
  hint,
  minlength,
}: {
  label: string;
  name: string;
  type?: string;
  value?: string;
  autocomplete: string;
  hint?: string;
  minlength?: number;
}) {
  return (
    <label class="field">
      <span class="field-label">{label}</span>
      <input name={name} type={type} value={value ?? ""} autocomplete={autocomplete} required minlength={minlength} />
      {hint ? <span class="field-hint">{hint}</span> : null}
    </label>
  );
}

// ── Pages ─────────────────────────────────────────

export function LoginPage(p: {
  returnTo: string | null;
  providers: Providers;
  error?: string;
  info?: string;
  email?: string;
  /** Where the form posts; /account sends people back to itself after signing in. */
  action?: string;
}) {
  return (
    <Layout title="Sign in">
      <h1>Sign in</h1>
      <ReturnHint returnTo={p.returnTo} />
      {p.error ? <Notice>{p.error}</Notice> : null}
      {p.info ? <Notice kind="info">{p.info}</Notice> : null}
      <SocialButtons providers={p.providers} returnTo={p.returnTo} verb="Continue" />
      <form method="post" action={p.action ?? withReturn("/login", p.returnTo)} class="form">
        <Field label="Email" name="email" type="email" value={p.email} autocomplete="email" />
        <Field label="Password" name="password" type="password" autocomplete="current-password" />
        <button class="btn btn-primary" type="submit">
          Sign in
        </button>
      </form>
      <p class="links">
        <a href={withReturn("/signup", p.returnTo)}>Create an account</a>
        <a href={withReturn("/reset", p.returnTo)}>Forgot password?</a>
      </p>
    </Layout>
  );
}

export function SignupPage(p: {
  returnTo: string | null;
  providers: Providers;
  error?: string;
  values?: { name?: string; email?: string };
}) {
  return (
    <Layout title="Create account">
      <h1>Create account</h1>
      <ReturnHint returnTo={p.returnTo} />
      {p.error ? <Notice>{p.error}</Notice> : null}
      <SocialButtons providers={p.providers} returnTo={p.returnTo} verb="Sign up" />
      <form method="post" action={withReturn("/signup", p.returnTo)} class="form">
        <Field
          label="Display name"
          name="name"
          value={p.values?.name}
          autocomplete="nickname"
          hint="Shown at tables and on leaderboards. 2–24 characters."
          minlength={2}
        />
        <Field label="Email" name="email" type="email" value={p.values?.email} autocomplete="email" />
        <Field label="Password" name="password" type="password" autocomplete="new-password" hint="At least 8 characters." minlength={8} />
        <button class="btn btn-primary" type="submit">
          Create account
        </button>
      </form>
      <p class="links">
        <a href={withReturn("/", p.returnTo)}>I already have an account</a>
      </p>
    </Layout>
  );
}

export function CheckMailPage(p: { email: string; kind: "verify" | "reset"; returnTo: string | null }) {
  return (
    <Layout title="Check your inbox">
      <h1>Check your inbox</h1>
      <p class="lead">
        {p.kind === "verify" ? (
          <>
            We sent a confirmation link to <strong>{p.email}</strong>. Open it to finish setting up your account.
          </>
        ) : (
          <>
            If an account exists for <strong>{p.email}</strong>, a link to set a new password is on its way. It&rsquo;s valid for one hour.
          </>
        )}
      </p>
      <p class="muted">Nothing there? Check spam, or wait a minute and try again.</p>
      <p class="links">
        <a href={withReturn("/", p.returnTo)}>Back to sign in</a>
      </p>
    </Layout>
  );
}

export function ResetRequestPage(p: { returnTo: string | null; error?: string; mailReady: boolean }) {
  return (
    <Layout title="Reset password">
      <h1>Reset password</h1>
      {p.error ? <Notice>{p.error}</Notice> : null}
      {p.mailReady ? (
        <>
          <p class="lead">Enter your email and we&rsquo;ll send you a link to choose a new password.</p>
          <form method="post" action={withReturn("/reset", p.returnTo)} class="form">
            <Field label="Email" name="email" type="email" autocomplete="email" />
            <button class="btn btn-primary" type="submit">
              Send reset link
            </button>
          </form>
        </>
      ) : (
        <Notice kind="info">
          Password reset by mail isn&rsquo;t switched on yet. Sign in with Google or GitHub, or ask the Planary team for a reset link. If you&rsquo;re
          still signed in, you can change your password under <a href="/account">Account</a>.
        </Notice>
      )}
      <p class="links">
        <a href={withReturn("/", p.returnTo)}>Back to sign in</a>
      </p>
    </Layout>
  );
}

export function NewPasswordPage(p: { token: string; error?: string }) {
  return (
    <Layout title="New password">
      <h1>Choose a new password</h1>
      {p.error ? <Notice>{p.error}</Notice> : null}
      <form method="post" action="/reset/confirm" class="form">
        <input type="hidden" name="token" value={p.token} />
        <Field label="New password" name="password" type="password" autocomplete="new-password" hint="At least 8 characters." minlength={8} />
        <button class="btn btn-primary" type="submit">
          Save password
        </button>
      </form>
    </Layout>
  );
}

export function ContinuePage(p: { name: string; email: string; returnTo: string }) {
  return (
    <Layout title="Continue">
      <h1>Welcome back</h1>
      <ReturnHint returnTo={p.returnTo} />
      <div class="account-card">
        <span class="avatar" aria-hidden="true">
          {p.name.slice(0, 2).toUpperCase()}
        </span>
        <span class="account-copy">
          <strong>{p.name}</strong>
          <span>{p.email}</span>
        </span>
      </div>
      <form method="post" action={withReturn("/continue", p.returnTo)} class="form">
        <button class="btn btn-primary" type="submit">
          Continue as {p.name}
        </button>
      </form>
      <p class="links">
        <a href={withReturn("/logout", p.returnTo)}>Use another account</a>
      </p>
    </Layout>
  );
}

export function AccountPage(p: { name: string; email: string; apps: string[] }) {
  return (
    <Layout title="Your account">
      <h1>You&rsquo;re signed in</h1>
      <div class="account-card">
        <span class="avatar" aria-hidden="true">
          {p.name.slice(0, 2).toUpperCase()}
        </span>
        <span class="account-copy">
          <strong>{p.name}</strong>
          <span>{p.email}</span>
        </span>
      </div>
      <ul class="app-links">
        {p.apps.map((url) => (
          <li>
            <a class="btn btn-quiet" href={url}>
              {new URL(url).host}
            </a>
          </li>
        ))}
      </ul>
      <p class="links">
        <a href="/account">Name and password</a>
        <a href="/logout">Sign out</a>
      </p>
    </Layout>
  );
}

/** Change the account's name and password. Everything here is the account's, shared by every Planary app. */
export function SettingsPage(p: {
  name: string;
  email: string;
  hasPassword: boolean;
  returnTo: string | null;
  saved?: "name" | "password";
  error?: { form: "name" | "password"; message: string };
  nameValue?: string;
}) {
  const nameError = p.error?.form === "name" ? p.error.message : null;
  const passwordError = p.error?.form === "password" ? p.error.message : null;
  return (
    <Layout title="Account">
      <h1>Account</h1>
      <div class="account-card">
        <span class="avatar" aria-hidden="true">
          {p.name.slice(0, 2).toUpperCase()}
        </span>
        <span class="account-copy">
          <strong>{p.name}</strong>
          <span>{p.email}</span>
        </span>
      </div>

      <form method="post" action={withReturn("/account/name", p.returnTo)} class="form" aria-labelledby="name-title">
        <h2 id="name-title" class="section-title">
          Name
        </h2>
        {p.saved === "name" ? <Notice kind="info">Name saved.</Notice> : null}
        {nameError ? <Notice>{nameError}</Notice> : null}
        <Field
          label="Display name"
          name="name"
          value={p.nameValue ?? p.name}
          autocomplete="nickname"
          hint="Your name in every Planary app, unless you picked a different one there. 2–24 characters."
          minlength={2}
        />
        <button class="btn btn-primary" type="submit">
          Save name
        </button>
      </form>

      <form method="post" action={withReturn("/account/password", p.returnTo)} class="form" aria-labelledby="password-title">
        <h2 id="password-title" class="section-title">
          {p.hasPassword ? "Password" : "Set a password"}
        </h2>
        {p.saved === "password" ? <Notice kind="info">Password saved. Other devices and apps were signed out.</Notice> : null}
        {passwordError ? <Notice>{passwordError}</Notice> : null}
        {p.hasPassword ? (
          <Field label="Current password" name="current" type="password" autocomplete="current-password" />
        ) : (
          <p class="muted">You sign in with Google or GitHub. Add a password to sign in with your email too.</p>
        )}
        <Field label="New password" name="password" type="password" autocomplete="new-password" hint="At least 8 characters." minlength={8} />
        <Field label="Repeat new password" name="confirm" type="password" autocomplete="new-password" minlength={8} />
        <button class="btn btn-primary" type="submit">
          {p.hasPassword ? "Change password" : "Set password"}
        </button>
      </form>

      <p class="links">
        {p.returnTo ? <a href={p.returnTo}>Back to {new URL(p.returnTo).host}</a> : <a href="/">Back</a>}
        {p.hasPassword ? <a href="/reset">Forgot your password?</a> : null}
      </p>
    </Layout>
  );
}

export function MessagePage(p: { title: string; body: string; action?: { href: string; label: string } }) {
  return (
    <Layout title={p.title}>
      <h1>{p.title}</h1>
      <p class="lead">{p.body}</p>
      {p.action ? (
        <a class="btn btn-primary" href={p.action.href}>
          {p.action.label}
        </a>
      ) : null}
    </Layout>
  );
}
