# planary-auth

Central auth entrypoint for all Planary web apps.

## Required environment variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `ALLOWED_RETURN_TO_ORIGINS`

Example:

```bash
ALLOWED_RETURN_TO_ORIGINS=https://wishlist.planary.ch,https://dashboard.planary.ch,http://localhost:5173
```

## Local development

Frontend:

```bash
npm install
npm run dev
```

API:

```bash
go run ./cmd/local-api
```
