# Observability and Env Safety

This project now uses:

- PostHog for analytics and session replay
- Sentry for error reporting and stack traces

## Important rule

Anything that starts with `VITE_` is bundled into the browser app.
That means it is visible to users in the JavaScript bundle and in DevTools.

Use `VITE_` only for public values such as:

- Site branding
- Public URLs
- Supabase publishable keys
- PostHog project token
- Sentry DSN

Keep real secrets server-side only, without the `VITE_` prefix.

## Current public analytics env

```env
VITE_PUBLIC_POSTHOG_PROJECT_TOKEN=phc_your_posthog_project_token
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
VITE_SENTRY_DSN=
VITE_SENTRY_ENVIRONMENT=production
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE=0.1
VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE=1
```

## What the app does

- PostHog is initialized in `src/main.tsx`
- Session replay is enabled through the PostHog provider
- Auth identity is synced in `src/components/analytics/AnalyticsSync.tsx`
- Sentry is initialized in `src/lib/sentry.ts`
- React render errors are also captured from `src/components/ErrorBoundary.tsx`
- PostHog and Sentry both have test buttons in `src/pages/admin/AdminToolsPage.tsx`

## Sentry source maps

If you set these server-side env vars:

```env
SENTRY_ORG=your-sentry-org-slug
SENTRY_PROJECT=your-sentry-project-slug
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_RELEASE=your-release-name
```

then the Vite build will:

- generate hidden source maps in production
- upload them to Sentry with `@sentry/vite-plugin`
- delete the `.map` files from `dist` after upload

If those values are not present, the app still runs normally, but source maps will not be uploaded.

## What cannot be hidden

If the browser needs a value to run the app, that value is not secret.
You can reduce exposure by moving private logic to the server, but you cannot make browser-side config disappear from a shipped frontend bundle.
