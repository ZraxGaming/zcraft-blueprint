export async function sendOneSignalEmail(payload: {
  subject: string;
  html: string;
  emails?: string[];
  includedSegments?: string[];
  includeUnsubscribed?: boolean;
}) {
  const response = await fetch("/api/onesignal/send-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subject: payload.subject,
      html: payload.html,
      emails: payload.emails || [],
      includedSegments: payload.includedSegments || ["Subscribed Users"],
      includeUnsubscribed: payload.includeUnsubscribed || false,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.error) {
    throw new Error(result.details || result.error || "Failed to send OneSignal email");
  }

  return result;
}
