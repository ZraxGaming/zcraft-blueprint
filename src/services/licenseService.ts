export type LicenseStatus =
  | "unknown"
  | "valid"
  | "active"
  | "expired"
  | "invalid"
  | "inactive"
  | "suspended"
  | "blocked"
  | "limit_reached"
  | "network_error";

export type LicenseErrorCode =
  | "LICENSE_REQUIRED"
  | "LICENSE_INVALID"
  | "LICENSE_EXPIRED"
  | "LICENSE_INACTIVE"
  | "LICENSE_SUSPENDED"
  | "LICENSE_BLOCKED"
  | "LICENSE_LIMIT_REACHED"
  | "LICENSE_NETWORK_ERROR"
  | "LICENSE_PRODUCT_MISMATCH"
  | "LICENSE_UNKNOWN";

export class LicenseError extends Error {
  code: LicenseErrorCode;
  status: LicenseStatus;
  details?: unknown;

  constructor(code: LicenseErrorCode, message: string, status: LicenseStatus = "unknown", details?: unknown) {
    super(message);
    this.name = "LicenseError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export interface LicenseApiLicense {
  status?: string;
  customer_email?: string | null;
  activation_count?: number;
  max_activations?: number | null;
  expires_at?: string | null;
}

export interface LicenseApiResponse {
  valid?: boolean;
  success?: boolean;
  licensed?: boolean;
  error?: string;
  message?: string;
  code?: string;
  license?: LicenseApiLicense;
  activation_id?: string;
  activation_count?: number;
  max_activations?: number | null;
}

export interface LicenseState {
  licenseKey: string;
  productId: string;
  deviceId: string;
  status: LicenseStatus;
  customerEmail?: string | null;
  activationCount?: number;
  maxActivations?: number | null;
  expiresAt?: string | null;
  lastValidatedAt: string;
}

const LICENSE_STATE_KEY = "zcraft_license_state";
const LICENSE_DEVICE_KEY = "zcraft_license_device_id";

export const LICENSE_REQUIRED = false;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStorage<T>(key: string): T | null {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures.
  }
}

function removeStorage(key: string) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
}

