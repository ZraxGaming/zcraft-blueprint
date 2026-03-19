import express from 'express';
import dotenv from 'dotenv';
import { render } from './dist/entry-server.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.set('trust proxy', true);
app.use(express.json());

// Serve static files
app.use(express.static('dist'));

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

async function sendOneSignalEmail(payload) {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;

  if (!appId || !apiKey) {
    return { sent: false, skipped: true, reason: 'OneSignal email API is not configured' };
  }

  const emailPayload = {
    app_id: appId,
    target_channel: 'email',
    email_subject: payload.subject,
    email_body: payload.html,
    include_unsubscribed: Boolean(payload.includeUnsubscribed),
    ...(Array.isArray(payload.emails) && payload.emails.length > 0
      ? { email_to: payload.emails }
      : { included_segments: Array.isArray(payload.includedSegments) && payload.includedSegments.length > 0 ? payload.includedSegments : ['Subscribed Users'] }),
    ...(process.env.ONESIGNAL_EMAIL_FROM_ADDRESS ? { email_from_address: process.env.ONESIGNAL_EMAIL_FROM_ADDRESS } : {}),
    ...(process.env.ONESIGNAL_EMAIL_REPLY_TO_ADDRESS ? { email_reply_to_address: process.env.ONESIGNAL_EMAIL_REPLY_TO_ADDRESS } : {}),
    ...(process.env.ONESIGNAL_EMAIL_SENDER_DOMAIN ? { email_sender_domain: process.env.ONESIGNAL_EMAIL_SENDER_DOMAIN } : {}),
  };

  const response = await fetch('https://api.onesignal.com/notifications', {
    method: 'POST',
    headers: {
      Authorization: `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to send OneSignal email');
  }

  return await response.json();
}

async function getAuthenticatedUser(req) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey =
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!token || !supabaseUrl || !supabaseKey) {
    return null;
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: supabaseKey,
    },
  });

  if (!response.ok) {
    return null;
  }

  return await response.json();
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

app.post('/api/discord/join-server', async (req, res) => {
  try {
    const { accessToken, discordUserId } = req.body || {};

    if (!accessToken || !discordUserId) {
      return res.status(400).json({ error: 'Missing Discord access token or user id' });
    }

    const guildId = process.env.DISCORD_GUILD_ID;
    const botToken = process.env.DISCORD_BOT_TOKEN;

    if (!guildId || !botToken) {
      return res.json({ joined: false, skipped: true, reason: 'Discord guild auto-join is not configured' });
    }

    const response = await fetch(`https://discord.com/api/guilds/${guildId}/members/${discordUserId}`, {
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
      });
    }

    return res.json({ joined: true });
  } catch (error) {
    console.error('Discord guild join error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/onesignal/custom-event', async (req, res) => {
  try {
    const { externalId, name, properties } = req.body || {};

    if (!externalId || !name) {
      return res.status(400).json({ error: 'Missing externalId or event name' });
    }

    const appId = process.env.ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !apiKey) {
      return res.json({ sent: false, skipped: true, reason: 'OneSignal API is not configured' });
    }

    const response = await fetch(`https://api.onesignal.com/apps/${appId}/custom_events`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [
          {
            external_id: externalId,
            name,
            timestamp: new Date().toISOString(),
            properties: properties || {},
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(502).json({ error: 'Failed to send OneSignal custom event', details: errorText });
    }

    return res.json({ sent: true });
  } catch (error) {
    console.error('OneSignal custom event error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/onesignal/send-email', async (req, res) => {
  try {
    const {
      subject,
      html,
      emails,
      includedSegments,
      includeUnsubscribed,
    } = req.body || {};

    if (!subject || !html) {
      return res.status(400).json({ error: 'Missing email subject or body' });
    }

    const result = await sendOneSignalEmail({
      subject,
      html,
      emails,
      includedSegments,
      includeUnsubscribed,
    });
    return res.json({ sent: true, result });
  } catch (error) {
    console.error('OneSignal send email error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/security/login-alert', async (req, res) => {
  try {
    const authUser = await getAuthenticatedUser(req);
    if (!authUser?.email) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const ip = getClientIp(req);
    const geo = await lookupGeo(ip);
    const loginMethod = req.body?.loginMethod || 'password';
    const loginTime = new Date();
    const formattedUtc = loginTime.toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'long',
      timeZone: 'UTC',
    });

    const titleName =
      req.body?.username ||
      authUser.user_metadata?.username ||
      authUser.user_metadata?.preferred_username ||
      authUser.email.split('@')[0];

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

    const result = await sendOneSignalEmail({
      subject: 'New login to your ZCraft account',
      html,
      emails: [authUser.email],
      includeUnsubscribed: true,
    });

    return res.json({ sent: true, result });
  } catch (error) {
    console.error('Login alert email error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Handle all routes with SSR
app.get('*', async (req, res) => {
  try {
    const html = await render(req.url);
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  } catch (e) {
    console.error('SSR Error:', e);
    res.status(500).end('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
