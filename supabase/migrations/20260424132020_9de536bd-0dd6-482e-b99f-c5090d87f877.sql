-- Discord OAuth connections per user
CREATE TABLE public.discord_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  discord_id text NOT NULL,
  discord_username text NOT NULL,
  discord_avatar text,
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamptz,
  scopes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_discord_connections_user_id ON public.discord_connections(user_id);
CREATE INDEX idx_discord_connections_discord_id ON public.discord_connections(discord_id);

ALTER TABLE public.discord_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own discord connection"
  ON public.discord_connections FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own discord connection"
  ON public.discord_connections FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own discord connection"
  ON public.discord_connections FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own discord connection"
  ON public.discord_connections FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_discord_connections_updated_at
  BEFORE UPDATE ON public.discord_connections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Chat messages bridged between website and Minecraft via Discord
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('website', 'minecraft')),
  discord_message_id text UNIQUE,
  discord_id text,
  user_id uuid,
  username text NOT NULL,
  minecraft_username text,
  avatar_url text,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX idx_chat_messages_source ON public.chat_messages(source);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view chat messages"
  ON public.chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can post messages as themselves"
  ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete chat messages"
  ON public.chat_messages FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role IN ('admin','owner','moderator')));