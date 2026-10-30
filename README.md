# planary-auth

Central sign-in for every Planary app at **auth.planary.ch**. Runs on our own Cloudflare account: a Worker (Hono, server-rendered pages) with a D1 database. The Vercel project that owns the domain only proxies to the Worker (`vercel.json`).

Sign-in methods: email + password (PBKDF2), Google, GitHub. Mail (confirm address, reset password) goes through Resend once `RESEND_API_KEY` is set; until then new accounts are confirmed immediately and password reset is off.

## Contract for apps

1. Send people to `https://auth.planary.ch/?returnTo=<app URL>` (or `/signup?returnTo=…`). `returnTo` must be on `ALLOWED_RETURN_TO_ORIGINS` (`wrangler.jsonc`). Add `&auto=1` for single sign-on: if the person is already signed in at auth.planary.ch they are sent straight back with tokens; otherwise they see the sign-in form.
2. They come back to `returnTo#access_token=…&refresh_token=…&expires_in=3600&token_type=bearer`.
3. Verify with `GET /api/auth/me` (`Authorization: Bearer <access_token>`) → `{ user: { id, email, name, createdAt } }`.
4. Refresh with `POST /api/auth/refresh` `{ "refresh_token": "…" }` → a new pair. Refresh tokens are single-use.
5. Sign out an app with `POST /api/auth/logout` `{ "refresh_token": "…" }`.

People change their name and password at `/account` (`?returnTo=<app URL>` adds a way back).

The API allows CORS from the allowed origins. Access tokens are HS256 JWTs (`sub`, `email`, `name`, `exp`).

## Development

```bash
npm install
npm run db:migrate:local
npm run dev            # http://localhost:8787 (needs .dev.vars with PUBLIC_URL and JWT_SECRET)
```

## Deploy

Every push to `main` deploys the Worker through `.github/workflows/deploy.yml` (needs the `CLOUDFLARE_API_TOKEN` repository secret). You can also run it from the Actions tab. To deploy by hand:

```bash
npm run db:migrate     # schema changes (never automatic; run before merging code that needs them)
npm run deploy         # Worker
```

Secrets (`npx wrangler secret put <NAME>`): `JWT_SECRET`, `RESEND_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ADMIN_API_KEY` (same value as `AUTH_ADMIN_KEY` on planary-casino-api; lets staff make password reset links).
`VAULT_INTERNAL_KEY` (same value as `INTERNAL_KEY` on planary-vault-api; lets a ban delete the account's Vault).
OAuth callback URLs: `https://auth.planary.ch/oauth/google/callback`, `https://auth.planary.ch/oauth/github/callback`.

## Bans

Staff ban an account from admin.planary.ch (casino API → `POST /api/admin/users/:id/ban`, `X-Admin-Key`). The account keeps its row with `banned_at` set, so the email can't sign up again, and:

- sign-in by password, Google/GitHub, `/continue`, the `auto=1` single sign-on, mail links and password reset all refuse it;
- its sessions, refresh tokens and mail links are deleted;
- `/api/auth/me` answers 401 for its access tokens, so apps drop it as soon as their cache of that answer runs out (at most 60 s);
- its Planary Vault is deleted through the `VAULT` service binding (`DELETE /internal/users/:id` on planary-vault-api). The answer says `vault: "deleted" | "not_configured" | "failed"`; banning again retries.

The `VAULT` binding is not in `wrangler.jsonc` yet because planary-vault-api isn't deployed (a binding to a missing Worker fails the deploy). Once it is, add `"services": [{ "binding": "VAULT", "service": "planary-vault-api" }]` and set `VAULT_INTERNAL_KEY`.
