import type { Child } from "hono/jsx";
import { Layout } from "./Layout";

export interface Providers {
  google: boolean;
  github: boolean;
}

function withReturn(path: string, returnTo: string | null) {
  return returnTo ? `${path}?returnTo=${encodeURIComponent(returnTo)}` : path;
}

/** The page headline: one line per entry, each rising in on load. */
function Title({ lines }: { lines: string[] }) {
  return (
    <h1 id="au-h" class="d au-h">
      {lines.map((line, i) => (
        <>
          {i > 0 ? " " : null}
          <span class="ln">
            <span>{line}</span>
          </span>
        </>
      ))}
    </h1>
  );
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7.25" stroke="currentColor" stroke-width="1.5" />
      <path d="M8 4.5v4.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
      <circle cx="8" cy="11.2" r="1" fill="currentColor" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7.25" stroke="currentColor" stroke-width="1.5" />
      <path d="M5 8.2l2 2 4-4.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <path d="M4 10L10 4M5 4h5v5" />
    </svg>
  );
}

function Notice({ kind = "error", children }: { kind?: "error" | "info"; children: Child }) {
  return kind === "error" ? (
    <p class="note err" role="alert">
      <ErrorIcon />
      <span>{children}</span>
    </p>
  ) : (
    <p class="note info" role="status">
      <InfoIcon />
      <span>{children}</span>
    </p>
  );
}

function ReturnHint({ returnTo }: { returnTo: string | null }) {
  if (!returnTo) return null;
  return (
    <p class="au-ret">
      Afterwards you&rsquo;ll go back to <strong>{new URL(returnTo).host}</strong>
    </p>
  );
}

/** The account the page is about: initials, name and email. */
function AccountCard({ name, email }: { name: string; email: string }) {
  return (
    <div class="acct">
      <span class="av" aria-hidden="true">
        {name.slice(0, 2).toUpperCase()}
      </span>
      <span class="acct-c">
        <strong>{name}</strong>
        <span>{email}</span>
      </span>
    </div>
  );
}

/** The form's submit button; auth.js swaps the label for the form's data-busy text while it posts. */
function Submit({ children }: { children: Child }) {
  return (
    <button class="btn btn-ink btn-wide" type="submit">
      <span class="spin" aria-hidden="true"></span>
      <span class="go-t">{children}</span>
    </button>
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
      <div class="au-social">
        {providers.google ? (
          <a class="btn btn-line btn-wide" href={withReturn("/oauth/google", returnTo)}>
            <GoogleIcon />
            <span>{verb} with Google</span>
          </a>
        ) : null}
        {providers.github ? (
          <a class="btn btn-line btn-wide" href={withReturn("/oauth/github", returnTo)}>
            <GitHubIcon />
            <span>{verb} with GitHub</span>
          </a>
        ) : null}
      </div>
      <p class="au-or">
        <span>or with email</span>
      </p>
    </>
  );
}

/** A labelled input. Names are unique on every page, so the id is just the name. */
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
  const id = `f-${name}`;
  const password = type === "password";
  return (
    <div class="f">
      <label class="f-l" for={id}>
        {label}
      </label>
      <div class="f-box">
        <input
          id={id}
          class={password ? "pw" : undefined}
          name={name}
          type={type}
          value={value ?? ""}
          autocomplete={autocomplete}
          required
          minlength={minlength}
          aria-describedby={hint ? `${id}-h` : undefined}
        />
        {password ? (
          <button class="f-eye" type="button" data-eye aria-label="Show password" aria-pressed="false">
            Show
          </button>
        ) : null}
      </div>
      {hint ? (
        <span class="f-h" id={`${id}-h`}>
          {hint}
        </span>
      ) : null}
    </div>
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
      <Title lines={["Sign in"]} />
      <div class="au-after">
        <ReturnHint returnTo={p.returnTo} />
        {p.error ? <Notice>{p.error}</Notice> : null}
        {p.info ? <Notice kind="info">{p.info}</Notice> : null}
        <SocialButtons providers={p.providers} returnTo={p.returnTo} verb="Continue" />
        <form method="post" action={p.action ?? withReturn("/login", p.returnTo)} class="au-form" data-busy="Signing in…">
          <Field label="Email" name="email" type="email" value={p.email} autocomplete="email" />
          <Field label="Password" name="password" type="password" autocomplete="current-password" />
          <Submit>Sign in</Submit>
        </form>
        <p class="au-links">
          <a class="ul" href={withReturn("/signup", p.returnTo)}>
            Create an account
          </a>
          <a class="ul" href={withReturn("/reset", p.returnTo)}>
            Forgot password?
          </a>
        </p>
      </div>
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
      <Title lines={["Create", "account"]} />
      <div class="au-after">
        <ReturnHint returnTo={p.returnTo} />
        {p.error ? <Notice>{p.error}</Notice> : null}
        <SocialButtons providers={p.providers} returnTo={p.returnTo} verb="Sign up" />
        <form method="post" action={withReturn("/signup", p.returnTo)} class="au-form" data-busy="Creating account…">
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
          <Submit>Create account</Submit>
        </form>
        <p class="au-links">
          <a class="ul" href={withReturn("/", p.returnTo)}>
            I already have an account
          </a>
        </p>
      </div>
    </Layout>
  );
}

export function CheckMailPage(p: { email: string; kind: "verify" | "reset"; returnTo: string | null }) {
  return (
    <Layout title="Check your inbox">
      <Title lines={["Check your", "inbox"]} />
      <div class="au-after">
        <p class="au-lead">
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
        <p class="au-muted">Nothing there? Check spam, or wait a minute and try again.</p>
        <p class="au-links">
          <a class="ul" href={withReturn("/", p.returnTo)}>
            Back to sign in
          </a>
        </p>
      </div>
    </Layout>
  );
}

