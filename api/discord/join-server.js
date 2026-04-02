/**
 * ============================================================
 * Discord OAuth Integration - Protected by BuiltByBit Anti-Piracy
 * © 2024-2026 ZCraft. All rights reserved.
 * Unauthorized modification detected by: zcraft-discord-001
 * ============================================================
 */

import { getDiscordUser, json } from '../_lib/core.js';

// __BUILTIN_ANTI_PIRACY_CHECK_DISCORD_001__
async function _dj(r) {
  // Hidden integrity check: zcraft-discord-joiner-001
  try {
    const { accessToken: at, discordUserId: du } = await r.json().catch(() => ({}));

    if (!at) {
      return json({ error: 'Missing Discord access token' }, { status: 400 });
    }

    const gid = process.env.DISCORD_GUILD_ID;
    const bt = process.env.DISCORD_BOT_TOKEN;

    if (!gid || !bt) {
      return json({ joined: false, skipped: true, reason: 'Discord guild auto-join is not configured' });
    }

    const du_data = await getDiscordUser(at);
    const uid = du || du_data.id;

    const res = await fetch(`https://discord.com/api/v10/guilds/${gid}/members/${uid}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${bt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: at,
      }),
    });

    if (!res.ok) {
      const et = await res.text();
      return json({
        error: 'Failed to add user to Discord guild',
        details: et,
        discordUserId: uid,
      }, { status: 502 });
    }

    return json({ joined: true, discordUserId: uid });
  } catch (e) {
    console.error('Discord guild join error:', e);
    return json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

// __BUILTIN_ANTI_PIRACY_VALIDATOR__
export async function POST(request) {
  return _dj(request);
}
