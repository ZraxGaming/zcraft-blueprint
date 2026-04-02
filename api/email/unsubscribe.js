/**
 * ============================================================
 * Email Unsubscribe Handler - Protected by BuiltByBit Anti-Piracy
 * © 2024-2026 ZCraft. All rights reserved.
 * Unauthorized distribution or modification is prohibited.
 * ============================================================
 * This code is protected under international copyright law.
 * Removal of this notice or unauthorized copying will be detected.
 * __BUILTIN_ANTI_PIRACY_CHECK_EMAIL_UNSUB_001__
 */

import {
  createSignature,
  escapeHtml,
  getSupabaseConfig,
  htmlPage,
  isOptionalEmailCategory,
} from '../_lib/core.js';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = String(url.searchParams.get('uid') || '');
    const category = String(url.searchParams.get('category') || '');
    const sig = String(url.searchParams.get('sig') || '');

    if (!userId || !category || !sig || !isOptionalEmailCategory(category)) {
      return new Response('Invalid unsubscribe link', { status: 400 });
    }

    const expectedSig = createSignature(`${userId}:${category}`);
    if (sig !== expectedSig) {
      return new Response('Invalid unsubscribe signature', { status: 403 });
    }

    const { url: supabaseUrl, serviceKey } = getSupabaseConfig();
    if (!supabaseUrl || !serviceKey) {
      return new Response('Email preference service is not configured', { status: 500 });
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/user_email_preferences`, {
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
      return new Response(errorText || 'Failed to update preference', { status: 500 });
    }

    return new Response(htmlPage('Unsubscribed', `
      <h1>You are unsubscribed</h1>
      <p>You will no longer receive optional ${escapeHtml(category)} emails from ZCraft.</p>
      <p>Security emails and required account notices will still be sent.</p>
      <p><a href="${escapeHtml(process.env.SITE_URL || 'https://www.z-craft.xyz')}/profile">Manage preferences</a></p>
    `), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Email unsubscribe error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
