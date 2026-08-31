-- Remove the retired DiscordSRV-backed live chat integration.
DROP TABLE IF EXISTS public.chat_messages;
DROP TABLE IF EXISTS public.discord_connections;