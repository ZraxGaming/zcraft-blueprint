# Features Overview

This project is a Vite + React frontend backed by Supabase (auth + database + Edge Functions) with optional server routes in `server.js`.

## Core

- Supabase Auth (email/password + OAuth providers)
- Forums, news, events/changelogs pages (feature-flagged)
- Admin pages (role-gated)
- SEO helpers, sitemap + RSS generation at build time

## Feature flags

Feature flags are frontend env vars in `.env.example`:

- `VITE_FEATURE_HOME_HERO`, `VITE_FEATURE_HOME_FEATURES`, `VITE_FEATURE_HOME_COMMUNITY`
- `VITE_FEATURE_FORUMS`, `VITE_FEATURE_NEWS`, `VITE_FEATURE_EVENTS`, `VITE_FEATURE_CHANGELOGS`
- `VITE_FEATURE_SUPPORT`, `VITE_FEATURE_APPEAL`, `VITE_FEATURE_BANS`, `VITE_FEATURE_RULES`
- `VITE_FEATURE_STATUS`, `VITE_FEATURE_STORE`, `VITE_FEATURE_STAFF`, `VITE_FEATURE_WIKI`
- `VITE_FEATURE_DISCORD_BUTTON`, `VITE_FEATURE_COPY_IP_BUTTON`, `VITE_FEATURE_THEME_TOGGLE`

Values:
- `true` or `false`

