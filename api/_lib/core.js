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

function getSupabaseConfig() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return { url, anonKey, serviceKey };
}

async function getAuthenticatedUser(request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const { url, anonKey } = getSupabaseConfig();

  if (!token || !url || !anonKey) {
    return null;
  }

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: anonKey,
    },
  });

  if (!response.ok) {
    return null;
  }

  const user = await response.json();
  return { token, user };
}

async function getUserProfileById(userId) {
  const { url, serviceKey } = getSupabaseConfig();
  if (!url || !serviceKey) {
    return null;
  }

  const response = await fetch(`${url}/rest/v1/users?id=eq.${encodeURIComponent(userId)}&select=id,email,username,role`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const rows = await response.json();
  return rows?.[0] || null;
}

async function requireAdmin(request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth?.user?.id) {
    return null;
  }

  const profile = await getUserProfileById(auth.user.id);
  if (!profile || !['owner', 'admin'].includes(profile.role)) {
    return null;
  }

  return { authUser: auth.user, profile };
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
    const unsubscribeHtml = isOptionalEmailCategory(category) && recipient.userId
      ? `${html}<hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb" /><p style="font-size:12px;color:#6b7280">To stop these ${escapeHtml(category)} emails, <a href="${buildUnsubscribeLink(recipient.userId, category)}">unsubscribe here</a>.</p>`
      : html;

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
  sendSendPulseEmail,
};
