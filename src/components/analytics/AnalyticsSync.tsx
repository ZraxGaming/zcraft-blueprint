import { useEffect } from "react";
import { usePostHog } from "@posthog/react";
import { useAuth } from "@/contexts/AuthContext";
import { Sentry } from "@/lib/sentry";

export function AnalyticsSync() {
  const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim();

  if (!posthogKey) {
    return null;
  }

  return <AnalyticsSyncInner />;
}

function AnalyticsSyncInner() {
  const posthog = usePostHog();
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user && userProfile) {
      posthog.identify(user.id, {
        email: user.email || undefined,
        username: userProfile.username || undefined,
        role: userProfile.role || undefined,
      });

      Sentry.setUser({
        id: user.id,
        email: user.email || undefined,
        username: userProfile.username || undefined,
      });

      return;
    }

    posthog.reset();
    Sentry.setUser(null);
  }, [loading, posthog, user, userProfile]);

  return null;
}
