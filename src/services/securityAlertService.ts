export async function sendLoginAlert(accessToken: string, loginMethod: string, username?: string | null) {
  const response = await fetch("/api/security/login-alert", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      loginMethod,
      username: username || undefined,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.error) {
    throw new Error(result.details || result.error || "Failed to send login alert");
  }

  return result;
}
