# Authentication & OAuth — Overview

This project uses Supabase Auth for primary login.

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




