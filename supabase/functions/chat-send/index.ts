import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const CHANNEL_ID = Deno.env.get("DISCORD_CHAT_CHANNEL_ID")!;
    const BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN")!;

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: auth } },
    });

    const { data: { user }, error } = await userClient.auth.getUser();
    if (error || !user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const body = await req.json().catch(() => null);
    if (!body?.content) return json({ error: "Empty message" }, 400);

    const text = String(body.content).trim().slice(0, 1500);

    const { data: conn } = await admin
      .from("discord_connections")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!conn) return json({ error: "Discord not linked" }, 400);

    const displayName = conn.discord_username || "User";

    const discordRes = await fetch(
      `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `🌐 **${displayName}**: ${text}`,
          allowed_mentions: { parse: [] },
        }),
      }
    );

    const raw = await discordRes.text();
    let dMsg;
    try {
      dMsg = raw ? JSON.parse(raw) : {};
    } catch {
      return json({ error: "Discord invalid response" }, 502);
    }

    if (!discordRes.ok) {
      return json({ error: dMsg?.message || "Discord error" }, 502);
    }

    await admin.from("chat_messages").insert({
      source: "website",
      discord_message_id: dMsg.id,
      user_id: user.id,
      username: displayName,
      content: text,
    });

    return json({ ok: true, id: dMsg.id });
  } catch (e) {
    console.error(e);
    return json({ error: "Server error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
