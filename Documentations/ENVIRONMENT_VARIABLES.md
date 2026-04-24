# Environment Variables

The project uses two kinds of environment variables:

- `VITE_*` variables are bundled into the browser and are **public**.
- non-`VITE_*` variables are for server/build/Edge Functions and may be **secrets**.

Read `OBSERVABILITY_AND_ENV.md` for the “VITE rule”.

## Required vs optional

The `.env.example` file is split into:

- **REQUIRED ENV VARS (core app)** — needed for the site to load locally.
- **OPTIONAL ENV VARS (features + integrations)** — only needed if you use that feature.

## REQUIRED (core app)

### `SITE_URL`

What it does:
- Used by `server.js` and build scripts to build absolute URLs.

Where used:
- `server.js`
- `scripts/generate-sitemap.js`
- `scripts/generate-rss.js`

### `VITE_SITE_URL`

What it does:
- Frontend “canonical site URL” used by SEO helpers and absolute URL building.

Where used:
- `src/config/siteEnv.ts`

### `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY`

What it does:
- Connects the frontend to your Supabase project.

Where used:
- `src/integrations/supabase/client.ts`

Where to get them (Supabase Dashboard):
- Project Settings → API
  - `VITE_SUPABASE_URL`: Project URL
  - `VITE_SUPABASE_PUBLISHABLE_KEY`: anon/public API key

## OPTIONAL (features + integrations)

### Supabase server key — `SUPABASE_SERVICE_ROLE_KEY`

What it does:
- Allows server-side scripts/routes to read/write protected tables.

Where used:
- `server.js`
- `scripts/generate-sitemap.js`
- `scripts/generate-rss.js`

Where to get it:
- Supabase Dashboard → Project Settings → API → service_role key

Keep it secret:
- Do not expose it as `VITE_*`
- Do not commit it

Fallback vars (optional):
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_PUBLISHABLE_KEY`

These exist because some scripts/server code can fall back to non-Vite variable names.

### Discord OAuth (Connect Discord)

Vars:
- `VITE_DISCORD_CLIENT_ID` (public)
- `DISCORD_CLIENT_ID` (server/Edge Functions)
- `DISCORD_CLIENT_SECRET` (secret)
- `VITE_DISCORD_OAUTH_SCOPES` (optional)

What it does:
- Lets logged-in users link their Discord identity.

Where used:
- Frontend builds authorize URL in `src/services/chatBridgeService.ts`
- Edge Function exchanges the code in `supabase/functions/discord-oauth-exchange/index.ts`

Where to get them (Discord Developer Portal):
- Applications → (your app) → OAuth2
  - Client ID / Client Secret
  - Add redirect: `https://YOUR_DOMAIN/auth/discord/callback` (and dev localhost if needed)

### Discord bot + channel (live chat bridge)

Vars:
- `DISCORD_BOT_TOKEN` (secret)
- `DISCORD_CHAT_CHANNEL_ID`
- `DISCORD_CHAT_INGEST_SECRET` (optional)
- `DISCORD_GUILD_ID` (optional, only for auto-join endpoint)

What it does:
- Reads/writes the Discord channel used by DiscordSRV to bridge chat.

Where used:
- `supabase/functions/chat-send/index.ts`
- `supabase/functions/chat-poll-discord/index.ts`
- `server.js` (`/api/discord/join-server`)

Setup guide:
- `CHAT_BRIDGE_SETUP.md`

### Appeals webhook (optional)

Var:
- `APPEAL_DISCORD_WEBHOOK_URL`

What it does:
- Sends appeal submissions to a Discord webhook.

Where used:
- `server.js`

### Observability (optional)

PostHog (public):
- `VITE_PUBLIC_POSTHOG_PROJECT_TOKEN`
- `VITE_PUBLIC_POSTHOG_HOST`

Sentry:
- `VITE_SENTRY_DSN` (public)
- `SENTRY_AUTH_TOKEN` (secret; source map upload only)
- plus org/project/release values

Docs:
- `OBSERVABILITY_AND_ENV.md`
