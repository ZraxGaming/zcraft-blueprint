# ZCraft Blueprint — Documentation

This folder is the buyer-friendly documentation for setting up and running the project.

## Quick start

1. Copy `.env.example` → `.env` and fill in the **REQUIRED** values.
2. Install deps: `npm i`
3. Start dev: `npm run dev`

If PowerShell blocks `npm` on Windows, use `cmd /c npm run dev`.

## Start here

- `GETTING_STARTED.md` — local dev + build + common gotchas
- `ENVIRONMENT_VARIABLES.md` — required vs optional env vars, what they do, where they are used

## Deployment / ops

- `VERCEL_SETUP_AND_EDITING.md` — deploying on Vercel, maintenance mode, appeals + webhook config
- `OBSERVABILITY_AND_ENV.md` — what must stay private vs safe to expose (`VITE_` rule)

## Discord + live chat

- `CHAT_BRIDGE_SETUP.md` (repo root) — DiscordSRV ↔ website live chat setup (Discord app + bot + Supabase secrets)

## Other references

- `SQL_SCHEMA_DOCUMENTATION.md` — tables, RLS policies, schema notes
- `SUPABASE_EMAIL_TEMPLATES.md` — templates + email flow notes
- `WEBHOOK_INTEGRATION.md` / `WEBHOOK_QUICK_REFERENCE.md` — webhook endpoints and usage
- `FEATURES.md` — feature overview + flags
