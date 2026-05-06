import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const CHANNEL_ID = Deno.env.get("DISCORD_CHAT_CHANNEL_ID")!;
    const BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN")!;

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    // last processed message (stable sync state instead of guessing)
    const { data: last } = await admin
      .from("chat_messages")
      .select("discord_message_id")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const url = new URL(
      `https://discord.com/api/v10/channels/${CHANNEL_ID}/messages?limit=50`
    );

    if (last?.discord_message_id) {
      url.searchParams.set("after", last.discord_message_id);
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
    });

    const raw = await res.text();

    let messages;
    try {
      messages = JSON.parse(raw);
    } catch {
      console.error("Invalid Discord response:", raw);
      return json({ error: "Bad Discord response" }, 502);
    }

    if (!res.ok) {
      return json({ error: "Discord fetch failed" }, 502);
    }

    let inserted = 0;

    for (const m of (messages || []).reverse()) {
      if (!m?.content) continue;
      if (m.author?.bot && !m.webhook_id) continue;

      const isMinecraft = !!m.webhook_id;

      const username =
        m.author?.global_name || m.author?.username || "Unknown";

      const avatar = m.author?.avatar
        ? `https://cdn.discordapp.com/avatars/${m.author.id}/${m.author.avatar}.png`
        : null;

      const { error } = await admin.from("chat_messages").upsert(
        {
          discord_message_id: m.id,
          source: isMinecraft ? "minecraft" : "discord",
          discord_id: isMinecraft ? null : m.author?.id ?? null,
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

    return json({ ok: true, inserted, scanned: messages.length });
  } catch (e) {
    console.error(e);
    return json({ error: "Server error" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
