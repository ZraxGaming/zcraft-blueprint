/**
 * ============================================================
 * Email Send Handler - Protected by BuiltByBit Anti-Piracy
 * © 2024-2026 ZCraft. All rights reserved.
 * Unauthorized distribution or modification is prohibited.
 * ============================================================
 * This code is protected under international copyright law.
 * Removal of this notice or unauthorized copying will be detected.
 * __BUILTIN_ANTI_PIRACY_CHECK_EMAIL_SEND_001__
 */

import {
  isOptionalEmailCategory,
  json,
  listAllUserEmails,
  listUsersForOptionalCategory,
  requireAdmin,
  sendSendPulseEmail,
} from '../_lib/core.js';

export async function POST(request) {
  try {
    const admin = await requireAdmin(request);
    if (!admin) {
      return json({ error: 'Admin access required' }, { status: 403 });
    }

    const { subject, html, emails, audience, category } = await request.json().catch(() => ({}));
    if (!subject || !html) {
      return json({ error: 'Missing email subject or body' }, { status: 400 });
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

    return json({ sent: true, result, recipientCount: recipientEmails.length });
  } catch (error) {
    console.error('SendPulse admin email error:', error);
    return json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
