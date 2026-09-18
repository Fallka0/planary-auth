# planary-auth

Central sign-in for every Planary app at **auth.planary.ch**. Runs on our own Cloudflare account: a Worker (Hono, server-rendered pages) with a D1 database. The Vercel project that owns the domain only proxies to the Worker (`vercel.json`).

Sign-in methods: email + password (PBKDF2), Google, GitHub. Mail (confirm address, reset password) goes through Resend once `RESEND_API_KEY` is set; until then new accounts are confirmed immediately and password reset is off.

## Contract for apps

1. Send people to `https://auth.planary.ch/?returnTo=<app URL>` (or `/signup?returnTo=…`). `returnTo` must be on `ALLOWED_RETURN_TO_ORIGINS` (`wrangler.jsonc`).
2. They come back to `returnTo#access_token=…&refresh_token=…&expires_in=3600&token_type=bearer`.
3. Verify with `GET /api/auth/me` (`Authorization: Bearer <access_token>`) → `{ user: { id, email, name, createdAt } }`.
4. Refresh with `POST /api/auth/refresh` `{ "refresh_token": "…" }` → a new pair. Refresh tokens are single-use.
5. Sign out an app with `POST /api/auth/logout` `{ "refresh_token": "…" }`.

The API allows CORS from the allowed origins. Access tokens are HS256 JWTs (`sub`, `email`, `name`, `exp`).

## Development

```bash
npm install
npm run db:migrate:local
npm run dev            # http://localhost:8787 (needs .dev.vars with PUBLIC_URL and JWT_SECRET)
```

## Deploy

```bash
npm run db:migrate     # schema changes
npm run deploy         # Worker
```

Secrets (`npx wrangler secret put <NAME>`): `JWT_SECRET`, `RESEND_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`.
OAuth callback URLs: `https://auth.planary.ch/oauth/google/callback`, `https://auth.planary.ch/oauth/github/callback`.
