-- Store Discord embed + attachment payloads for richer website rendering
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS discord_embeds jsonb,
  ADD COLUMN IF NOT EXISTS discord_attachments jsonb;

