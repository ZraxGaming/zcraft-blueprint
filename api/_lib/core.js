import crypto from 'crypto';

const sendPulseTokenCache = {
  accessToken: null,
  expiresAt: 0,
};

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function htmlToText(html = '') {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function renderInfoRows(rows = []) {
  const filteredRows = rows.filter((row) => row && row.value && row.value !== 'Unavailable');

  if (filteredRows.length === 0) {
    return '';
  }

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:24px 0 0;">
      ${filteredRows.map((row) => `
        <tr>
          <td style="padding:10px 0;color:#8f98a8;font-size:13px;border-bottom:1px solid #1d2735;vertical-align:top;width:160px;">
            ${escapeHtml(row.label)}
          </td>
          <td style="padding:10px 0;color:#f3f7fb;font-size:13px;border-bottom:1px solid #1d2735;vertical-align:top;">
            ${escapeHtml(row.value)}
          </td>
        </tr>
      `).join('')}
    </table>
  `;
}

function renderZcraftEmail({
  title,
  intro,
  bodyHtml = '',
  ctaLabel,
  ctaUrl,
  accentColor = '#22d3ee',
  badge = 'ZCraft Network',
  footerNote = 'Z-Craft • Secure account and network notifications',
  infoRows = [],
  footerHtml = '',
}) {
  const ctaHtml = ctaLabel && ctaUrl
    ? `
      <tr><td align="center" style="padding:8px 0 0;">
        <a href="${escapeHtml(ctaUrl)}" style="
          display:inline-block;
          background:#f3f7fb;
          color:#081018;
          padding:12px 22px;
          border-radius:10px;
          text-decoration:none;
          font-weight:600;
          font-size:14px;
        ">
          ${escapeHtml(ctaLabel)}
        </a>
      </td></tr>
    `
    : '';

  return `<!DOCTYPE html>
<html>
<body style="margin:0;background:#05080d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="520" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;background:#0f141c;border:1px solid #1b2430;border-radius:18px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.35);">
          <tr><td style="height:4px;background:${escapeHtml(accentColor)};"></td></tr>
          <tr><td align="center" style="padding:22px 28px 10px;">
            <img src="https://www.z-craft.xyz/favicon.ico" width="44" height="44" alt="ZCraft" style="display:block;border:0;" />
          </td></tr>
          <tr><td align="center" style="padding:0 28px 6px;">
            <div style="display:inline-block;padding:6px 10px;border-radius:999px;background:rgba(34,211,238,0.10);color:${escapeHtml(accentColor)};font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
              ${escapeHtml(badge)}
            </div>
          </td></tr>
          <tr><td align="center" style="padding:6px 28px 0;">
            <h2 style="margin:0;color:#f3f7fb;font-size:28px;line-height:1.2;font-weight:700;">
              ${escapeHtml(title)}
            </h2>
          </td></tr>
          <tr><td align="center" style="padding:14px 36px 0;">
            <p style="margin:0;color:#97a2b3;font-size:15px;line-height:1.7;">
              ${escapeHtml(intro)}
            </p>
          </td></tr>
          ${ctaHtml}
          <tr><td style="padding:28px 28px 0;">
            <div style="background:#0a0f16;border:1px solid #1c2633;border-radius:14px;padding:18px 18px 4px;">
              <div style="color:#d7deea;font-size:14px;line-height:1.75;">
                ${bodyHtml}
                ${renderInfoRows(infoRows)}
                ${footerHtml}
              </div>
            </div>
          </td></tr>
          <tr><td style="padding:24px 28px 28px;">
            <div style="height:1px;background:#1d2735;"></div>
            <p style="margin:14px 0 0;color:#6f7c90;font-size:12px;text-align:center;">
              ${escapeHtml(footerNote)}
            </p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

function createSignature(payload) {
  const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.SENDPULSE_CLIENT_SECRET || 'zcraft-unsubscribe';
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function buildUnsubscribeLink(userId, category) {
  const origin = process.env.SITE_URL || 'https://www.z-craft.xyz';
  const payload = `${userId}:${category}`;
  const sig = createSignature(payload);
  return `${origin}/email/unsubscribe?uid=${encodeURIComponent(userId)}&category=${encodeURIComponent(category)}&sig=${encodeURIComponent(sig)}`;
}

function isOptionalEmailCategory(category) {
  return category === 'marketing' || category === 'recruitment';
}

function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return request.headers.get('x-real-ip') || '';
}

function isPrivateOrLocalIp(ip) {
  if (!ip) return true;
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('172.16.') ||
    ip.startsWith('172.17.') ||
    ip.startsWith('172.18.') ||
    ip.startsWith('172.19.') ||
    ip.startsWith('172.2') ||
    ip.startsWith('172.30.') ||
    ip.startsWith('172.31.')
  );
}

// __BUILTIN_ANTI_PIRACY_CHECK_AUTH_001__
function _gc() {
  // Hidden integrity check: zcraft-auth-db-001
  const u = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const k = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  const s = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url: u, anonKey: k, serviceKey: s };
}