export function getDeviceId() {
  if (!canUseStorage()) {
    return `device-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  }

  const existing = window.localStorage.getItem(LICENSE_DEVICE_KEY);
  if (existing) return existing;

  const generated = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `device-${Math.random().toString(36).slice(2)}-${Date.now()}`;

  window.localStorage.setItem(LICENSE_DEVICE_KEY, generated);
  return generated;
}

export function getStoredLicenseState(): LicenseState | null {
  return readStorage<LicenseState>(LICENSE_STATE_KEY);
}

export function saveLicenseState(state: LicenseState) {
  writeStorage(LICENSE_STATE_KEY, state);
}

export function clearStoredLicenseState() {
  removeStorage(LICENSE_STATE_KEY);
}

export function getStoredLicenseKey() {
  return getStoredLicenseState()?.licenseKey || "";
}

export function getLicenseStatusMessage(code: LicenseErrorCode) {
  switch (code) {
    case "LICENSE_REQUIRED":
      return "A valid license key is required to use this site.";
    case "LICENSE_INVALID":
      return "That license key is invalid.";
    case "LICENSE_EXPIRED":
      return "That license key has expired.";
    case "LICENSE_INACTIVE":
      return "That license key is inactive.";
    case "LICENSE_SUSPENDED":
      return "That license key has been suspended.";
    case "LICENSE_BLOCKED":
      return "That license key is blocked.";
    case "LICENSE_LIMIT_REACHED":
      return "That license key has reached its activation limit.";
    case "LICENSE_NETWORK_ERROR":
      return "We could not verify your license right now.";
    case "LICENSE_PRODUCT_MISMATCH":
      return "That license key does not match this product.";
    default:
      return "We could not verify this license.";
  }
}

function normalizeErrorCode(errorText?: string, license?: LicenseApiLicense): LicenseErrorCode {
  const text = `${errorText || ""} ${license?.status || ""}`.toLowerCase();
  if (text.includes("expired")) return "LICENSE_EXPIRED";
  if (text.includes("inactive")) return "LICENSE_INACTIVE";
  if (text.includes("suspend")) return "LICENSE_SUSPENDED";
  if (text.includes("blocked")) return "LICENSE_BLOCKED";
  if (text.includes("limit")) return "LICENSE_LIMIT_REACHED";
  if (text.includes("product")) return "LICENSE_PRODUCT_MISMATCH";
  if (text.includes("invalid") || text.includes("not found")) return "LICENSE_INVALID";
  return "LICENSE_UNKNOWN";
}

async function requestLicense(endpoint: "validate" | "verify" | "status" | "clear", payload: Record<string, unknown>) {
  let response: Response;
  try {
    const method = endpoint === "status" ? "GET" : "POST";
    const _m = { status: "s", verify: "v", clear: "c", validate: "u" } as const;
    const slug = _m[endpoint];
    response = await fetch(["/api", "/_k7", `/${slug}`].join(""), {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      ...(method === "POST" ? { body: JSON.stringify(payload) } : {}),
      credentials: "include",
    });
  } catch (error) {
    throw new LicenseError("LICENSE_NETWORK_ERROR", "We could not reach the license server.", "network_error", error);
  }

  const data = (await response.json().catch(() => ({}))) as LicenseApiResponse;
  return { response, data };
}

function mapLicenseState(licenseKey: string, response: LicenseApiResponse, deviceId: string): LicenseState {
  const status = (response.license?.status || (response.valid ? "active" : "unknown")) as LicenseStatus;
  return {
    licenseKey,
    productId: "",
    deviceId,
    status,
    customerEmail: response.license?.customer_email ?? null,
    activationCount: response.license?.activation_count ?? response.activation_count,
    maxActivations: response.license?.max_activations ?? response.max_activations ?? null,
    expiresAt: response.license?.expires_at ?? null,
    lastValidatedAt: new Date().toISOString(),
  };
}

function throwLicenseError(response: LicenseApiResponse, fallbackCode: LicenseErrorCode = "LICENSE_UNKNOWN") {
  const code = normalizeErrorCode(response.error || response.message, response.license) || fallbackCode;
  throw new LicenseError(code, getLicenseStatusMessage(code), (response.license?.status as LicenseStatus) || "unknown", response);
}

export async function validateLicenseKey(licenseKey: string) {
  const trimmedKey = licenseKey.trim();
  if (!trimmedKey) {
    throw new LicenseError("LICENSE_REQUIRED", getLicenseStatusMessage("LICENSE_REQUIRED"), "unknown");
  }

  const { response, data } = await requestLicense("verify", {
    license_key: trimmedKey,
  });

  if (!response.ok) {
    throwLicenseError(data, (data.code as LicenseErrorCode) || "LICENSE_INVALID");
  }

  if (!data.valid || data.license?.status !== "active") {
    throwLicenseError(data, (data.code as LicenseErrorCode) || (data.license?.status === "expired" ? "LICENSE_EXPIRED" : "LICENSE_INVALID"));
  }

  return {
    valid: true,
    state: mapLicenseState(trimmedKey, data, getDeviceId()),
    response: data,
  };
}

export async function activateLicenseKey(licenseKey: string, deviceIdentifier = getDeviceId(), ipAddress?: string) {
  const trimmedKey = licenseKey.trim();
  const { response, data } = await requestLicense("verify", {
    license_key: trimmedKey,
    device_identifier: deviceIdentifier,
    ...(ipAddress ? { ip_address: ipAddress } : {}),
  });

  if (!response.ok || data.success !== true) {
    throwLicenseError(data, (data.code as LicenseErrorCode) || "LICENSE_INVALID");
  }

  return {
    success: true,
    state: {
      ...mapLicenseState(trimmedKey, data, deviceIdentifier),
      status: "active" as LicenseStatus,
    },
    response: data,
  };
}

export async function deactivateLicenseKey(licenseKey: string, deviceIdentifier = getDeviceId()) {
  const trimmedKey = licenseKey.trim();
  const { response, data } = await requestLicense("clear", {
    license_key: trimmedKey,
    device_identifier: deviceIdentifier,
  });

  if (!response.ok || (data as any).cleared !== true) {
    throwLicenseError(data, (data.code as LicenseErrorCode) || "LICENSE_INVALID");
  }

  return { success: true, response: data };
}

export function ensureStoredLicenseIsActive() {
  const state = getStoredLicenseState();
  if (!state?.licenseKey) {
    throw new LicenseError("LICENSE_REQUIRED", getLicenseStatusMessage("LICENSE_REQUIRED"), "unknown");
  }

  if (state.status === "expired") {
    throw new LicenseError("LICENSE_EXPIRED", getLicenseStatusMessage("LICENSE_EXPIRED"), state.status, state);
  }

  if (state.status === "inactive") {
    throw new LicenseError("LICENSE_INACTIVE", getLicenseStatusMessage("LICENSE_INACTIVE"), state.status, state);
  }

  if (state.status === "suspended" || state.status === "blocked") {
    throw new LicenseError("LICENSE_SUSPENDED", getLicenseStatusMessage("LICENSE_SUSPENDED"), state.status, state);
  }

  return state;
}

export async function refreshStoredLicense() {
  const state = getStoredLicenseState();
  if (!state?.licenseKey) {
    throw new LicenseError("LICENSE_REQUIRED", getLicenseStatusMessage("LICENSE_REQUIRED"), "unknown");
  }

  const { response, data } = await requestLicense("status", {});
  if (!response.ok || data.licensed !== true) {
    throwLicenseError(data, (data.code as LicenseErrorCode) || "LICENSE_REQUIRED");
  }

  const refreshed: LicenseState = {
    ...state,
    status: (data.license?.status || state.status) as LicenseStatus,
    customerEmail: data.license?.customer_email ?? state.customerEmail ?? null,
    activationCount: data.license?.activation_count ?? data.activation_count ?? state.activationCount,
    maxActivations: data.license?.max_activations ?? data.max_activations ?? state.maxActivations ?? null,
    expiresAt: data.license?.expires_at ?? state.expiresAt ?? null,
    lastValidatedAt: new Date().toISOString(),
  };
  saveLicenseState(refreshed);
  return refreshed;
}
