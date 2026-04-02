import * as Sentry from "@sentry/react";

let initialized = false;

export function initializeSentry() {
  if (initialized || Sentry.isInitialized()) {
    return true;
  }

  const dsn = import.meta.env.VITE_SENTRY_DSN?.trim();
  if (!dsn) {
    if (import.meta.env.DEV) {
      console.warn("[Sentry] skipped: VITE_SENTRY_DSN is missing");
    }
    return false;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT?.trim() || import.meta.env.MODE,
    tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE || 0.1),
    replaysSessionSampleRate: Number(import.meta.env.VITE_SENTRY_REPLAYS_SESSION_SAMPLE_RATE || 0.1),
    replaysOnErrorSampleRate: Number(import.meta.env.VITE_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE || 1),
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: false,
      }),
    ],
    normalizeDepth: 5,
    sendDefaultPii: true,
    debug: import.meta.env.DEV,
  });

  initialized = true;

  if (import.meta.env.DEV) {
    console.info("[Sentry] initialized");
  }

  return true;
}

export { Sentry };
