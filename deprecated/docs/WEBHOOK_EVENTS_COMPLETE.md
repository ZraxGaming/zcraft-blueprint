# Complete Webhook Events Reference

This document lists **ALL 36 webhook events** implemented in the application.

## Event Categories Overview

| Category | Count | Events |
|----------|-------|--------|
| Events | 5 | Created, Updated, Deleted, Registered, Unregistered |
| Forums | 9 | 3x Forums + 3x Posts + 3x Replies (CRUD operations) |
| News | 4 | Created, Updated, Deleted, Viewed |
| Wiki | 4 | Created, Updated, Deleted, Viewed |
| Changelogs | 3 | Created, Updated, Deleted |
| Users/Auth | 5 | Registered, Login, Logout, Profile Updated, Deleted |
| User Roles | 2 | Role Assigned, Role Removed |
| Admin/Settings | 3 | Setting Created, Setting Updated, Setting Deleted |
| **TOTAL** | **36** | Full coverage of all operations |

---

## 1. Event Webhooks (5)

| Event | Trigger | Payload Data |
|-------|---------|--------------|
| `EVENT_CREATED` | New event created | eventId, title, date, location, description |
| `EVENT_UPDATED` | Event details changed | eventId, title, date, location, updates |
| `EVENT_DELETED` | Event removed | eventId, title, date, location |
| `EVENT_REGISTERED` | User registered for event | eventId, title, registeredCount, maxPlayers |
| `EVENT_UNREGISTERED` | User unregistered from event | eventId, title, registeredCount |

**Example Payload:**
```json
{
  "event": "event_created",
  "timestamp": "2026-01-27T12:00:00.000Z",
  "data": {
    "eventId": "uuid",
    "title": "Community Meetup",
    "date": "2026-02-15T14:00:00Z",
    "location": "Downtown Hall",
    "description": "Join us for our monthly meetup!"
  }
}
```

---

## 2. Forum Webhooks (9)

### 2.1 Forum Category Webhooks (3)

| Event | Trigger | Payload Data |
|-------|---------|--------------|
| `FORUM_CREATED` | New forum category created | forumId, title, slug, category, description |
| `FORUM_UPDATED` | Forum details changed | forumId, title, category, updates |
| `FORUM_DELETED` | Forum category removed | forumId, title, category |

### 2.2 Forum Post Webhooks (3)

| Event | Trigger | Payload Data |
|-------|---------|--------------|
| `FORUM_POST_CREATED` | New discussion post created | postId, forumId, authorId, title, content |
| `FORUM_POST_UPDATED` | Post edited | postId, forumId, title, updates |
| `FORUM_POST_DELETED` | Post removed | postId, forumId, title |

### 2.3 Forum Reply Webhooks (3)

| Event | Trigger | Payload Data |
|-------|---------|--------------|
| `FORUM_REPLY_CREATED` | New reply to post | replyId, postId, authorId, content |
| `FORUM_REPLY_UPDATED` | Reply edited | replyId, postId, updates |
| `FORUM_REPLY_DELETED` | Reply removed | replyId, postId |

---

## 3. News Webhooks (4)

| Event | Trigger | Payload Data |
|-------|---------|--------------|
| `NEWS_CREATED` | New article published | articleId, title, slug, authorId, excerpt |
| `NEWS_UPDATED` | Article edited | articleId, title, slug, updates |
| `NEWS_DELETED` | Article removed | articleId, title, slug |
| `NEWS_VIEWED` | Article accessed/read | articleId, title, slug, views |

**Example - NEWS_VIEWED:**
```json
{
  "event": "news_viewed",
  "timestamp": "2026-01-27T12:00:00.000Z",
  "data": {
    "articleId": "uuid",
    "title": "Breaking News",
    "slug": "breaking-news",
    "views": 156
  }
}
```

---

## 4. Wiki Webhooks (4)

| Event | Trigger | Payload Data |
|-------|---------|--------------|
| `WIKI_CREATED` | New wiki article created | articleId, title, slug, category, authorId |
| `WIKI_UPDATED` | Article edited | articleId, title, slug, category, updates |
| `WIKI_DELETED` | Article removed | articleId, title, slug, category |
| `WIKI_VIEWED` | Article accessed/read | articleId, title, slug, category, views |

