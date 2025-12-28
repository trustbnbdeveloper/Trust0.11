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


## CI: Auto-deploy via GitHub Actions

A GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) is included that builds the site and deploys to Cloudflare Pages on pushes to `main`.

Required repository secrets:
- **CF_API_TOKEN** — Cloudflare API token with Pages write permissions (recommend: `pages` & `account` write scope).
- **CF_ACCOUNT_ID** — Your Cloudflare Account ID (for this account: `450d58f9ab82a5bafe3c859588d362dc`).

How it works:
1. Add the two secrets in your repository (Settings → Secrets and variables → Actions).
2. Push to `main` and the workflow will build `outdist` and deploy it to the Pages project `trustbnb-ecosystem`.

If you want, I can also add a check to the workflow to run tests before deploy or open a PR that wires everything up.
