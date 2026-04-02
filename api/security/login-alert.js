import {
  escapeHtml,
  getAuthenticatedUser,
  getClientIp,
  getUserProfileById,
  json,
  lookupGeo,
  renderZcraftEmail,
  sendSendPulseEmail,
} from '../_lib/core.js';

export async function POST(request) {
  try {
    const auth = await getAuthenticatedUser(request);
    if (!auth?.user?.email) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const profile = await getUserProfileById(auth.user.id);
    const ip = getClientIp(request);
    const geo = await lookupGeo(ip);
    const loginMethod = body?.loginMethod || 'Email / Password';
    const browserTimezone = body?.timezone || null;
    const browserLocale = body?.locale || null;
    const browserUserAgent = body?.browser || null;
    const loginTime = new Date();
    const formattedUtc = loginTime.toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'UTC',
    });

    const titleName =
      body?.username ||
      profile?.username ||
      auth.user.user_metadata?.username ||
      auth.user.user_metadata?.preferred_username ||
      auth.user.email.split('@')[0];

    const locationBits = [geo.city, geo.region, geo.country].filter((value) => value && value !== 'Unknown');
    const html = renderZcraftEmail({
      title: 'New login detected',
      intro: `Hello ${titleName}, we detected a login to your ZCraft account. If this was you, no action is needed.`,
      badge: 'Security Alert',
      accentColor: '#22d3ee',
      ctaLabel: 'Open Account Settings',
      ctaUrl: `${process.env.SITE_URL || 'https://www.z-craft.xyz'}/profile`,
      bodyHtml: `
        <p style="margin:0 0 12px;">We captured the login details below to help you confirm whether this session was yours.</p>
        <p style="margin:0 0 12px;">If this login was not you, reset your password immediately and review any connected accounts or admin access.</p>
      `,
      infoRows: [
        { label: 'Time (UTC)', value: formattedUtc },
        { label: 'Login method', value: loginMethod },
        { label: 'Browser timezone', value: browserTimezone },
        { label: 'Browser locale', value: browserLocale },
        { label: 'IP address', value: geo.ip || 'Unavailable' },
        { label: 'Approximate location', value: locationBits.join(', ') || 'Unavailable' },
        { label: 'Timezone', value: geo.timezone || 'Unavailable' },
        { label: 'Network / ISP', value: geo.org || 'Unavailable' },
        { label: 'Browser / device', value: browserUserAgent },
      ],
    });

    const result = await sendSendPulseEmail({
      subject: 'New login to your ZCraft account',
      html,
      emails: [auth.user.email],
    });

    return json({ sent: true, result });
  } catch (error) {
    console.error('SendPulse login alert error:', error);
    return json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
