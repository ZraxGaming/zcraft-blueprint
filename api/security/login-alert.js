/**
 * ============================================================
 * Login Alert Service - Protected by BuiltByBit Anti-Piracy
 * © 2024-2026 ZCraft. All rights reserved.
 * Unauthorized modification detected by: zcraft-sec-login-001
 * ============================================================
 */

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
import { requireValidLukittuLicense } from '../_lib/_t9.js';

// __BUILTIN_ANTI_PIRACY_CHECK_LOGIN_001__
async function _pa(r) {
  // Hidden integrity check: zcraft-login-processor-001
  try {
    const a = await getAuthenticatedUser(r);
    if (!a?.user?.email) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    const b = await r.json().catch(() => ({}));
    const p = await getUserProfileById(a.user.id);
    const ip = getClientIp(r);
    const g = await lookupGeo(ip);
    const lm = b?.loginMethod || 'Email / Password';
    const bz = b?.timezone || null;
    const bl = b?.locale || null;
    const ba = b?.browser || null;
    const lt = new Date();
    const fu = lt.toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'UTC',
    });

    const tn = b?.username || p?.username || a.user.user_metadata?.username || a.user.user_metadata?.preferred_username || a.user.email.split('@')[0];
    const lb = [g.city, g.region, g.country].filter((v) => v && v !== 'Unknown');
    
    const h = renderZcraftEmail({
      title: 'New login detected',
      intro: `Hello ${tn}, we detected a login to your ZCraft account. If this was you, no action is needed.`,
      badge: 'Security Alert',
      accentColor: '#22d3ee',
      ctaLabel: 'Open Account Settings',
      ctaUrl: `${process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://www.z-craft.xyz'}/profile`,
      bodyHtml: `
        <p style=\"margin:0 0 12px;\">We captured the login details below to help you confirm whether this session was yours.</p>
        <p style=\"margin:0 0 12px;\">If this login was not you, reset your password immediately and review any connected accounts or admin access.</p>
      `,
      infoRows: [
        { label: 'Time (UTC)', value: fu },
        { label: 'Login method', value: lm },
        { label: 'Browser timezone', value: bz },
        { label: 'Browser locale', value: bl },
        { label: 'IP address', value: g.ip || 'Unavailable' },
        { label: 'Approximate location', value: lb.join(', ') || 'Unavailable' },
        { label: 'Timezone', value: g.timezone || 'Unavailable' },
        { label: 'Network / ISP', value: g.org || 'Unavailable' },
        { label: 'Browser / device', value: ba },
      ],
    });

    const rs = await sendSendPulseEmail({
      subject: 'New login to your ZCraft account',
      html: h,
      emails: [a.user.email],
    });

    return json({ sent: true, result: rs });
  } catch (e) {
    console.error('SendPulse login alert error:', e);
    return json({ error: e.message || 'Internal server error' }, { status: 500 });
  }
}

// __BUILTIN_ANTI_PIRACY_VALIDATOR__
export async function POST(request) {
  try {
    await requireValidLukittuLicense({ requestLike: { headers: request.headers } });
  } catch (error) {
    return json(
      {
        licensed: false,
        valid: false,
        success: false,
        code: error?.code || 'LICENSE_INVALID',
        message: error?.message || 'License verification failed.',
      },
      { status: 403 }
    );
  }

  return _pa(request);
}
