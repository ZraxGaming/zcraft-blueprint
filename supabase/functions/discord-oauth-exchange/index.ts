// Discord OAuth code → token exchange + persist to discord_connections
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
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const DISCORD_CLIENT_ID = Deno.env.get("DISCORD_CLIENT_ID");
    const DISCORD_CLIENT_SECRET = Deno.env.get("DISCORD_CLIENT_SECRET");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE) {
      return json({ error: "Supabase environment is not configured on the server" }, 500);
    }

    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
      return json({ error: "Discord OAuth is not configured on the server" }, 500);
    }

    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !user?.id) {
      return json({ error: "Unauthorized" }, 401);
    }
    const userId = user.id as string;

    let body: any = null;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const { code, redirectUri } = body ?? {};
    if (!code || !redirectUri) {
      return json({ error: "Missing code or redirectUri" }, 400);
    }

    // Exchange authorization code → access token
    const tokenRes = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error("Discord token exchange failed", tokenJson);
      return json({ error: tokenJson.error_description || "Discord token exchange failed" }, 400);
    }

    // Resolve Discord user
    const userRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });
    const dUser = await userRes.json();
    if (!userRes.ok || !dUser.id) {
      return json({ error: "Failed to resolve Discord user" }, 400);
    }

    const avatar = dUser.avatar
      ? `https://cdn.discordapp.com/avatars/${dUser.id}/${dUser.avatar}.png`
      : null;

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const expiresAt = tokenJson.expires_in
      ? new Date(Date.now() + tokenJson.expires_in * 1000).toISOString()
      : null;

    const { error: upErr } = await admin.from("discord_connections").upsert(
      {
        user_id: userId,
        discord_id: dUser.id,
        discord_username: dUser.global_name || dUser.username,
        discord_avatar: avatar,
        access_token: tokenJson.access_token,
        refresh_token: tokenJson.refresh_token ?? null,
        token_expires_at: expiresAt,
        scopes: tokenJson.scope ?? null,
      },
      { onConflict: "user_id" }
    );
    if (upErr) {
      console.error(upErr);
      return json({ error: upErr.message }, 500);
    }

    return json({
      ok: true,
      discord: {
        discord_id: dUser.id,
        discord_username: dUser.global_name || dUser.username,
        discord_avatar: avatar,
      },
    });
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
