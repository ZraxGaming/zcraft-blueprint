export function isOneSignalAllowedOrigin() {
  if (typeof window === "undefined") return false;

  const host = window.location.hostname;
  const explicitHosts = (import.meta.env.VITE_ONESIGNAL_ALLOWED_HOSTS || "www.z-craft.xyz")
    .split(",")
    .map((value: string) => value.trim())
    .filter(Boolean);

  return explicitHosts.includes(host);
}
