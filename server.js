import express from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, 'dist');
const distIndexPath = path.resolve(distDir, 'index.html');
const rootIndexPath = path.resolve(__dirname, 'index.html');
let renderApp = null;
const sendPulseTokenCache = {
  accessToken: null,
  expiresAt: 0,
};

app.set('trust proxy', true);

const allowedOrigins = [
  process.env.SITE_URL,
  process.env.CORS_ALLOW_ORIGIN,
  'https://z-craft.xyz',
  'https://www.z-craft.xyz',
  'http://localhost:8080',
].filter(Boolean);

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  return next();
});

app.use(express.json());
app.use(express.static('dist'));

async function getRenderApp() {
  if (renderApp !== null) {
    return renderApp;
  }

  const builtEntryServerPath = path.resolve(distDir, 'entry-server.js');
  if (!fs.existsSync(builtEntryServerPath)) {
    renderApp = false;
    return renderApp;
  }

  try {
    const entryServer = await import(`file://${builtEntryServerPath.replace(/\\/g, '/')}`);
    renderApp = typeof entryServer.render === 'function' ? entryServer.render : false;
  } catch (error) {
    console.error('Failed to load SSR entry:', error);
    renderApp = false;
  }

  return renderApp;
}

function getSpaTemplate() {
  if (fs.existsSync(distIndexPath)) {
    return fs.readFileSync(distIndexPath, 'utf8');
  }

  if (fs.existsSync(rootIndexPath)) {
    return fs.readFileSync(rootIndexPath, 'utf8');
  }

  return '<!doctype html><html><body><div id="root"></div></body></html>';
}

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

function clampText(value = '', limit = 1024) {
  const text = String(value || '').trim();
  if (!text) return 'Not provided';
  return text.length > limit ? `${text.slice(0, limit - 3)}...` : text;
}

