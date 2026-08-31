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

- `CHAT_BRIDGE_SETUP.md` (repo root)

