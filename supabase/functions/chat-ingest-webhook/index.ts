import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import crypto from "node:crypto";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null);
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const secret = Deno.env.get("DISCORD_CHAT_INGEST_SECRET");
    if (!secret) return json({ error: "Not configured" }, 500);

    if (req.headers.get("x-ingest-secret") !== secret) {
      return json({ error: "Forbidden" }, 403);
    }

    const body = await req.json().catch(() => null);
    if (!body?.content) return json({ error: "Empty content" }, 400);

    const username = String(body.username || "Unknown").slice(0, 80);
    const content = String(body.content).slice(0, 1500);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const hash = crypto
      .createHash("sha256")
      .update(username + content)
      .digest("hex");

    const { error } = await admin.from("chat_messages").insert({
      source: "minecraft",
      username,
      minecraft_username: username,
      content,
      dedup_hash: hash,
      avatar_url:
        body.avatar_url ||
        `https://mc-heads.net/avatar/${encodeURIComponent(username)}/64`,
    });

    if (error) return json({ error: error.message }, 500);

    return json({ ok: true });
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
