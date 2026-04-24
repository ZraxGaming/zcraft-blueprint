import crypto from "crypto";
import os from "os";

const LICENSE_KEY_PLACEHOLDER = "%%__LUKITTU_LICENSE_KEY__%%";

// Hardcoded Team ID (UUID v4). Not a secret, but kept out of env for buyer simplicity.
// Stored as fragments to make simple string searches less effective.
const TEAM_ID = [
  "58a3c98f",
  "-a498",
  "-4404",
  "-b19c",
  "-eac3d9afe6d3",
].join("");

const licenseCache = {
  checkedAt: 0,
  nextCheckAt: 0,
  valid: null,
  details: null,
  code: null,
  raw: null,
  hardwareIdentifier: null,
};

function nowMs() {
  return Date.now();
}

function isTruthyEnv(value) {
  const text = String(value || "").trim().toLowerCase();
  if (!text) return false;
  return text !== "0" && text !== "false" && text !== "no" && text !== "off";
}

function isPlaceholderLicenseKey(value) {
  const key = String(value || "").trim();
  if (!key) return true;
  if (key === LICENSE_KEY_PLACEHOLDER) return true;
  if (key.includes("%%__") && key.includes("__%%")) return true;
  return false;
}

function getLukittuConfig() {
  const licenseKey =
    process.env.Licesnse_Key ||
    process.env.LICENSE_KEY ||
    process.env.LUKITTU_LICENSE_KEY ||
    "";

  return {
    enforce: isTruthyEnv(process.env.LUKITTU_ENFORCE ?? (process.env.NODE_ENV === "production" ? "true" : "false")),
    licenseKey: String(licenseKey || "").trim(),
    teamId: TEAM_ID,
    productId: String(process.env.LUKITTU_PRODUCT_ID || "").trim(),
    customerId: String(process.env.LUKITTU_CUSTOMER_ID || "").trim(),
    version: String(process.env.LUKITTU_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || "unknown").trim(),
    branch: String(process.env.LUKITTU_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || "production").trim(),
    hardwareIdentifier: String(process.env.LUKITTU_HARDWARE_IDENTIFIER || "").trim(),
  };
}

function computeHardwareIdentifier() {
  if (licenseCache.hardwareIdentifier) return licenseCache.hardwareIdentifier;

  const cfg = getLukittuConfig();
  if (cfg.hardwareIdentifier) {
    licenseCache.hardwareIdentifier = cfg.hardwareIdentifier;
    return cfg.hardwareIdentifier;
  }

  const hostname = os.hostname?.() || "unknown-host";
  const platform = os.platform?.() || "unknown-platform";
  const arch = os.arch?.() || "unknown-arch";
  const cpus = os.cpus?.() || [];
  const cpuModel = cpus?.[0]?.model || "unknown-cpu";

  const nets = os.networkInterfaces?.() || {};
  const macs = Object.values(nets)
    .flat()
    .filter(Boolean)
    .map((net) => net.mac)
    .filter((mac) => mac && mac !== "00:00:00:00:00:00")
    .sort()
    .join(",");

  const seed = `${hostname}|${platform}|${arch}|${cpuModel}|${macs}`;
  const id = crypto.createHash("sha256").update(seed).digest("hex");

  // Lukittu requires 10-1000 chars, no spaces.
  licenseCache.hardwareIdentifier = id.slice(0, 64);
  return licenseCache.hardwareIdentifier;
}

function randomChallenge() {
  return crypto.randomBytes(16).toString("hex");
}

function getClientIpFromRequestLike(requestLike) {
  const header =
    requestLike?.headers?.["x-forwarded-for"] ||
    requestLike?.headers?.get?.("x-forwarded-for") ||
    requestLike?.headers?.["x-real-ip"] ||
    requestLike?.headers?.get?.("x-real-ip") ||
    "";

  if (typeof header === "string" && header.trim()) {
    return header.split(",")[0].trim();
  }
  return "";
}

