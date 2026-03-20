import { getDiscordUser, json } from '../_lib/core.js';

export async function POST(request) {
  try {
    const { accessToken, discordUserId } = await request.json().catch(() => ({}));

    if (!accessToken) {
      return json({ error: 'Missing Discord access token' }, { status: 400 });
    }

    const guildId = process.env.DISCORD_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!guildId || !botToken) {
      return json({ joined: false, skipped: true, reason: 'Discord guild auto-join is not configured' });
    }

    const discordUser = await getDiscordUser(accessToken);
    const resolvedUserId = discordUserId || discordUser.id;

    const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${resolvedUserId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: accessToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return json({
        error: 'Failed to add user to Discord guild',
        details: errorText,
        discordUserId: resolvedUserId,
      }, { status: 502 });
    }

    return json({ joined: true, discordUserId: resolvedUserId });
  } catch (error) {
    console.error('Discord guild join error:', error);
    return json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
