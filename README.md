<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

To test the Worker proxy locally:
- Start the Worker in dev mode: `npm run dev:worker` (this runs `wrangler dev`)
- Add the secret for testing: `npx wrangler secret put GEMINI_API_KEY` (or set it in Cloudflare dashboard)


## Deploy to Cloudflare Pages (one-command)

This project includes a convenience `deploy` script which builds the site into `outdist` and publishes to your Cloudflare Pages project via Wrangler.

1. Build & publish (must be authenticated with `wrangler login`):

   `npm run deploy`

Note: the script uses the Pages project name `trustbnb-ecosystem` and deploys the `outdist` directory. Update the project name if you use a different Pages project.

### Secure the Gemini API key with a Worker

This repo now includes a Cloudflare Worker proxy that lets your frontend call the models without exposing your Gemini API key.

1. Publish the Worker (after logging in with `wrangler login`):
   - `npm run deploy:worker` (or `npx wrangler publish`)
2. Add your Gemini secret to the Worker:
   - `npx wrangler secret put GEMINI_API_KEY`
3. Frontend calls `/api/generate` (this repo uses `/api/generate` and a local proxy in `services/geminiProxy.ts`).

Worker payload & response (example)

Request (POST /api/generate):
```
{ "userMessage": "Summarize revenue trends.", "context": "Revenue Data: ..." }
```

Worker forwards a Gemini REST-style body and returns JSON:
```
{ "text": "2-sentence summary...", "raw": { /* full provider response */ } }
```

Notes:
- Keep your key secret — do not inject it into the client bundle.
- You can bind the Worker to your domain or use `workers_dev` during development.
- Set `wrangler.toml`'s `account_id` to your Cloudflare Account ID and optionally `EXTERNAL_API_URL` or `MODEL` if you need custom endpoints.


## Integrate Supabase 🔧

To enable authentication and storage with Supabase, set the following environment variables locally and in Cloudflare Pages (Dashboard → Pages → Environment variables):

- `VITE_SUPABASE_URL` — your Supabase project URL (visible to client)
- `VITE_SUPABASE_ANON_KEY` — anon/public key (visible to client)

If you need server-side access from a Worker (for admin operations), set a **service role** key as a secret in your Worker (do NOT expose it to client):

- `SUPABASE_SERVICE_ROLE_KEY` — set via `npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY` or via Cloudflare Dashboard.

Minimal SQL to create common tables (run in Supabase SQL editor):

```sql
create table profiles (
  id uuid primary key references auth.users(id),
  name text,
  avatar text,
  wishlist jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);
```

Notes:
- Use `supabase.auth` on the client for sign-up / sign-in (the app now includes a `services/supabaseClient.ts` and `contexts/AuthContext.tsx` wired to Supabase).
- For Pages: set `VITE_` env vars in the Pages site settings so the client bundle can read them at build time.
- For Workers: use `SUPABASE_SERVICE_ROLE_KEY` as a **secret** via Wrangler or the Dashboard — never commit it.


## CI: Auto-deploy via GitHub Actions

A GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) is included that builds the site and deploys to Cloudflare Pages on pushes to `main`.

Required repository secrets:
- **CF_API_TOKEN** — Cloudflare API token with Pages write permissions (recommend: `pages` & `account` write scope).
- **CF_ACCOUNT_ID** — Your Cloudflare Account ID (for this account: `450d58f9ab82a5bafe3c859588d362dc`).

How it works:
1. Add the two secrets in your repository (Settings → Secrets and variables → Actions).
2. Push to `main` and the workflow will build `outdist` and deploy it to the Pages project `trustbnb-ecosystem`.

If you want, I can also add a check to the workflow to run tests before deploy or open a PR that wires everything up.


## Automated Deploy + Optional Seed (GitHub Actions) ⚙️

A workflow is provided at `.github/workflows/deploy-and-seed.yml` that will:
- Build and deploy the Pages site on `push` to `main`.
- Publish the Worker after a successful build.
- Optionally run the Supabase seed script when triggered manually (workflow dispatch) with `run_seed: true`.

Required repository secrets for the workflow to run fully (add in GitHub repo Settings → Secrets):
- `CF_API_TOKEN` — Cloudflare API token with Pages & Workers write permissions.
- `CF_ACCOUNT_ID` — Cloudflare Account ID.
- `SUPABASE_URL` — same as `VITE_SUPABASE_URL` (for seed job env).
- `SUPABASE_SERVICE_ROLE_KEY` — **service role key** (used only by the seed step; keep this secret!)
- `SUPABASE_DB_URL` — (optional) Postgres connection string to allow the seed script to run automatic DDL (create tables). Provide this only if you want the workflow/script to run migrations automatically.

How to seed (recommended manual dispatch):

1. Add `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` to your repo secrets. If you want automatic DDL/migrations, also add `SUPABASE_DB_URL`.
2. In GitHub → Actions → `Deploy Pages & Worker (optional seed)` → Run workflow → set `run_seed` = `true` → Run.

If you'd like seeding to run automatically on push to `main`, add a repo secret `SEED_ON_PUSH` and set it to `true` (recommended only when you're ready for automatic DB writes).

Add/update repository secrets via GitHub UI (Settings → Secrets & variables → Actions) or with the GitHub CLI (`gh`):

- gh (GitHub CLI) example (replace OWNER/REPO and value):
  - gh secret set SUPABASE_SERVICE_ROLE_KEY --body "sb_secret_..." --repo OWNER/REPO
  - gh secret set SUPABASE_URL --body "https://xyz.supabase.co" --repo OWNER/REPO
  - gh secret set SUPABASE_DB_URL --body "postgresql://postgres:...@db.xyz.supabase.co:5432/postgres" --repo OWNER/REPO
  - gh secret set SEED_ON_PUSH --body "true" --repo OWNER/REPO

Add Cloudflare token & account secrets as well (required for Pages/Worker deploy):
  - gh secret set CF_API_TOKEN --body "<your-token>" --repo OWNER/REPO
  - gh secret set CF_ACCOUNT_ID --body "<account-id>" --repo OWNER/REPO

You can also run the included helper to set repo secrets using the GitHub CLI (PowerShell):

- `pwsh ./scripts/setRepoSecrets.ps1 -SupabaseUrl "https://..." -SupabaseServiceRoleKey "sb_secret_..." -SupabaseDbUrl "postgresql://..." -CfApiToken "..." -CfAccountId "..." -SeedOnPush "true"`

Notes:
- The seed is idempotent for the `profiles` upsert and will now attempt to create the `profiles` table automatically if `SUPABASE_DB_URL` is provided.
- For local runs, you can run `SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed:supabase`.
- To enable automatic DDL locally/CI, also set `SUPABASE_DB_URL` with your Postgres connection string (bear in mind this is sensitive — treat it like a secret).
