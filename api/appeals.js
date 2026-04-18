import { json } from './_lib/core.js';

function clamp(value = '', limit = 1024) {
  const text = String(value || '').trim();
  if (!text) return '—';
  return text.length > limit ? `${text.slice(0, limit - 3)}...` : text;
}

const TYPE_META = {
  ban:   { color: 0xef4444, emoji: '⛔', label: 'Ban Appeal' },
  mute:  { color: 0xf59e0b, emoji: '🔇', label: 'Mute Appeal' },
  warn:  { color: 0xfbbf24, emoji: '⚠️', label: 'Warning Appeal' },
  other: { color: 0x3b82f6, emoji: '📩', label: 'Punishment Appeal' },
  report:{ color: 0x8b5cf6, emoji: '🚨', label: 'Player Report' },
};

export async function POST(request) {
  try {
    const webhookUrl = "https://discord.com/api/webhooks/1494356470794420425/70YIuq8XgaWgQFJtYRamJPG20PQc5UCfmfvmwBQJpBq8k5ezdqfGcALmneN6yc5BgFkG";

    if (!webhookUrl) {
      return json({ error: 'Appeal webhook is not configured' }, { status: 500 });
    }

    const body = await request.json().catch(() => ({}));
    const {
      minecraftUsername,
      discordUsername,
      email,
      punishmentType = 'other',
      punishmentReason,
      punishmentDate,
      appealReason,
      evidenceLinks,
      additionalInfo,
    } = body;

    if (!minecraftUsername || !discordUsername || !punishmentReason || !appealReason) {
      return json({ error: 'Missing required appeal fields' }, { status: 400 });
    }

    const meta = TYPE_META[String(punishmentType).toLowerCase()] || TYPE_META.other;
    const siteUrl = process.env.SITE_URL || 'https://www.z-craft.xyz';
    const submittedAt = new Date();
    const ticketId = `APL-${submittedAt.getTime().toString(36).toUpperCase()}`;
    const avatarUrl = `https://mc-heads.net/avatar/${encodeURIComponent(minecraftUsername)}/128`;

    const fields = [
      { name: '🎮 Minecraft', value: clamp(minecraftUsername, 256), inline: true },
      { name: '💬 Discord',   value: clamp(discordUsername, 256),   inline: true },
      { name: '📧 Email',     value: clamp(email, 256),             inline: true },
      { name: '📅 Punishment Date', value: clamp(punishmentDate, 128), inline: true },
      { name: '🎫 Ticket ID', value: `\`${ticketId}\``, inline: true },
      { name: '🏷️ Type',      value: meta.label,                     inline: true },
      { name: '📜 Punishment Reason', value: clamp(punishmentReason, 1024), inline: false },
      { name: '✍️ Appeal Reason',     value: clamp(appealReason, 1024),     inline: false },
    ];

    if (evidenceLinks && evidenceLinks.trim()) {
      fields.push({ name: '🔗 Evidence', value: clamp(evidenceLinks, 1024), inline: false });
    }
    if (additionalInfo && additionalInfo.trim()) {
      fields.push({ name: '📝 Additional Info', value: clamp(additionalInfo, 1024), inline: false });
    }

    const payload = {
      username: 'ZCraft Appeals',
      avatar_url: `${siteUrl}/zcraft.png`,
      content: `${meta.emoji} **New ${meta.label}** from \`${clamp(minecraftUsername, 64)}\``,
      embeds: [
        {
          title: `${meta.emoji} ${meta.label}`,
          description: `A new appeal has been submitted on the website. Please review and respond promptly.`,
          url: `${siteUrl}/appeal`,
          color: meta.color,
          author: {
            name: clamp(minecraftUsername, 256),
            icon_url: avatarUrl,
          },
          thumbnail: { url: avatarUrl },
          fields,
          footer: {
            text: `ZCraft Network · Ticket ${ticketId}`,
            icon_url: `${siteUrl}/zcraft.png`,
          },
          timestamp: submittedAt.toISOString(),
        },
      ],
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return json({ error: errorText || 'Failed to send appeal webhook' }, { status: 502 });
    }

    return json({ sent: true, ticketId });
  } catch (error) {
    console.error('Appeal submission error:', error);
    return json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
