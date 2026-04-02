import { buildApiUrl } from "@/lib/api";

type LoginAlertPayload = {
  loginMethod: string;
  username?: string | null;
  timezone?: string | null;
  locale?: string | null;
  browser?: string | null;
};

export async function sendLoginAlert(
  accessToken: string,
  loginMethod: string,
  username?: string | null,
  extras: Partial<LoginAlertPayload> = {}
) {
  const response = await fetch(buildApiUrl("/api/security/login-alert"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      loginMethod,
      username: username || undefined,
      timezone: extras.timezone || undefined,
      locale: extras.locale || undefined,
      browser: extras.browser || undefined,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.error) {
    throw new Error(result.error || result.details || "Failed to send login alert");
  }

  return result;
}
