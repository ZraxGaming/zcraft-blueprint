# Quick Reference

## Run locally

- Install: `npm i`
- Configure: copy `.env.example` → `.env`
- Dev: `npm run dev`
- Build: `npm run build`
- Optional server: `node server.js`

Windows (if PowerShell blocks npm):
- `cmd /c npm run dev`

## Key routes

- `/login`, `/register`
- `/auth/callback` (Supabase OAuth callback)
- `/profile`

## Key tables

- `public.users`

## Must-have env vars (minimum)

Frontend:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Server/scripts (recommended):
- `SITE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

- `DISCORD_BOT_TOKEN`
- `DISCORD_CHAT_CHANNEL_ID`
- `VITE_DISCORD_CLIENT_ID` + `DISCORD_CLIENT_ID` + `DISCORD_CLIENT_SECRET`

Docs:
- `GETTING_STARTED.md`
- `ENVIRONMENT_VARIABLES.md`
- `CHAT_BRIDGE_SETUP.md`