function createSignature(payload) {
  const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET || process.env.SENDPULSE_CLIENT_SECRET || 'zcraft-unsubscribe';
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function buildUnsubscribeLink(userId, category) {
  const origin = process.env.SITE_URL || 'https://z-craft.xyz';
  const payload = `${userId}:${category}`;
  const sig = createSignature(payload);
  return `${origin}/email/unsubscribe?uid=${encodeURIComponent(userId)}&category=${encodeURIComponent(category)}&sig=${encodeURIComponent(sig)}`;
}

function isOptionalEmailCategory(category) {
  return category === 'marketing' || category === 'recruitment';
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }

  const rawIp = req.ip || req.socket?.remoteAddress || '';
  return rawIp.replace(/^::ffff:/, '');
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

async function getAuthenticatedUser(req) {
  const authHeader = req.headers.authorization || '';
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

async function requireAdmin(req) {
  const auth = await getAuthenticatedUser(req);
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

app.post('/api/discord/join-server', async (req, res) => {
  try {
    const { accessToken, discordUserId } = req.body || {};

    if (!accessToken) {
      return res.status(400).json({ error: 'Missing Discord access token' });
    }

    const guildId = process.env.DISCORD_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!guildId || !botToken) {
      return res.json({ joined: false, skipped: true, reason: 'Discord guild auto-join is not configured' });
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
      return res.status(502).json({
        error: 'Failed to add user to Discord guild',
        details: errorText,
        discordUserId: resolvedUserId,
      });
    }

    return res.json({
      joined: true,
      discordUserId: resolvedUserId,
    });
  } catch (error) {
    console.error('Discord guild join error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// Cache exact member counts to avoid hammering Discord + hitting rate limits.
// 10 minutes is a good balance between freshness and safety.
let discordExactMemberCountCache = {
  guildId: null,
  fetchedAt: 0,
  count: 0,
};

app.get('/api/discord/widget', async (_req, res) => {
  try {
    const guildId = process.env.DISCORD_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!guildId) {
      return res.status(400).json({ error: 'Discord guild ID is not configured' });
    }

    const [guildResponse, widgetResponse] = await Promise.all([
      botToken
        ? fetch(`https://discord.com/api/v10/guilds/${guildId}?with_counts=true`, {
            headers: {
              Authorization: `Bot ${botToken}`,
            },
          }).catch(() => null)
        : Promise.resolve(null),
      fetch(`https://discord.com/api/guilds/${guildId}/widget.json`).catch(() => null),
    ]);

    const guildData = guildResponse && guildResponse.ok ? await guildResponse.json().catch(() => null) : null;
    const widgetData = widgetResponse && widgetResponse.ok ? await widgetResponse.json().catch(() => null) : null;

    if (!widgetData && !guildData) {
      return res.status(502).json({ error: 'Discord widget data is unavailable' });
    }

    let exactMemberCount = null;
    const cacheIsValid =
      botToken &&
      discordExactMemberCountCache.guildId === guildId &&
      Date.now() - discordExactMemberCountCache.fetchedAt < 10 * 60 * 1000 &&
      discordExactMemberCountCache.count > 0;

    if (cacheIsValid) {
      exactMemberCount = discordExactMemberCountCache.count;
    } else if (botToken) {
      // Exact counts require fetching members. This may fail if the bot lacks intents/permissions.
      // When it fails, we fall back to approximate/widget counts.
      try {
        let after = undefined;
        let total = 0;
        let pages = 0;

        while (pages < 100) {
          const url = new URL(`https://discord.com/api/v10/guilds/${guildId}/members`);
          url.searchParams.set('limit', '1000');
          if (after) url.searchParams.set('after', after);

          const resp = await fetch(url.toString(), {
            headers: { Authorization: `Bot ${botToken}` },
          });

          if (!resp.ok) break;

          const members = await resp.json().catch(() => null);
          if (!Array.isArray(members)) break;

          total += members.length;
          pages += 1;

          if (members.length < 1000) break;
          const lastId = members[members.length - 1]?.user?.id;
          if (!lastId) break;
          after = lastId;

          // Safety valve for very large guilds.
          if (total > 200000) break;
        }

        if (total > 0) {
          exactMemberCount = total;
          discordExactMemberCountCache = {
            guildId,
            fetchedAt: Date.now(),
            count: total,
          };
        }
      } catch (_err) {
        exactMemberCount = null;
      }
    }

    const memberCount =
      exactMemberCount ??
      guildData?.member_count ??
      guildData?.approximate_member_count ??
      widgetData?.member_count ??
      widgetData?.presence_count ??
      0;

    return res.json({
      guildId,
      name: guildData?.name || widgetData?.name || 'Discord Community',
      widgetUrl: `https://discord.com/widget?id=${guildId}&theme=dark`,
      inviteUrl: widgetData?.instant_invite || null,
      memberCount,
      memberCountExact: exactMemberCount !== null,
      onlineCount: widgetData?.presence_count ?? 0,
    });
  } catch (error) {
    console.error('Discord widget error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/email/send', async (req, res) => {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { subject, html, emails, audience, category } = req.body || {};
    if (!subject || !html) {
      return res.status(400).json({ error: 'Missing email subject or body' });
    }

    let recipientEmails = audience === 'all_users' ? await listAllUserEmails() : emails;
    let recipients = null;

    if (audience === 'all_users' && isOptionalEmailCategory(category)) {
      recipients = await listUsersForOptionalCategory(category);
      recipientEmails = recipients.map((recipient) => recipient.email);
    }

    const result = await sendSendPulseEmail({
      subject,
      html,
      emails: recipientEmails,
      category,
      recipients,
    });
    return res.json({ sent: true, result, recipientCount: recipientEmails.length });
  } catch (error) {
    console.error('SendPulse admin email error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/api/appeals', async (req, res) => {
  try {
    const webhookUrl = process.env.APPEAL_DISCORD_WEBHOOK_URL || process.env.DISCORD_APPEAL_WEBHOOK_URL;
    if (!webhookUrl) {
      return res.status(500).json({ error: 'Appeal webhook is not configured' });
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
    } = req.body || {};

    if (!minecraftUsername || !discordUsername || !punishmentReason || !appealReason) {
      return res.status(400).json({ error: 'Missing required appeal fields' });
    }

    const siteUrl = process.env.SITE_URL || 'https://z-craft.xyz';
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
      return res.status(502).json({ error: errorText || 'Failed to send appeal webhook' });
    }

    return res.json({ sent: true });
  } catch (error) {
    console.error('Appeal submission error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.get('/email/unsubscribe', async (req, res) => {
  try {
    const userId = String(req.query.uid || '');
    const category = String(req.query.category || '');
    const sig = String(req.query.sig || '');

    if (!userId || !category || !sig || !isOptionalEmailCategory(category)) {
      return res.status(400).send('Invalid unsubscribe link');
    }

    const expectedSig = createSignature(`${userId}:${category}`);
    if (sig !== expectedSig) {
      return res.status(403).send('Invalid unsubscribe signature');
    }

    const { url, serviceKey } = getSupabaseConfig();
    if (!url || !serviceKey) {
      return res.status(500).send('Email preference service is not configured');
    }

    const response = await fetch(`${url}/rest/v1/user_email_preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({
        user_id: userId,
        category,
        enabled: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(500).send(errorText || 'Failed to update preference');
    }

    return res.status(200).send(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Unsubscribed</title>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
          <style>
            body{font-family:Arial,sans-serif;background:#0f172a;color:#e5e7eb;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
            .card{max-width:560px;background:#111827;border:1px solid #374151;border-radius:16px;padding:32px}
            a{color:#60a5fa}
          </style>
        </head>
        <body>
          <div class="card">
            <h1>You are unsubscribed</h1>
            <p>You will no longer receive optional ${escapeHtml(category)} emails from ZCraft.</p>
            <p>Security emails and required account notices will still be sent.</p>
            <p><a href="${escapeHtml(process.env.SITE_URL || 'https://z-craft.xyz')}/profile">Manage preferences</a></p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Email unsubscribe error:', error);
    return res.status(500).send('Internal Server Error');
  }
});

app.post('/api/security/login-alert', async (req, res) => {
  try {
    const auth = await getAuthenticatedUser(req);
    if (!auth?.user?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const profile = await getUserProfileById(auth.user.id);
    const ip = getClientIp(req);
    const geo = await lookupGeo(ip);
    const loginMethod = req.body?.loginMethod || 'Email / Password';
    const browserTimezone = req.body?.timezone || null;
    const browserLocale = req.body?.locale || null;
    const browserUserAgent = req.body?.browser || null;
    const loginTime = new Date();
    const formattedUtc = loginTime.toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'UTC',
    });

    const titleName =
      req.body?.username ||
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
          <tr><td style="padding:6px 12px 6px 0"><strong>Browser timezone</strong></td><td>${escapeHtml(browserTimezone || 'Unavailable')}</td></tr>
          <tr><td style="padding:6px 12px 6px 0"><strong>Browser locale</strong></td><td>${escapeHtml(browserLocale || 'Unavailable')}</td></tr>
          <tr><td style="padding:6px 12px 6px 0"><strong>IP address</strong></td><td>${escapeHtml(geo.ip)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0"><strong>Location</strong></td><td>${escapeHtml(`${geo.city}, ${geo.region}, ${geo.country}`)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0"><strong>Timezone</strong></td><td>${escapeHtml(geo.timezone)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0"><strong>Network</strong></td><td>${escapeHtml(geo.org)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0"><strong>Browser / device</strong></td><td>${escapeHtml(browserUserAgent || 'Unavailable')}</td></tr>
        </table>
        <p>If this was not you, reset your password immediately and review your account activity.</p>
      </div>
    `;

    const result = await sendSendPulseEmail({
      subject: 'New login to your ZCraft account',
      html,
      emails: [auth.user.email],
    });

    return res.json({ sent: true, result });
  } catch (error) {
    console.error('SendPulse login alert error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.get('*', async (req, res) => {
  try {
    const render = await getRenderApp();
    const html = render ? await render(req.url) : getSpaTemplate();
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  } catch (error) {
    console.error('SSR Error:', error);
    res.status(500).end('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