// __BUILTIN_ANTI_PIRACY_CHECK_AUTH_002__
async function _gau(r) {
  // Hidden integrity check: zcraft-user-auth-validator-001
  const h = r.headers.get('authorization') || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : null;
  const { url: u, anonKey: k } = _gc();

  if (!t || !u || !k) {
    return null;
  }

  const res = await fetch(`${u}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${t}`,
      apikey: k,
    },
  });

  if (!res.ok) {
    return null;
  }

  const usr = await res.json();
  return { token: t, user: usr };
}

function getSupabaseConfig() {
  return _gc();
}

async function getAuthenticatedUser(request) {
  return _gau(request);
}

// __BUILTIN_ANTI_PIRACY_CHECK_AUTH_003__
async function _gup(i) {
  // Hidden integrity check: zcraft-profile-validator-001
  const { url: u, serviceKey: s } = _gc();
  if (!u || !s) {
    return null;
  }
  const res = await fetch(`${u}/rest/v1/users?id=eq.${encodeURIComponent(i)}&select=id,email,username,role`, {
    headers: { apikey: s, Authorization: `Bearer ${s}` },
  });
  if (!res.ok) return null;
  const r = await res.json();
  return r?.[0] || null;
}

// __BUILTIN_ANTI_PIRACY_CHECK_AUTH_004__
async function _ra(r) {
  // Hidden integrity check: zcraft-admin-authority-001
  const a = await _gau(r);
  if (!a?.user?.id) return null;
  const p = await _gup(a.user.id);
  if (!p || !['owner', 'admin'].includes(p.role)) return null;
  return { authUser: a.user, profile: p };
}

async function getUserProfileById(userId) {
  return _gup(userId);
}

async function requireAdmin(request) {
  return _ra(request);
}

async function listAllUserEmails() {
  const { url, serviceKey } = getSupabaseConfig();
  if (!url || !serviceKey) {
    throw new Error('Supabase service role key is not configured');
  }

  const response = await fetch(`${url}/rest/v1/users?select=email`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to load user emails');
  }

  const rows = await response.json();
  return [...new Set((rows || []).map((row) => row.email).filter(Boolean))];
}

async function listUsersForOptionalCategory(category) {
  const { url, serviceKey } = getSupabaseConfig();
  if (!url || !serviceKey) {
    throw new Error('Supabase service role key is not configured');
  }

  const [usersResponse, preferencesResponse] = await Promise.all([
    fetch(`${url}/rest/v1/users?select=id,email`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }),
    fetch(`${url}/rest/v1/user_email_preferences?category=eq.${encodeURIComponent(category)}&select=user_id,enabled`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    }),
  ]);

  if (!usersResponse.ok) {
    throw new Error(await usersResponse.text() || 'Failed to load users');
  }

  if (!preferencesResponse.ok) {
    throw new Error(await preferencesResponse.text() || 'Failed to load email preferences');
  }

  const users = await usersResponse.json();
  const preferences = await preferencesResponse.json();
  const preferenceMap = new Map((preferences || []).map((row) => [row.user_id, Boolean(row.enabled)]));

  return (users || []).filter((user) => {
    if (!user.email) return false;
    return preferenceMap.get(user.id) !== false;
  });
}

async function getSendPulseAccessToken() {
  const clientId = process.env.SENDPULSE_CLIENT_ID;
  const clientSecret = process.env.SENDPULSE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('SendPulse credentials are not configured');
  }

  const now = Date.now();
  if (sendPulseTokenCache.accessToken && sendPulseTokenCache.expiresAt > now + 60_000) {
    return sendPulseTokenCache.accessToken;
  }

  const response = await fetch('https://api.sendpulse.com/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const result = await response.json();
  if (!response.ok || !result.access_token) {
    throw new Error(result.error_description || result.message || 'Failed to authenticate with SendPulse');
  }

  sendPulseTokenCache.accessToken = result.access_token;
  sendPulseTokenCache.expiresAt = now + (Number(result.expires_in || 3600) * 1000);
  return result.access_token;
}

