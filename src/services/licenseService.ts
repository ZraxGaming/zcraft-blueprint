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

  constructor(
    code: LicenseErrorCode,
    message: string,
    status: LicenseStatus = "unknown",
    details?: unknown
  ) {
    super(message);
    this.name = "LicenseError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/* =========================
   TYPES
========================= */

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
  activation_count?: number;
  max_activations?: number | null;
}

/* =========================
   STATE
========================= */

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

/* =========================
   STORAGE
========================= */

const LICENSE_STATE_KEY = "zcraft_license_state";
const LICENSE_DEVICE_KEY = "zcraft_license_device_id";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStorage<T>(key: string): T | null {
  if (!canUseStorage()) return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: unknown) {
  if (!canUseStorage()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function removeStorage(key: string) {
  if (!canUseStorage()) return;
  try {
    localStorage.removeItem(key);
  } catch {}
}

/* =========================
   LUKITTU CONFIG
========================= */

const LUKITTU_VERIFY_URL =
  "https://api.lukittu.com/client/verify";

/* =========================
   DEVICE ID
========================= */

export function getDeviceId() {
  if (!canUseStorage()) {
    return `device-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  }

  const existing = localStorage.getItem(LICENSE_DEVICE_KEY);
  if (existing) return existing;

  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `device-${Math.random().toString(36).slice(2)}-${Date.now()}`;

  localStorage.setItem(LICENSE_DEVICE_KEY, generated);
  return generated;
}

/* =========================
   STATE HELPERS
========================= */

export function getStoredLicenseState(): LicenseState | null {
  return readStorage<LicenseState>(LICENSE_STATE_KEY);
}

export function saveLicenseState(state: LicenseState) {
  writeStorage(LICENSE_STATE_KEY, state);
}

export function clearStoredLicenseState() {
  removeStorage(LICENSE_STATE_KEY);
}

/* =========================
   ERROR MESSAGES
========================= */

export function getLicenseStatusMessage(code: LicenseErrorCode) {
  switch (code) {
    case "LICENSE_REQUIRED":
      return "License key is required.";
    case "LICENSE_INVALID":
      return "Invalid license key.";
    case "LICENSE_EXPIRED":
      return "License expired.";
    case "LICENSE_INACTIVE":
      return "License inactive.";
    case "LICENSE_SUSPENDED":
      return "License suspended.";
    case "LICENSE_BLOCKED":
      return "License blocked.";
    case "LICENSE_LIMIT_REACHED":
      return "Activation limit reached.";
    case "LICENSE_NETWORK_ERROR":
      return "Cannot reach license server.";
    case "LICENSE_PRODUCT_MISMATCH":
      return "License does not match this product.";
    default:
      return "License verification failed.";
  }
}

/* =========================
   LUKITTU REQUEST (CLEAN)
========================= */

async function requestLicense(payload: Record<string, unknown>) {
  try {
    const res = await fetch(LUKITTU_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json().catch(() => ({}))) as LicenseApiResponse;

    return { response: res, data };
  } catch (err) {
    throw new LicenseError(
      "LICENSE_NETWORK_ERROR",
      "License server unreachable",
      "network_error",
      err
    );
  }
}

/* =========================
   NORMALIZATION
========================= */

function mapState(
  licenseKey: string,
  data: LicenseApiResponse,
  deviceId: string
): LicenseState {
  return {
    licenseKey,
    productId: "",
    deviceId,
    status: data.valid ? "active" : "invalid",
    customerEmail: data.license?.customer_email ?? null,
    activationCount: data.activation_count,
    maxActivations: data.max_activations ?? null,
    expiresAt: data.license?.expires_at ?? null,
    lastValidatedAt: new Date().toISOString(),
  };
}

function throwError(data: LicenseApiResponse, fallback: LicenseErrorCode) {
  const code =
    (data.error as LicenseErrorCode) || fallback || "LICENSE_UNKNOWN";

  throw new LicenseError(
    code,
    getLicenseStatusMessage(code),
    "unknown",
    data
  );
}

/* =========================
   MAIN FUNCTIONS
========================= */

export async function validateLicenseKey(licenseKey: string) {
  const key = licenseKey.trim();

  if (!key) {
    throw new LicenseError(
      "LICENSE_REQUIRED",
      getLicenseStatusMessage("LICENSE_REQUIRED"),
      "unknown"
    );
  }

  const { response, data } = await requestLicense({
    license_key: key,
    device_identifier: getDeviceId(),
  });

  if (!response.ok || data.valid !== true) {
    throwError(data, "LICENSE_INVALID");
  }

  return {
    valid: true,
    state: mapState(key, data, getDeviceId()),
    response: data,
  };
}

export async function activateLicenseKey(
  licenseKey: string,
  deviceId = getDeviceId()
) {
  const key = licenseKey.trim();

  const { response, data } = await requestLicense({
    license_key: key,
    device_identifier: deviceId,
  });

  if (!response.ok || data.success === false) {
    throwError(data, "LICENSE_INVALID");
  }

  return {
    success: true,
    state: {
      ...mapState(key, data, deviceId),
      status: "active" as LicenseStatus,
    },
    response: data,
  };
}

export async function deactivateLicenseKey(
  licenseKey: string,
  deviceId = getDeviceId()
) {
  const key = licenseKey.trim();

  const { response, data } = await requestLicense({
    license_key: key,
    device_identifier: deviceId,
    action: "deactivate",
  });

  if (!response.ok) {
    throwError(data, "LICENSE_INVALID");
  }

  return { success: true, response: data };
}

/* =========================
   STORED VALIDATION
========================= */

export function ensureStoredLicenseIsActive() {
  const state = getStoredLicenseState();

  if (!state?.licenseKey) {
    throw new LicenseError(
      "LICENSE_REQUIRED",
      getLicenseStatusMessage("LICENSE_REQUIRED"),
      "unknown"
    );
  }

  if (state.status === "expired") {
    throw new LicenseError(
      "LICENSE_EXPIRED",
      getLicenseStatusMessage("LICENSE_EXPIRED"),
      state.status,
      state
    );
  }

  if (state.status === "inactive") {
    throw new LicenseError(
      "LICENSE_INACTIVE",
      getLicenseStatusMessage("LICENSE_INACTIVE"),
      state.status,
      state
    );
  }

  if (["suspended", "blocked"].includes(state.status)) {
    throw new LicenseError(
      "LICENSE_SUSPENDED",
      getLicenseStatusMessage("LICENSE_SUSPENDED"),
      state.status,
      state
    );
  }

  return state;
}

export async function refreshStoredLicense() {
  const state = getStoredLicenseState();

  if (!state?.licenseKey) {
    throw new LicenseError(
      "LICENSE_REQUIRED",
      getLicenseStatusMessage("LICENSE_REQUIRED"),
      "unknown"
    );
  }

  const { response, data } = await requestLicense({
    license_key: state.licenseKey,
    device_identifier: getDeviceId(),
  });

  if (!response.ok || data.valid !== true) {
    throwError(data, "LICENSE_INVALID");
  }

  const refreshed: LicenseState = {
    ...state,
    status: data.license?.status || "active",
    lastValidatedAt: new Date().toISOString(),
  };

  saveLicenseState(refreshed);
  return refreshed;
}
