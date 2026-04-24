import { supabase } from "@/integrations/supabase/client";

export interface DiscordConnection {
  discord_id: string;
  discord_username: string;
  discord_avatar: string | null;
}

export interface ChatMessage {
  id: string;
  source: "website" | "minecraft";
  username: string;
  minecraft_username: string | null;
  avatar_url: string | null;
  content: string;
  created_at: string;
}

export async function getMyDiscordConnection(): Promise<DiscordConnection | null> {
  const { data, error } = await supabase
    .from("discord_connections")
    .select("discord_id, discord_username, discord_avatar")
    .maybeSingle();
  if (error) return null;
  return data ?? null;
}

export async function disconnectDiscord(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase.from("discord_connections").delete().eq("user_id", user.id);
  if (error) throw error;
}

export function buildDiscordOAuthUrl(): string {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID as string | undefined;
  if (!clientId) {
    throw new Error("Discord client ID is not configured (VITE_DISCORD_CLIENT_ID).");
  }
  const redirectUri = `${window.location.origin}/auth/discord/callback`;
  const scopes = ["identify", "guilds", "guilds.members.read"].join(" ");
  const state = crypto.randomUUID();
  sessionStorage.setItem("discord_oauth_state", state);
  sessionStorage.setItem("discord_oauth_returnTo", window.location.pathname);
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: scopes,
    state,
    prompt: "consent",
  });
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

export async function exchangeDiscordCode(code: string): Promise<DiscordConnection> {
  const redirectUri = `${window.location.origin}/auth/discord/callback`;
  const { data, error } = await supabase.functions.invoke("discord-oauth-exchange", {
    body: { code, redirectUri },
  });
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error || "Discord exchange failed");
  return data.discord;
}

export async function sendChatMessage(content: string): Promise<void> {
  const { data, error } = await supabase.functions.invoke("chat-send", { body: { content } });
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error || "Send failed");
}

export async function fetchChatMessages(limit = 80): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, source, username, minecraft_username, avatar_url, content, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).reverse() as ChatMessage[];
}

export async function pollDiscordForNewMessages(): Promise<void> {
  // Fire-and-forget; the function fetches new Discord messages and inserts them.
  await supabase.functions.invoke("chat-poll-discord", { body: {} }).catch(() => {});
}