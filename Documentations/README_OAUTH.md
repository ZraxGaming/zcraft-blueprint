# Authentication & OAuth — Overview

This project uses Supabase Auth for primary login, plus an optional “Connect Discord” flow used by the live chat bridge.

## Primary login (Supabase Auth)

Implemented providers:

- Email/password
- OAuth via Supabase: Discord, GitHub, Google

How it works:

- The frontend starts OAuth with `supabase.auth.signInWithOAuth(...)`
- Supabase redirects back to the app at `/auth/callback`
- `src/pages/AuthCallbackPage.tsx` completes the flow and routes the user

Setup steps:

1. In Supabase Dashboard → Authentication → Providers:
   - enable the providers you want (Discord/GitHub/Google)
   - add each provider’s Client ID/Secret there
2. In your provider dashboard(s), allow the Supabase callback URL:
   - `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

## “Connect Discord” (optional)

Purpose:

- Links a logged-in website user to a Discord identity (`discord_connections` table).
- Used by the live chat bridge and any future Discord-linked features.

How it works:

- Frontend redirects user to Discord with `redirect_uri = https://YOUR_DOMAIN/auth/discord/callback`
- `src/pages/DiscordCallbackPage.tsx` calls the Edge Function `discord-oauth-exchange`
- The function exchanges the code and upserts into `discord_connections`

Setup:

- See `CHAT_BRIDGE_SETUP.md` (repo root).

