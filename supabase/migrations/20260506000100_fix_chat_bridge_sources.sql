-- Allow all bridge directions to be stored:
-- website -> Discord, DiscordSRV/Minecraft -> Discord, and Discord -> website.
ALTER TABLE public.chat_messages
  DROP CONSTRAINT IF EXISTS chat_messages_source_check;

ALTER TABLE public.chat_messages
  ADD CONSTRAINT chat_messages_source_check
  CHECK (source IN ('website', 'minecraft', 'discord'));

-- chat-ingest-webhook writes dedup_hash for idempotency; older installs were
-- missing the column, which caused every webhook ingest to fail.
ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS dedup_hash text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_chat_messages_dedup_hash
  ON public.chat_messages(dedup_hash)
  WHERE dedup_hash IS NOT NULL;
