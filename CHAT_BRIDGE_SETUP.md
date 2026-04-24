# Live Minecraft ↔ Website Chat Bridge — Setup Guide

This document explains, end-to-end, how to wire up the live chatbox that bridges
the website with the Minecraft server in real time, using Discord (DiscordSRV)
as the relay.

```
 Minecraft  <──DiscordSRV──>  Discord channel  <──Bot/Webhook──>  Website
```

- **Website → Minecraft**: the user's own Discord OAuth token posts a message
  in the linked Discord channel. DiscordSRV forwards it into in-game chat.
- **Minecraft → Website**: a bot token (or n8n/Discord webhook) reads the
  channel and inserts new messages into the `chat_messages` table. The
  frontend polls that table every 3 seconds.

No bot needs to be self-hosted — Discord and Supabase Edge Functions do all
the work.

---

## 1. Prerequisites

- A Minecraft server with **DiscordSRV** installed and configured to mirror
  one specific channel (the "chat channel").
- A Discord server you own (or have admin on) with that chat channel.
- The Z-Craft project deployed on Lovable Cloud (Supabase backend already
  provisioned — project ID `uzpqnhfkjhqqdyulzzeb`).

---

## 2. Create the Discord Application

1. Go to <https://discord.com/developers/applications> and click **New
   Application**. Name it e.g. `Z-Craft Web Chat`.
2. In the left sidebar open **OAuth2 → General**.
   - Copy the **Client ID** → this becomes `VITE_DISCORD_CLIENT_ID` and
     `DISCORD_CLIENT_ID`.
   - Click **Reset Secret**, copy the **Client Secret** →
     `DISCORD_CLIENT_SECRET`.
3. Still in **OAuth2 → General**, under **Redirects**, add:
   ```
   https://YOUR-DOMAIN/auth/discord/callback
   http://localhost:5173/auth/discord/callback
   ```
   (Add every domain you use — preview, prod, custom domain.)
4. Open **Bot** in the sidebar → **Add Bot**.
   - Click **Reset Token**, copy the token → `DISCORD_BOT_TOKEN`.
   - Toggle **Message Content Intent** ON (required to read messages).
5. Invite the bot to your Discord server:
   - Go to **OAuth2 → URL Generator**.
   - Scopes: `bot`.
   - Bot permissions: `View Channels`, `Read Message History`, `Send
     Messages`.
   - Open the generated URL in a new tab, pick your server, authorize.
6. In Discord, right-click the **chat channel** that DiscordSRV mirrors →
   **Copy Channel ID** (you may need to enable Developer Mode under Discord
   Settings → Advanced). This is `DISCORD_CHAT_CHANNEL_ID`.

---

## 3. Configure Environment Variables

### 3a. Frontend (`.env`)

The frontend only needs the public Client ID (it builds the OAuth URL):

```env
VITE_DISCORD_CLIENT_ID=your_discord_client_id
```

Already wired in `.env` and `.env.example`.

### 3b. Supabase Edge Function secrets

Edge functions cannot read `.env` — secrets must live in Supabase. Open the
Lovable Cloud dashboard (or `supabase secrets set ...`) and add:

| Secret name | Value | Used by |
|---|---|---|
| `DISCORD_CLIENT_ID` | from step 2.2 | `discord-oauth-exchange` |
| `DISCORD_CLIENT_SECRET` | from step 2.2 | `discord-oauth-exchange` |
| `DISCORD_BOT_TOKEN` | from step 2.4 | `chat-poll-discord`, `chat-send` |
| `DISCORD_CHAT_CHANNEL_ID` | from step 2.6 | `chat-poll-discord`, `chat-send` |
| `DISCORD_CHAT_INGEST_SECRET` | any long random string | `chat-ingest-webhook` |

Generate the ingest secret with e.g. `openssl rand -hex 32`. You'll paste it
into n8n / your webhook relay later.

---

## 4. Edge Functions (already deployed)

