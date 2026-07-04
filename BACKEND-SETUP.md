# Backend Setup

This project now uses:

- Supabase Auth in the frontend
- Cloudflare Worker API for `comments` and `likes`
- Supabase Postgres tables `public.comments` and `public.likes`

## 1. Supabase

Required manual checks in the Supabase Dashboard:

1. Open your Supabase project.
2. Confirm Email/Password auth is enabled.
3. Confirm Site URL matches the deployed site root:
   `https://seiya058904.github.io/seiya-digital-journal/`
4. Add Redirect URLs for:
   `https://seiya058904.github.io/seiya-digital-journal/`
   `https://seiya058904.github.io/seiya-digital-journal/#/auth`
   `http://localhost:5173/`
   `http://localhost:5173/#/auth`
5. Apply the SQL in:
   `supabase/migrations/20260704224500_create_interactions.sql`
   if you are setting up another environment.

This repo expects these frontend env vars:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_API_BASE_URL=
```

## 2. Cloudflare Worker

Worker name:

`seiya-digital-journal-api`

Required Worker secrets:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGINS`

Set secrets with Wrangler:

```powershell
cd "D:\xia zai\AI project\7.1 React\worker"
wrangler secret put SUPABASE_URL
wrangler secret put SUPABASE_PUBLISHABLE_KEY
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put ALLOWED_ORIGINS
```

Deploy:

```powershell
cd "D:\xia zai\AI project\7.1 React\worker"
npm install
npm run typecheck
wrangler deploy
```

## 3. GitHub Actions Secrets

Add these repository secrets before pushing a frontend deployment:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_API_BASE_URL`

## 4. Deployment Order

1. Create or choose the Supabase project.
2. Apply the interactions migration.
3. Confirm Supabase Auth URL configuration.
4. Configure Worker secrets.
5. Deploy the Worker.
6. Copy the Worker URL into `VITE_API_BASE_URL`.
7. Run `npm test`, `npm run lint`, and `npm run build`.
8. Push only when you are ready for GitHub Pages to rebuild.
9. Manually verify:
   `#/auth`
   `#/archive`
   Archive Stepper sign-in state
   Archive Stepper authenticated submit