async function sendSendPulseEmail({ subject, html, emails, category, recipients }) {
  const fromEmail = process.env.SENDPULSE_FROM_EMAIL;
  const fromName = process.env.SENDPULSE_FROM_NAME || 'ZCraft Network';

  if (!fromEmail) {
    throw new Error('SENDPULSE_FROM_EMAIL is not configured');
  }

  const normalizedRecipients = recipients && recipients.length > 0
    ? recipients
    : [...new Set((emails || []).map((email) => String(email).trim()).filter(Boolean))].map((email) => ({ email }));

  if (normalizedRecipients.length === 0) {
    throw new Error('No recipient emails were provided');
  }

  const accessToken = await getSendPulseAccessToken();
  const results = [];

  for (const recipient of normalizedRecipients) {
    const unsubscribeFooterHtml = isOptionalEmailCategory(category) && recipient.userId
      ? `<p style="margin:22px 0 0;color:#7e8ca0;font-size:12px;">To stop these ${escapeHtml(category)} emails, <a href="${buildUnsubscribeLink(recipient.userId, category)}" style="color:#22d3ee;">unsubscribe here</a>.</p>`
      : '';
    const unsubscribeHtml = /<html[\s>]/i.test(html)
      ? html
      : renderZcraftEmail({
          title: subject,
          intro: 'You have a new update from ZCraft Network.',
          bodyHtml: html,
          badge:
            category === 'marketing' ? 'Marketing Update' :
            category === 'recruitment' ? 'Recruitment Update' :
            'ZCraft Network',
          accentColor: category === 'marketing' ? '#f59e0b' : category === 'recruitment' ? '#34d399' : '#22d3ee',
          footerHtml: unsubscribeFooterHtml,
        });

    const payload = {
      email: {
        html: Buffer.from(unsubscribeHtml, 'utf8').toString('base64'),
        text: htmlToText(unsubscribeHtml),
        subject,
        from: {
          name: fromName,
          email: fromEmail,
        },
        to: [{ email: recipient.email }],
      },
    };

    const response = await fetch('https://api.sendpulse.com/smtp/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.message || result.error || 'Failed to send email with SendPulse');
    }
    results.push(result);
  }

  return results;
}

async function lookupGeo(ip) {
  if (!ip || isPrivateOrLocalIp(ip)) {
    return {
      ip: ip || 'Unknown',
      city: 'Local',
      region: 'Network',
      country: 'Device',
      timezone: 'Local',
      org: 'Private network',
    };
  }

  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`);
    const data = await response.json();

    if (!response.ok || data.success === false) {
      return {
        ip,
        city: 'Unknown',
        region: 'Unknown',
        country: 'Unknown',
        timezone: 'Unknown',
        org: 'Unknown',
      };
    }

    return {
      ip,
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      country: data.country || 'Unknown',
      timezone: data.timezone?.id || 'Unknown',
      org: data.connection?.isp || data.connection?.org || 'Unknown',
    };
  } catch {
    return {
      ip,
      city: 'Unknown',
      region: 'Unknown',
      country: 'Unknown',
      timezone: 'Unknown',
      org: 'Unknown',
    };
  }
}

async function getDiscordUser(accessToken) {
  const response = await fetch('https://discord.com/api/v10/users/@me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.id) {
    throw new Error(data?.message || 'Failed to resolve Discord user from access token');
  }

  return data;
}

function htmlPage(title, body) {
  return `<!doctype html><html><head><meta charset="utf-8" /><title>${title}</title><meta name="viewport" content="width=device-width,initial-scale=1" /><style>body{font-family:Arial,sans-serif;background:#0f172a;color:#e5e7eb;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}.card{max-width:560px;background:#111827;border:1px solid #374151;border-radius:16px;padding:32px}a{color:#60a5fa}</style></head><body><div class="card">${body}</div></body></html>`;
}

export {
  buildUnsubscribeLink,
  createSignature,
  escapeHtml,
  getAuthenticatedUser,
  getClientIp,
  getDiscordUser,
  getSupabaseConfig,
  getUserProfileById,
  htmlPage,
  isOptionalEmailCategory,
  json,
  listAllUserEmails,
  listUsersForOptionalCategory,
  lookupGeo,
  requireAdmin,
  renderZcraftEmail,
  sendSendPulseEmail,
};