---

## 5. Changelog Webhooks (3)

| Event | Trigger | Payload Data |
|-------|---------|--------------|
| `CHANGELOG_CREATED` | New version released | changelogId, version, title, type, releasedAt, changes |
| `CHANGELOG_UPDATED` | Release notes edited | changelogId, version, title, type, updates |
| `CHANGELOG_DELETED` | Changelog removed | changelogId, version, title, type |

**Example - CHANGELOG_CREATED:**
```json
{
  "event": "changelog_created",
  "timestamp": "2026-01-27T12:00:00.000Z",
  "data": {
    "changelogId": "uuid",
    "version": "1.2.0",
    "title": "New Features Release",
    "type": "feature",
    "releasedAt": "2026-01-27T12:00:00Z",
    "changes": [
      "Added new event system",
      "Improved forum performance",
      "Fixed bug in news page"
    ]
  }
}
```

---

## 6. User/Auth Webhooks (5)

| Event | Trigger | Payload Data |
|-------|---------|--------------|
| `USER_REGISTERED` | New user signs up | userId, email, username, createdAt |
| `USER_LOGIN` | User logs in | userId, email, lastSignInAt |
| `USER_LOGOUT` | User logs out | userId, email |
| `USER_PROFILE_UPDATED` | User updates profile info | userId, email, updatedFields, updates |
| `USER_DELETED` | User account deleted | userId, username, email, deletedAt |

**Example - USER_REGISTERED:**
```json
{
  "event": "user_registered",
  "timestamp": "2026-01-27T12:00:00.000Z",
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "username": "john_doe",
    "createdAt": "2026-01-27T12:00:00.000Z"
  }
}
```

**Example - USER_PROFILE_UPDATED:**
```json
{
  "event": "user_profile_updated",
  "timestamp": "2026-01-27T12:00:00.000Z",
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "updatedFields": ["username", "bio", "avatar_url"],
    "updates": {
      "username": "new_username",
      "bio": "New bio text",
      "avatar_url": "https://..."
    }
  }
}
```

---

## 7. User Role Webhooks (2)

| Event | Trigger | Payload Data |
|-------|---------|--------------|
| `USER_ROLE_ASSIGNED` | Role granted to user | userId, username, role, assignedAt |
| `USER_ROLE_REMOVED` | Role removed from user | userId, username, role, removedAt |

**Example:**
```json
{
  "event": "user_role_assigned",
  "timestamp": "2026-01-27T12:00:00.000Z",
  "data": {
    "userId": "uuid",
    "username": "john_doe",
    "role": "moderator",
    "assignedAt": "2026-01-27T12:00:00.000Z"
  }
}
```

---

## 8. Admin/Settings Webhooks (3)

| Event | Trigger | Payload Data |
|-------|---------|--------------|
| `ADMIN_SETTING_CREATED` | New admin setting created | settingId, key |
| `ADMIN_SETTING_UPDATED` | Admin setting changed | settingId, key, updatedAt |
| `ADMIN_SETTING_DELETED` | Admin setting removed | key |

---

## Environment Variables Reference

Add these to `.env` to enable webhooks:

