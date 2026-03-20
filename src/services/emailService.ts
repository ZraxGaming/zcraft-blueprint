import { buildApiUrl } from "@/lib/api";

export async function sendAdminEmail(payload: {
  subject: string;
  html: string;
  accessToken: string;
  emails?: string[];
  audience?: "manual" | "all_users";
  category?: "marketing" | "recruitment";
}) {
  const response = await fetch(buildApiUrl("/api/email/send"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${payload.accessToken}`,
    },
    body: JSON.stringify({
      subject: payload.subject,
      html: payload.html,
      emails: payload.emails || [],
      audience: payload.audience || "manual",
      category: payload.category,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.error) {
    throw new Error(result.error || result.details || "Failed to send email");
  }

  return result;
}
