// Receives Minecraft-origin messages pushed by an external relay (n8n,
// Discord outgoing webhook, etc.). Authenticated via shared secret header.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-ingest-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  try {
    const expected = Deno.env.get("DISCORD_CHAT_INGEST_SECRET");
    if (!expected) return json({ error: "Ingest not configured" }, 500);

    const provided = req.headers.get("x-ingest-secret");
    if (provided !== expected) return json({ error: "Forbidden" }, 403);

    const body = await req.json();
    const username = String(body.username || body.minecraft_username || "Unknown").slice(0, 80);
    const content = String(body.content || body.message || "").slice(0, 1500);
    if (!content) return json({ error: "Empty content" }, 400);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { error } = await admin.from("chat_messages").insert({
      source: "minecraft",
      discord_message_id: body.discord_message_id || null,
      username,
      minecraft_username: username,
      avatar_url: body.avatar_url || `https://mc-heads.net/avatar/${encodeURIComponent(username)}/64`,
      content,
    });
    if (error) {
      console.error(error);
      return json({ error: error.message }, 500);
    }
    return json({ ok: true });
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