export interface Env {
  DB: D1Database;
  /** Public origin users see, e.g. https://auth.planary.ch (the worker is reached through Vercel). */
  PUBLIC_URL: string;
  /** Comma-separated origins apps may be sent back to after sign-in. */
  ALLOWED_RETURN_TO_ORIGINS: string;
  MAIL_FROM: string;

  // Secrets (wrangler secret put …)
  JWT_SECRET: string;
  RESEND_API_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  /** Lets the casino API (for admin.planary.ch) make password reset links. Same value as AUTH_ADMIN_KEY there. */
  ADMIN_API_KEY?: string;

  /** Service binding to planary-vault-api. A ban deletes the account's Vault through it. */
  VAULT?: Fetcher;
  /** Shared with planary-vault-api (secret, same value as its INTERNAL_KEY). */
  VAULT_INTERNAL_KEY?: string;
}
