# Live Minecraft ↔ Website Chat Bridge (DiscordSRV) — Setup Guide

This guide wires up the live chat feature that bridges:

- Minecraft chat (via DiscordSRV)
- a Discord text channel
- the website live chat UI

High level:

```
Minecraft <-> DiscordSRV <-> Discord channel <-> Supabase Edge Functions <-> Website UI
```

## What the project does

- **Website → Discord → Minecraft**
  - The website posts to the configured Discord channel using a bot token.
  - Messages are prefixed with the website user’s display name so DiscordSRV can relay them into in-game chat.
  - The site still requires users to “Connect Discord” so you have a stable Discord identity per user (`discord_connections`).

- **Minecraft → Discord → Website**
  - DiscordSRV mirrors Minecraft chat into the same Discord channel (usually via webhook/bot message).
  - The site calls an Edge Function (`chat-poll-discord`) to fetch new Discord messages and store them in `chat_messages`.
  - The UI subscribes to Supabase Realtime on `chat_messages` for instant updates (you said you enabled Realtime).

## 1) Prerequisites

- A Minecraft server with DiscordSRV installed and configured to mirror a single “chat channel”.
- A Discord server you control with that chat channel.
- A Supabase project configured for this repo (tables + functions deployed).

## 2) Discord app (OAuth) — “Connect Discord”

This enables Profile → “Connect Discord”.

1. Discord Developer Portal → Applications → New Application
2. OAuth2:
   - Copy **Client ID** → `VITE_DISCORD_CLIENT_ID` and `DISCORD_CLIENT_ID`
   - Copy **Client Secret** → `DISCORD_CLIENT_SECRET`
3. OAuth2 → Redirects: add
   - `https://YOUR_DOMAIN/auth/discord/callback`
   - `http://localhost:5173/auth/discord/callback`

## 3) Discord bot — channel read/write

This bot posts website messages and reads channel history.

1. In the same Discord application: Bot → Add Bot → Reset Token
   - Copy token → `DISCORD_BOT_TOKEN`
2. Enable:
   - Message Content Intent (recommended so reads work reliably)
3. Invite the bot to your server (OAuth2 → URL Generator):
   - Scope: `bot`
   - Permissions:
     - View Channel
     - Read Message History
     - Send Messages
4. Get the chat channel ID:
   - Enable Developer Mode in Discord
   - Right-click channel → Copy Channel ID → `DISCORD_CHAT_CHANNEL_ID`

## 4) Supabase secrets (Edge Functions)

Edge Functions do **not** read your local `.env`. Set secrets in Supabase:

- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_BOT_TOKEN`
- `DISCORD_CHAT_CHANNEL_ID`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:

- `DISCORD_CHAT_INGEST_SECRET` (only if you use `chat-ingest-webhook`)
- `DISCORD_GUILD_ID` (only if you enable auto-join endpoint)

## 5) Edge Functions used

- `discord-oauth-exchange` — exchanges Discord OAuth `code` and upserts into `discord_connections`
- `chat-send` — posts website messages to Discord and inserts into `chat_messages`
- `chat-poll-discord` — fetches new Discord messages and upserts into `chat_messages` (also does retention cleanup)
- `chat-ingest-webhook` — optional push-ingest endpoint protected by `x-ingest-secret`

## 6) Database tables

Created by migration `supabase/migrations/20260424132020_9de536bd-0dd6-482e-b99f-c5090d87f877.sql`:

- `discord_connections` — one row per user
- `chat_messages` — message history displayed on the website

## 7) UI

- Floating chat widget appears site-wide (bottom-right)
- Dedicated page: `/chat`

## Troubleshooting

### “invalid OAuth2 redirect url”
- Add the exact redirect used by the app:
  - `https://YOUR_DOMAIN/auth/discord/callback`
  - and dev: `http://localhost:5173/auth/discord/callback`

### “Missing Access (Discord code 50001)”
- Bot doesn’t have access to the channel:
  - bot not in server, wrong channel id, or missing View/Send/History perms

### Website messages don’t reach Minecraft
- Confirm:
  - DiscordSRV is mirroring the same channel id
  - bot has Send permission
  - DiscordSRV isn’t filtering bot messages