async function callLukittu(endpointPath, body) {
  const cfg = getLukittuConfig();
  const url = `https://app.lukittu.com/api/v1/client/teams/${encodeURIComponent(cfg.teamId)}${endpointPath}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

function normalizeVerificationResult(payload, httpOk) {
  const valid = Boolean(payload?.result?.valid === true);
  const code = String(payload?.result?.code || (httpOk ? "UNKNOWN" : "HTTP_ERROR"));
  const details = String(payload?.result?.details || payload?.message || payload?.error || "");

  return { valid, code, details, raw: payload };
}

export async function verifyLukittuLicense({
  licenseKey,
  requestLike,
  force = false,
} = {}) {
  const cfg = getLukittuConfig();
  const trimmedKey = String(licenseKey || cfg.licenseKey || "").trim();

  if (!cfg.teamId || !trimmedKey || isPlaceholderLicenseKey(trimmedKey)) {
    return {
      valid: false,
      code: "CONFIG_MISSING",
      details: "Lukittu is not configured.",
      raw: null,
    };
  }

  const t = nowMs();
  if (!force && licenseCache.valid === true && t < licenseCache.nextCheckAt) {
    return {
      valid: true,
      code: licenseCache.code || "VALID",
      details: licenseCache.details || "Cached license verification.",
      raw: licenseCache.raw,
    };
  }

  // If we recently checked and it failed, avoid hammering the API.
  if (!force && licenseCache.valid === false && t < licenseCache.nextCheckAt) {
    return {
      valid: false,
      code: licenseCache.code || "INVALID",
      details: licenseCache.details || "Cached license failure.",
      raw: licenseCache.raw,
    };
  }

  const hwid = computeHardwareIdentifier();
  const body = {
    licenseKey: trimmedKey,
    challenge: randomChallenge(),
    version: cfg.version,
    branch: cfg.branch,
    hardwareIdentifier: hwid,
    ...(cfg.customerId ? { customerId: cfg.customerId } : {}),
    ...(cfg.productId ? { productId: cfg.productId } : {}),
  };

  try {
    const { response, data } = await callLukittu("/verification/verify", body);
    const normalized = normalizeVerificationResult(data, response.ok);

    licenseCache.checkedAt = t;
    licenseCache.valid = normalized.valid;
    licenseCache.code = normalized.code;
    licenseCache.details = normalized.details;
    licenseCache.raw = normalized.raw;

    // Heartbeat is recommended every ~30 minutes; we re-check sooner for safety.
    licenseCache.nextCheckAt = t + (normalized.valid ? 15 * 60 * 1000 : 60 * 1000);
    return normalized;
  } catch (error) {
    licenseCache.checkedAt = t;
    licenseCache.valid = false;
    licenseCache.code = "NETWORK_ERROR";
    licenseCache.details = "Failed to reach Lukittu.";
    licenseCache.raw = { error: String(error?.message || error) };
    licenseCache.nextCheckAt = t + 60 * 1000;
    return { valid: false, code: "NETWORK_ERROR", details: "Failed to reach Lukittu.", raw: licenseCache.raw };
  }
}

export async function heartbeatLukittuLicense({ licenseKey, requestLike, force = false } = {}) {
  const cfg = getLukittuConfig();
  const trimmedKey = String(licenseKey || cfg.licenseKey || "").trim();

  if (!cfg.teamId || !trimmedKey || isPlaceholderLicenseKey(trimmedKey)) {
    return {
      valid: false,
      code: "CONFIG_MISSING",
      details: "Lukittu is not configured.",
      raw: null,
    };
  }

  const t = nowMs();
  if (!force && licenseCache.valid === true && t < licenseCache.nextCheckAt) {
    return {
      valid: true,
      code: licenseCache.code || "VALID",
      details: licenseCache.details || "Cached license verification.",
      raw: licenseCache.raw,
    };
  }

  const hwid = computeHardwareIdentifier();
  const body = {
    licenseKey: trimmedKey,
    hardwareIdentifier: hwid,
    challenge: randomChallenge(),
    version: cfg.version,
    branch: cfg.branch,
    ...(cfg.customerId ? { customerId: cfg.customerId } : {}),
    ...(cfg.productId ? { productId: cfg.productId } : {}),
  };

  try {
    const { response, data } = await callLukittu("/verification/heartbeat", body);
    const normalized = normalizeVerificationResult(data, response.ok);

    licenseCache.checkedAt = t;
    licenseCache.valid = normalized.valid;
    licenseCache.code = normalized.code;
    licenseCache.details = normalized.details;
    licenseCache.raw = normalized.raw;

    licenseCache.nextCheckAt = t + (normalized.valid ? 25 * 60 * 1000 : 60 * 1000);
    return normalized;
  } catch (error) {
    licenseCache.checkedAt = t;
    licenseCache.valid = false;
    licenseCache.code = "NETWORK_ERROR";
    licenseCache.details = "Failed to reach Lukittu.";
    licenseCache.raw = { error: String(error?.message || error) };
    licenseCache.nextCheckAt = t + 60 * 1000;
    return { valid: false, code: "NETWORK_ERROR", details: "Failed to reach Lukittu.", raw: licenseCache.raw };
  }
}

export async function requireValidLukittuLicense({ requestLike } = {}) {
  const cfg = getLukittuConfig();
  if (!cfg.enforce) {
    return { enforced: false, valid: true, code: "ENFORCEMENT_DISABLED", details: "License enforcement disabled." };
  }

  // Verify at least once; then heartbeat thereafter.
  const firstCheck = licenseCache.valid === null;
  const result = firstCheck
    ? await verifyLukittuLicense({ requestLike })
    : await heartbeatLukittuLicense({ requestLike });

  if (!result.valid) {
    const error = new Error(result.details || "Invalid license.");
    error.code = result.code || "LICENSE_INVALID";
    throw error;
  }

  return { enforced: true, valid: true, code: result.code || "VALID", details: result.details || "Valid license." };
}
