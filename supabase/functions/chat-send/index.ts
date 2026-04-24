// Sends a chat message: posts to Discord as the user (via their stored OAuth token),
// then mirrors into chat_messages. DiscordSRV will relay to Minecraft.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const CHANNEL_ID = Deno.env.get("DISCORD_CHAT_CHANNEL_ID");
    const BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE) {
      return json({ error: "Supabase environment is not configured on the server" }, 500);
    }

    if (!CHANNEL_ID || !BOT_TOKEN) {
      return json({ error: "Discord chat channel or bot token not configured" }, 500);
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !user?.id) return json({ error: "Unauthorized" }, 401);
    const userId = user.id as string;

    let body: any = null;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const { content } = body ?? {};
    const text = String(content || "").trim();
    if (!text) return json({ error: "Message cannot be empty" }, 400);
    if (text.length > 1500) return json({ error: "Message too long (max 1500 chars)" }, 400);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: conn } = await admin
      .from("discord_connections")
      .select("discord_id, discord_username, discord_avatar")
      .eq("user_id", userId)
      .maybeSingle();

    if (!conn) return json({ error: "Connect your Discord account first" }, 400);

    const { data: profile } = await admin
      .from("users")
      .select("username, minecraft_name, avatar_url")
      .eq("id", userId)
      .maybeSingle();

    const displayName = profile?.minecraft_name || profile?.username || conn.discord_username;

    // Post to Discord using the bot token, but prefix with the user's display name
    // so DiscordSRV forwards a message attributable to the website user.
    // (Posting AS the user via their OAuth token requires the bot scope; using bot
    // here is the reliable path that DiscordSRV picks up.)
    const discordRes = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: `**🌐 ${displayName}**: ${text}`,
        allowed_mentions: { parse: [] },
      }),
    });
    const dMsg = await discordRes.json();
    if (!discordRes.ok) {
      console.error("Discord post failed", dMsg);
      return json({ error: dMsg.message || "Failed to send to Discord" }, 502);
    }

    const { error: insertErr } = await admin.from("chat_messages").insert({
      source: "website",
      discord_message_id: dMsg.id,
      discord_id: conn.discord_id,
      user_id: userId,
      username: displayName,
      minecraft_username: profile?.minecraft_name || null,
      avatar_url: conn.discord_avatar || profile?.avatar_url || null,
      content: text,
    });
    if (insertErr) console.error("DB insert failed", insertErr);

    return json({ ok: true, id: dMsg.id });
  } catch (e) {
    console.error(e);
    return json({ error: (e as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
