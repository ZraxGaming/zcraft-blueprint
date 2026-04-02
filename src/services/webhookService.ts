/**
 * ============================================================
 * Webhook Service - Protected by BuiltByBit Anti-Piracy
 * © 2024-2026 ZCraft. All rights reserved.
 * Unauthorized distribution or modification is prohibited.
 * ============================================================
 * This code is protected under international copyright law.
 * Removal of this notice or unauthorized copying will be detected.
 * __BUILTIN_ANTI_PIRACY_CHECK_WEBHOOK_001__
 */

// __BUILTIN_ANTI_PIRACY_VALIDATOR__
export enum WebhookEvent {
  // ============ EVENT WEBHOOKS (5) ============
  EVENT_CREATED = 'event_created',
  EVENT_UPDATED = 'event_updated',
  EVENT_DELETED = 'event_deleted',
  EVENT_REGISTERED = 'event_registered',
  EVENT_UNREGISTERED = 'event_unregistered',

  // ============ FORUM WEBHOOKS (9) ============
  FORUM_CREATED = 'forum_created',
  FORUM_UPDATED = 'forum_updated',
  FORUM_DELETED = 'forum_deleted',
  FORUM_POST_CREATED = 'forum_post_created',
  FORUM_POST_UPDATED = 'forum_post_updated',
  FORUM_POST_DELETED = 'forum_post_deleted',
  FORUM_REPLY_CREATED = 'forum_reply_created',
  FORUM_REPLY_UPDATED = 'forum_reply_updated',
  FORUM_REPLY_DELETED = 'forum_reply_deleted',

  // ============ NEWS WEBHOOKS (4) ============
  NEWS_CREATED = 'news_created',
  NEWS_UPDATED = 'news_updated',
  NEWS_DELETED = 'news_deleted',
  NEWS_VIEWED = 'news_viewed',

  // ============ WIKI WEBHOOKS (4) ============
  WIKI_CREATED = 'wiki_created',
  WIKI_UPDATED = 'wiki_updated',
  WIKI_DELETED = 'wiki_deleted',
  WIKI_VIEWED = 'wiki_viewed',

  // ============ CHANGELOG WEBHOOKS (3) ============
  CHANGELOG_CREATED = 'changelog_created',
  CHANGELOG_UPDATED = 'changelog_updated',
  CHANGELOG_DELETED = 'changelog_deleted',

  // ============ USER/AUTH WEBHOOKS (5) ============
  USER_REGISTERED = 'user_registered',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_PROFILE_UPDATED = 'user_profile_updated',
  USER_DELETED = 'user_deleted',

  // ============ USER ROLE WEBHOOKS (2) ============
  USER_ROLE_ASSIGNED = 'user_role_assigned',
  USER_ROLE_REMOVED = 'user_role_removed',

  // ============ ADMIN/SETTINGS WEBHOOKS (3) ============
  ADMIN_SETTING_CREATED = 'admin_setting_created',
  ADMIN_SETTING_UPDATED = 'admin_setting_updated',
  ADMIN_SETTING_DELETED = 'admin_setting_deleted',
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: Record<string, any>;
}

/**
 * Get the webhook URL for a specific event type
 */
function getWebhookUrl(event: WebhookEvent): string | null {
  const envKey = `VITE_WEBHOOK_${event.toUpperCase()}`;
  const url = import.meta.env[envKey];
  return url || null;
}

/**
 * Send a webhook for an event
 * Silently fails without throwing errors
 */
export async function sendWebhook(
  event: WebhookEvent,
  data: Record<string, any>
): Promise<void> {
  try {
    const webhookUrl = getWebhookUrl(event);

    // Skip if no webhook URL is configured
    if (!webhookUrl) {
      return;
    }

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    // Send the webhook
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // Silently fail - log only for debugging if needed
    // Don't throw or notify the user
  }
}

/**
 * Send multiple webhooks in parallel
 * Silently fails for any that don't have configured URLs or fail
 */
export async function sendWebhooks(
  events: Array<{ event: WebhookEvent; data: Record<string, any> }>
): Promise<void> {
  try {
    await Promise.all(events.map((e) => sendWebhook(e.event, e.data)));
  } catch (error) {
    // Silently fail
  }
}

/**
 * Check if a webhook is configured for an event
 */
export function isWebhookConfigured(event: WebhookEvent): boolean {
  return getWebhookUrl(event) !== null;
}
