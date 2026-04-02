import posthog from "posthog-js";
import { Sentry } from "@/lib/sentry";

export function trackAnalyticsEvent(event: string, properties: Record<string, unknown> = {}) {
  try {
    if (typeof posthog.capture === "function") {
      posthog.capture(event, properties);
    }
  } catch (error) {
    console.warn("PostHog capture failed:", error);
  }
}

export function trackAnalyticsException(error: unknown, properties: Record<string, unknown> = {}) {
  try {
    if (typeof posthog.captureException === "function") {
      posthog.captureException(error, properties);
    }
  } catch (captureError) {
    console.warn("PostHog exception capture failed:", captureError);
  }

  Sentry.captureException(error, {
    extra: properties,
  });
  void Sentry.flush(2000);
}
