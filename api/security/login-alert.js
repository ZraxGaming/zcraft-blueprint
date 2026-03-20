import {
  escapeHtml,
  getAuthenticatedUser,
  getClientIp,
  getUserProfileById,
  json,
  lookupGeo,
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
    const loginMethod = body?.loginMethod || 'password';
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

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
        <h2>New Login To Your ZCraft Account</h2>
        <p>Hello ${escapeHtml(titleName)},</p>
        <p>We detected a new login to your account. If this was you, no action is needed.</p>
        <table style="border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:6px 12px 6px 0"><strong>Time (UTC)</strong></td><td>${escapeHtml(formattedUtc)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0"><strong>Login method</strong></td><td>${escapeHtml(loginMethod)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0"><strong>IP address</strong></td><td>${escapeHtml(geo.ip)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0"><strong>Location</strong></td><td>${escapeHtml(`${geo.city}, ${geo.region}, ${geo.country}`)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0"><strong>Timezone</strong></td><td>${escapeHtml(geo.timezone)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0"><strong>Network</strong></td><td>${escapeHtml(geo.org)}</td></tr>
        </table>
        <p>If this was not you, reset your password immediately and review your account activity.</p>
      </div>
    `;

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