| Function | Purpose |
|---|---|
| `discord-oauth-exchange` | Swaps the OAuth `code` for tokens and stores them in `discord_connections`. |
| `chat-send` | Authenticated. Posts a message to the Discord channel via the bot, prefixed with the user's name so DiscordSRV forwards it to Minecraft, then logs the message. |
| `chat-poll-discord` | Pulls the last ~50 channel messages and inserts any new Minecraft-origin messages (i.e. coming from DiscordSRV's webhook) into `chat_messages`. |
| `chat-ingest-webhook` | Public endpoint protected by `x-ingest-secret`. Lets n8n / Discord outgoing webhooks POST messages directly. |

Endpoints:

```
POST https://uzpqnhfkjhqqdyulzzeb.functions.supabase.co/chat-ingest-webhook
Header:  x-ingest-secret: <DISCORD_CHAT_INGEST_SECRET>
Body:    { "username": "Steve", "content": "hello", "minecraft_username": "Steve", "avatar_url": "..." }
```

---

## 5. Choose a Minecraft → Website Relay

Pick **one** (or run both):

### Option A — Bot polling (simplest, zero extra infra)

Already implemented. The `chat-poll-discord` function is invoked by the
frontend every 3 seconds while the chatbox is open. As long as
`DISCORD_BOT_TOKEN` and `DISCORD_CHAT_CHANNEL_ID` are set, Minecraft
messages will appear automatically.

### Option B — n8n webhook relay (push, lower latency)

1. In n8n create a new workflow: **Discord Trigger → HTTP Request**.
2. Discord trigger: filter by your chat channel.
3. HTTP Request node:
   - Method: `POST`
   - URL: `https://uzpqnhfkjhqqdyulzzeb.functions.supabase.co/chat-ingest-webhook`
   - Header: `x-ingest-secret: <your DISCORD_CHAT_INGEST_SECRET>`
   - Body (JSON):
     ```json
     {
       "username": "{{$json.author.username}}",
       "content": "{{$json.content}}",
       "minecraft_username": "{{$json.author.username}}",
       "avatar_url": "{{$json.author.avatar_url}}",
       "discord_id": "{{$json.author.id}}",
       "discord_message_id": "{{$json.id}}"
     }
     ```
4. Activate the workflow. Messages now stream in instantly.

### Option C — Discord outgoing webhook

Same body / header as Option B, but configured directly in Discord channel
settings → Integrations → Webhooks. Useful if you don't run n8n.

---

## 6. User Flow

1. User signs in with Google (Supabase auth) as normal.
2. They open **Profile → Discord Connection** and click **Connect Discord**.
3. They're redirected to Discord, authorize `identify guilds
   guilds.members.read`, and bounce back to `/auth/discord/callback`.
4. The `discord-oauth-exchange` edge function stores their tokens in
   `discord_connections`.
5. On the homepage, the **Live Server Chat** card now shows the message
   stream and an input box.
6. Sending a message → `chat-send` posts it to Discord → DiscordSRV mirrors
   it into Minecraft.

---

## 7. Database Tables

Created by migration `20260424132020_…sql`:

- `discord_connections` (1 row per user)
  - `user_id`, `discord_id`, `discord_username`, `discord_avatar`,
    `access_token`, `refresh_token`, `token_expires_at`, `scopes`
  - RLS: users can only read/write their own row.
- `chat_messages`
  - `source` (`website` | `minecraft`), `username`, `minecraft_username`,
    `avatar_url`, `content`, `discord_id`, `discord_message_id`
  - RLS: anyone can SELECT, only the owner / service role can INSERT.

---

## 8. Troubleshooting

| Symptom | Fix |
|---|---|
| OAuth popup says **redirect_uri mismatch** | Add the exact callback URL (incl. protocol + port) to the Discord app's redirects. |
| Sending says "Discord not connected" | Re-link Discord from the Profile page; the token may have expired. |
| Minecraft messages never appear | Verify `DISCORD_BOT_TOKEN` is set in Supabase secrets and the bot is **in** the server with `Read Message History`. Also confirm `DISCORD_CHAT_CHANNEL_ID` is the channel DiscordSRV mirrors. |
| Website messages don't reach Minecraft | The bot must have `Send Messages` permission in the chat channel and DiscordSRV must be configured to forward bot messages (DiscordSRV `DiscordChatChannelAllowedRoles`/`...AllowedUsers` may be filtering them). |
| Chat history grows huge | Add a scheduled cleanup: `delete from chat_messages where created_at < now() - interval '30 days';` |

---

## 9. Going Live Checklist

- [ ] Discord app created, redirects added for prod domain
- [ ] Bot invited to server with correct perms, Message Content Intent ON
- [ ] All 5 secrets set in Supabase
- [ ] `VITE_DISCORD_CLIENT_ID` set in Vercel project env (for production build)
- [ ] DiscordSRV linked to the same channel
- [ ] One test message sent from website → appears in Minecraft
- [ ] One test message sent in Minecraft → appears on website within 3s

You're done.