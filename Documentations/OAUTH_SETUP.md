# OAuth Setup

This repo supports two OAuth-related flows:

1) **Primary login** (Supabase Auth providers)
2) **Connect Discord** (optional link for chat bridge)

## 1) Primary login (Supabase Auth)

Providers:
- Discord
- GitHub
- Google

Steps:

1. Supabase Dashboard → Authentication → Providers
   - Enable your provider(s)
   - Paste the provider Client ID/Secret into Supabase
2. Provider dashboard redirect:
   - Add Supabase callback URL:
     - `https://YOUR_PROJECT.supabase.co/auth/v1/callback`
3. App callback route:
   - This app uses `/auth/callback` as the post-auth landing page.

## 2) Connect Discord (optional)

This is used by the live chat bridge and stores a per-user Discord identity in `discord_connections`.

Steps:

1. Create a Discord application
2. Add redirect URL(s) for the app:
   - `https://YOUR_DOMAIN/auth/discord/callback`
   - `http://localhost:5173/auth/discord/callback`
3. Set secrets in Supabase for the Edge Function:
   - `DISCORD_CLIENT_ID`
   - `DISCORD_CLIENT_SECRET`

Full guide:
- `CHAT_BRIDGE_SETUP.md` (repo root)