export function ResetRequestPage(p: { returnTo: string | null; error?: string; mailReady: boolean }) {
  return (
    <Layout title="Reset password">
      <Title lines={["Reset", "password"]} />
      <div class="au-after">
        {p.error ? <Notice>{p.error}</Notice> : null}
        {p.mailReady ? (
          <>
            <p class="au-lead">Enter your email and we&rsquo;ll send you a link to choose a new password.</p>
            <form method="post" action={withReturn("/reset", p.returnTo)} class="au-form top" data-busy="Sending…">
              <Field label="Email" name="email" type="email" autocomplete="email" />
              <Submit>Send reset link</Submit>
            </form>
          </>
        ) : (
          <Notice kind="info">
            Password reset by mail isn&rsquo;t switched on yet. Sign in with Google or GitHub, or ask the Planary team for a reset link. If you&rsquo;re
            still signed in, you can change your password under <a href="/account">Account</a>.
          </Notice>
        )}
        <p class="au-links">
          <a class="ul" href={withReturn("/", p.returnTo)}>
            Back to sign in
          </a>
        </p>
      </div>
    </Layout>
  );
}

export function NewPasswordPage(p: { token: string; error?: string }) {
  return (
    <Layout title="New password">
      <Title lines={["Choose a new", "password"]} />
      <div class="au-after">
        <form method="post" action="/reset/confirm" class="au-form top" data-busy="Saving…">
          {p.error ? <Notice>{p.error}</Notice> : null}
          <input type="hidden" name="token" value={p.token} />
          <Field label="New password" name="password" type="password" autocomplete="new-password" hint="At least 8 characters." minlength={8} />
          <Submit>Save password</Submit>
        </form>
      </div>
    </Layout>
  );
}

export function ContinuePage(p: { name: string; email: string; returnTo: string }) {
  return (
    <Layout title="Continue">
      <Title lines={["Welcome", "back"]} />
      <div class="au-after">
        <ReturnHint returnTo={p.returnTo} />
        <AccountCard name={p.name} email={p.email} />
        <form method="post" action={withReturn("/continue", p.returnTo)} class="au-form au-go" data-busy="Continuing…">
          <Submit>Continue as {p.name}</Submit>
        </form>
        <p class="au-links">
          <a class="ul" href={withReturn("/logout", p.returnTo)}>
            Use another account
          </a>
        </p>
      </div>
    </Layout>
  );
}

export function AccountPage(p: { name: string; email: string; apps: string[] }) {
  return (
    <Layout title="Your account">
      <Title lines={["You’re", "signed in"]} />
      <div class="au-after">
        <AccountCard name={p.name} email={p.email} />
        <p class="apps-h">Your Planary apps</p>
        <ul class="apps">
          {p.apps.map((url) => (
            <li>
              <a href={url}>
                <span>{new URL(url).host}</span>
                <ArrowIcon />
              </a>
            </li>
          ))}
        </ul>
        <p class="au-links">
          <a class="ul" href="/account">
            Name and password
          </a>
          <a class="ul" href="/logout">
            Sign out
          </a>
        </p>
      </div>
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
      <Title lines={["Account"]} />
      <div class="au-after">
        <AccountCard name={p.name} email={p.email} />

        <section class="sec" aria-labelledby="name-title">
          <h2 id="name-title" class="d sec-h">
            Name
          </h2>
          <form method="post" action={withReturn("/account/name", p.returnTo)} class="au-form" data-busy="Saving…">
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
            <Submit>Save name</Submit>
          </form>
        </section>

        <section class="sec" aria-labelledby="password-title">
          <h2 id="password-title" class="d sec-h">
            {p.hasPassword ? "Password" : "Set a password"}
          </h2>
          <form method="post" action={withReturn("/account/password", p.returnTo)} class="au-form" data-busy="Saving…">
            {p.saved === "password" ? <Notice kind="info">Password saved. Other devices and apps were signed out.</Notice> : null}
            {passwordError ? <Notice>{passwordError}</Notice> : null}
            {p.hasPassword ? (
              <Field label="Current password" name="current" type="password" autocomplete="current-password" />
            ) : (
              <p class="au-muted">You sign in with Google or GitHub. Add a password to sign in with your email too.</p>
            )}
            <Field label="New password" name="password" type="password" autocomplete="new-password" hint="At least 8 characters." minlength={8} />
            <Field label="Repeat new password" name="confirm" type="password" autocomplete="new-password" minlength={8} />
            <Submit>{p.hasPassword ? "Change password" : "Set password"}</Submit>
          </form>
        </section>

        <p class="au-links">
          {p.returnTo ? (
            <a class="ul" href={p.returnTo}>
              Back to {new URL(p.returnTo).host}
            </a>
          ) : (
            <a class="ul" href="/">
              Back
            </a>
          )}
          {p.hasPassword ? (
            <a class="ul" href="/reset">
              Forgot your password?
            </a>
          ) : null}
        </p>
      </div>
    </Layout>
  );
}

export function MessagePage(p: { title: string; body: string; action?: { href: string; label: string } }) {
  return (
    <Layout title={p.title}>
      <Title lines={[p.title]} />
      <div class="au-after">
        <p class="au-lead">{p.body}</p>
        {p.action ? (
          <p style="margin-top:36px">
            <a class="btn btn-ink" href={p.action.href}>
              {p.action.label}
            </a>
          </p>
        ) : null}
      </div>
    </Layout>
  );
}