```dotenv
# Event Webhooks (5)
VITE_WEBHOOK_EVENT_CREATED=
VITE_WEBHOOK_EVENT_UPDATED=
VITE_WEBHOOK_EVENT_DELETED=
VITE_WEBHOOK_EVENT_REGISTERED=
VITE_WEBHOOK_EVENT_UNREGISTERED=

# Forum Webhooks (9)
VITE_WEBHOOK_FORUM_CREATED=
VITE_WEBHOOK_FORUM_UPDATED=
VITE_WEBHOOK_FORUM_DELETED=
VITE_WEBHOOK_FORUM_POST_CREATED=
VITE_WEBHOOK_FORUM_POST_UPDATED=
VITE_WEBHOOK_FORUM_POST_DELETED=
VITE_WEBHOOK_FORUM_REPLY_CREATED=
VITE_WEBHOOK_FORUM_REPLY_UPDATED=
VITE_WEBHOOK_FORUM_REPLY_DELETED=

# News Webhooks (4)
VITE_WEBHOOK_NEWS_CREATED=
VITE_WEBHOOK_NEWS_UPDATED=
VITE_WEBHOOK_NEWS_DELETED=
VITE_WEBHOOK_NEWS_VIEWED=

# Wiki Webhooks (4)
VITE_WEBHOOK_WIKI_CREATED=
VITE_WEBHOOK_WIKI_UPDATED=
VITE_WEBHOOK_WIKI_DELETED=
VITE_WEBHOOK_WIKI_VIEWED=

# Changelog Webhooks (3)
VITE_WEBHOOK_CHANGELOG_CREATED=
VITE_WEBHOOK_CHANGELOG_UPDATED=
VITE_WEBHOOK_CHANGELOG_DELETED=

# User/Auth Webhooks (5)
VITE_WEBHOOK_USER_REGISTERED=
VITE_WEBHOOK_USER_LOGIN=
VITE_WEBHOOK_USER_LOGOUT=
VITE_WEBHOOK_USER_PROFILE_UPDATED=
VITE_WEBHOOK_USER_DELETED=

# User Role Webhooks (2)
VITE_WEBHOOK_USER_ROLE_ASSIGNED=
VITE_WEBHOOK_USER_ROLE_REMOVED=

# Admin/Settings Webhooks (3)
VITE_WEBHOOK_ADMIN_SETTING_CREATED=
VITE_WEBHOOK_ADMIN_SETTING_UPDATED=
VITE_WEBHOOK_ADMIN_SETTING_DELETED=
```

## Key Features

✅ **36 Total Events** - Complete coverage for all application operations
✅ **Silent Failures** - No errors if webhook URL is missing or fails
✅ **Non-blocking** - Webhooks sent asynchronously in background
✅ **Flexible Configuration** - Enable only the events you need via .env
✅ **Rich Data** - Each webhook includes all relevant information
✅ **Automatic Timestamps** - Every webhook includes ISO 8601 timestamp

## Services with Webhooks

- ✅ `eventService.ts` - All event operations
- ✅ `forumService.ts` - All forum/post/reply operations
- ✅ `newsService.ts` - All news operations
- ✅ `wikiService.ts` - All wiki operations
- ✅ `changelogService.ts` - All changelog operations
- ✅ `userService.ts` - All user operations (NEW)
- ✅ `settingsService.ts` - All admin settings operations
- ✅ `AuthContext.tsx` - User registration/login/logout/profile updates

## Usage Examples

### Configure Discord Webhook
```dotenv
VITE_WEBHOOK_EVENT_CREATED=https://discord.com/api/webhooks/xxx/yyy
VITE_WEBHOOK_CHANGELOG_CREATED=https://discord.com/api/webhooks/xxx/yyy
```

### Configure Multiple Services
```dotenv
VITE_WEBHOOK_EVENT_CREATED=https://discord.com/api/webhooks/...
VITE_WEBHOOK_NEWS_CREATED=https://slack.com/services/...
VITE_WEBHOOK_CHANGELOG_CREATED=https://zapier.com/hooks/catch/...
VITE_WEBHOOK_USER_REGISTERED=https://your-api.com/webhooks/users
```

### In Code
```typescript
import { sendWebhook, WebhookEvent } from '@/services/webhookService';

// Send webhook manually
await sendWebhook(WebhookEvent.EVENT_CREATED, {
  eventId: '123',
  title: 'My Event',
});

// Check if webhook is configured
import { isWebhookConfigured } from '@/services/webhookService';
if (isWebhookConfigured(WebhookEvent.EVENT_CREATED)) {
  // Webhook is available
}
```

## Webhook Payload Structure

Every webhook follows this format:

```typescript
{
  event: string;           // Event name (e.g., "event_created")
  timestamp: string;       // ISO 8601 timestamp (e.g., "2026-01-27T12:00:00.000Z")
  data: {
    // Event-specific data varies by event type
    [key: string]: any;
  }
}
```
