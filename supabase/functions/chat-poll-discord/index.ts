// Poll the bridged Discord channel for new messages and persist Minecraft-origin
// messages (DiscordSRV posts them as a webhook). Called either on demand by the
// frontend or by a cron / external scheduler.
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
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const CHANNEL_ID = Deno.env.get("DISCORD_CHAT_CHANNEL_ID");
    const BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN");

    if (!SUPABASE_URL || !SERVICE_ROLE) {
      return json({ error: "Supabase environment is not configured on the server" }, 500);
    }

    if (!CHANNEL_ID || !BOT_TOKEN) {
      return json({ error: "Discord chat channel or bot token not configured" }, 500);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { data: latest } = await admin
      .from("chat_messages")
      .select("discord_message_id, created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const url = new URL(
      `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages?limit=50` +
        (latest?.discord_message_id ? `&after=${latest.discord_message_id}` : "")
    );
    const res = await fetch(url, { headers: { Authorization: `Bot ${BOT_TOKEN}` } });
    if (!res.ok) {
      const t = await res.text();
      console.error("Discord fetch failed", res.status, t);
      return json({ error: "Discord fetch failed", status: res.status }, 502);
    }
    const messages = (await res.json()) as Array<{
      id: string;
      content: string;
      author: { id: string; username: string; global_name?: string; avatar?: string; bot?: boolean };
      webhook_id?: string;
      timestamp: string;
    }>;

    let inserted = 0;
    for (const m of messages.reverse()) {
      // DiscordSRV posts MC chat as a webhook (webhook_id present) OR as the bot.
      // Skip messages our own bot already wrote (they have prefix "**🌐 ")
      if (!m.webhook_id && m.author?.bot && m.content.startsWith("**🌐 ")) continue;
      if (!m.content) continue;

      const isMinecraft = !!m.webhook_id;
      const username =
        m.author?.global_name || m.author?.username || "Unknown";
      const avatar = m.author?.avatar
        ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png`
        : null;

      const { error } = await admin.from("chat_messages").upsert(
        {
          source: isMinecraft ? "minecraft" : "website",
          discord_message_id: m.id,
          discord_id: m.author?.id || null,
          username,
          minecraft_username: isMinecraft ? username : null,
          avatar_url: avatar,
          content: m.content,
          created_at: m.timestamp,
        },
        { onConflict: "discord_message_id" }
      );
      if (!error) inserted++;
    }

    const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    const { error: cutoffErr } = await admin.from("chat_messages").delete().lt("created_at", cutoff);
    if (cutoffErr) console.error("cleanup cutoff failed", cutoffErr);

    const { data: boundary, error: boundaryErr } = await admin
      .from("chat_messages")
      .select("created_at")
      .order("created_at", { ascending: false })
      .range(50, 50)
      .maybeSingle();
    if (boundaryErr) {
      console.error("cleanup boundary failed", boundaryErr);
    } else if (boundary?.created_at) {
      const { error: sizeErr } = await admin.from("chat_messages").delete().lt("created_at", boundary.created_at);
      if (sizeErr) console.error("cleanup size failed", sizeErr);
    }

    return json({ ok: true, inserted, scanned: messages.length });
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
