import { json } from './_lib/core.js';

function clampText(value = '', limit = 1024) {
  const text = String(value || '').trim();
  if (!text) return 'Not provided';
  return text.length > limit ? `${text.slice(0, limit - 3)}...` : text;
}

export async function POST(request) {
  try {
    const webhookUrl = process.env.APPEAL_DISCORD_WEBHOOK_URL || process.env.DISCORD_APPEAL_WEBHOOK_URL;
    if (!webhookUrl) {
      return json({ error: 'Appeal webhook is not configured' }, { status: 500 });
    }

    const {
      minecraftUsername,
      discordUsername,
      email,
      punishmentType,
      punishmentReason,
      punishmentDate,
      appealReason,
      evidenceLinks,
      additionalInfo,
    } = await request.json().catch(() => ({}));

    if (!minecraftUsername || !discordUsername || !punishmentReason || !appealReason) {
      return json({ error: 'Missing required appeal fields' }, { status: 400 });
    }

    const siteUrl = process.env.SITE_URL || 'https://www.z-craft.xyz';
    const payload = {
      username: 'ZCraft Appeals',
      avatar_url: `${siteUrl}/zcraft.png`,
      content: `New appeal submitted by ${clampText(minecraftUsername, 128)}`,
      embeds: [
        {
          title: `Appeal submitted: ${clampText(minecraftUsername, 128)}`,
          color: 0xeab308,
          fields: [
            { name: 'Minecraft Username', value: clampText(minecraftUsername, 256), inline: true },
            { name: 'Discord Username', value: clampText(discordUsername, 256), inline: true },
            { name: 'Email', value: clampText(email, 256), inline: true },
            { name: 'Punishment Type', value: clampText(punishmentType, 128), inline: true },
            { name: 'Punishment Reason', value: clampText(punishmentReason, 1024), inline: false },
            { name: 'Punishment Date', value: clampText(punishmentDate, 128), inline: true },
            { name: 'Appeal Reason', value: clampText(appealReason, 1024), inline: false },
            { name: 'Evidence Links', value: clampText(evidenceLinks, 1024), inline: false },
            { name: 'Additional Info', value: clampText(additionalInfo, 1024), inline: false },
          ],
          footer: {
            text: 'Submitted from the ZCraft website',
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return json({ error: errorText || 'Failed to send appeal webhook' }, { status: 502 });
    }

    return json({ sent: true });
  } catch (error) {
    console.error('Appeal submission error:', error);
    return json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
