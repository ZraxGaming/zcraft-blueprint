import { isOneSignalAllowedOrigin } from "./runtime";

declare global {
  interface Window {
    OneSignal?: any;
    OneSignalDeferred?: Array<(oneSignal: any) => void>;
  }
}

function whenOneSignalReady(callback: (oneSignal: any) => void) {
  if (typeof window === "undefined") return;
  if (!isOneSignalAllowedOrigin()) return;

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(callback);
}

export function oneSignalLogin(externalId: string, email?: string | null, tags?: Record<string, string>) {
  if (!externalId) return;

  whenOneSignalReady(async (OneSignal) => {
    try {
      await OneSignal.login(externalId);
      if (email) {
        await OneSignal.User.addEmail(email);
      }
      if (tags && Object.keys(tags).length > 0) {
        await OneSignal.User.addTags(tags);
      }
    } catch (error) {
      console.warn("OneSignal login sync failed:", error);
    }
  });
}

export function oneSignalLogout() {
  whenOneSignalReady(async (OneSignal) => {
    try {
      await OneSignal.logout();
    } catch (error) {
      console.warn("OneSignal logout sync failed:", error);
    }
  });
}

export function oneSignalTrackEvent(name: string, properties?: Record<string, any>) {
  if (!name) return;

  whenOneSignalReady(async (OneSignal) => {
    try {
      await OneSignal.User.trackEvent(name, properties || {});
    } catch (error) {
      console.warn(`OneSignal event "${name}" failed:`, error);
    }
  });
}
