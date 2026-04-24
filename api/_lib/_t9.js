import crypto from "crypto";
import os from "os";

// Hardcoded Team ID — do not move to env.
const TEAM_ID = "58a3c98f-a498-4404-b19c-eac3d9afe6d3";

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
  if (key.includes("%%__") && key.includes("__%%")) return true;
  return false;
}

function getLukittuConfig() {
  // "Licesnse_Key" kept intentionally to match the .env typo — also accepts correct spellings.
  const licenseKey =
    process.env.Licesnse_Key ||
    process.env.License_Key ||
    process.env.LICENSE_KEY ||
    process.env.LUKITTU_LICENSE_KEY ||
    "";

  const rawVersion = String(
    process.env.LUKITTU_VERSION || process.env.VERCEL_GIT_COMMIT_SHA || ""
  ).trim();

  const rawBranch = String(
    process.env.LUKITTU_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || ""
  ).trim();

  // version: must be 3-255 chars, no spaces.
  const version =
    rawVersion.length >= 3 ? rawVersion.slice(0, 255) : "unknown";

  // branch: must be 2-255 chars, pattern ^[a-zA-Z0-9_-]+$
  // Sanitize: replace any disallowed char (e.g. "/" in "feature/x") with "-".
  const sanitizedBranch = rawBranch
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 255);
  const branch =
    sanitizedBranch.length >= 2 ? sanitizedBranch : "production";

  return {
    enforce: isTruthyEnv(
      process.env.LUKITTU_ENFORCE ??
        (process.env.NODE_ENV === "production" ? "true" : "false")
    ),
    licenseKey: String(licenseKey || "").trim(),
    teamId: TEAM_ID,
    productId: String(process.env.LUKITTU_PRODUCT_ID || "").trim(),
    customerId: String(process.env.LUKITTU_CUSTOMER_ID || "").trim(),
    version,
    branch,
    hardwareIdentifier: String(
      process.env.LUKITTU_HARDWARE_IDENTIFIER || ""
    ).trim(),
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

  licenseCache.hardwareIdentifier = id;
  return licenseCache.hardwareIdentifier;
}

function randomChallenge() {
  return crypto.randomBytes(16).toString("hex");
}

async function callLukittu(endpointPath, body) {
  const url = `https://app.lukittu.com/api/v1/client/teams/${encodeURIComponent(TEAM_ID)}${endpointPath}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  return { response, data };
}

function normalizeVerificationResult(payload, httpOk) {
  const valid = payload?.result?.valid === true;
  const code = String(
    payload?.result?.code || (httpOk ? "UNKNOWN" : "HTTP_ERROR")
  );
  const details = String(
    payload?.result?.details || payload?.message || payload?.error || ""
  );

  return { valid, code, details, raw: payload };
}

function buildVerifyBody(cfg) {
  const body = {
    licenseKey: cfg.licenseKey,
    challenge: randomChallenge(),
    version: cfg.version,
    branch: cfg.branch,
    hardwareIdentifier: computeHardwareIdentifier(),
  };
  if (cfg.customerId) body.customerId = cfg.customerId;
  if (cfg.productId) body.productId = cfg.productId;
  return body;
}

export async function verifyLukittuLicense({
  licenseKey,
  requestLike,
  force = false,
} = {}) {
  const cfg = getLukittuConfig();
  const trimmedKey = String(licenseKey || cfg.licenseKey || "").trim();

  if (!trimmedKey || isPlaceholderLicenseKey(trimmedKey)) {
    return {
      valid: false,
      code: "CONFIG_MISSING",
      details: "License key is not configured.",
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

  if (!force && licenseCache.valid === false && t < licenseCache.nextCheckAt) {
    return {
      valid: false,
      code: licenseCache.code || "INVALID",
      details: licenseCache.details || "Cached license failure.",
      raw: licenseCache.raw,
    };
  }

  try {
    const { response, data } = await callLukittu(
      "/verification/verify",
      buildVerifyBody({ ...cfg, licenseKey: trimmedKey })
    );
    const normalized = normalizeVerificationResult(data, response.ok);

    licenseCache.checkedAt = t;
    licenseCache.valid = normalized.valid;
    licenseCache.code = normalized.code;
    licenseCache.details = normalized.details;
    licenseCache.raw = normalized.raw;
    licenseCache.nextCheckAt = t + (normalized.valid ? 15 * 60 * 1000 : 60 * 1000);

    return normalized;
  } catch (error) {
    licenseCache.checkedAt = t;
    licenseCache.valid = false;
    licenseCache.code = "NETWORK_ERROR";
    licenseCache.details = "Failed to reach Lukittu.";
    licenseCache.raw = { error: String(error?.message || error) };
    licenseCache.nextCheckAt = t + 60 * 1000;
    return {
      valid: false,
      code: "NETWORK_ERROR",
      details: "Failed to reach Lukittu.",
      raw: licenseCache.raw,
    };
  }
}

export async function heartbeatLukittuLicense({
  licenseKey,
  requestLike,
  force = false,
} = {}) {
  const cfg = getLukittuConfig();
  const trimmedKey = String(licenseKey || cfg.licenseKey || "").trim();

  if (!trimmedKey || isPlaceholderLicenseKey(trimmedKey)) {
    return {
      valid: false,
      code: "CONFIG_MISSING",
      details: "License key is not configured.",
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

  try {
    const { response, data } = await callLukittu(
      "/verification/heartbeat",
      buildVerifyBody({ ...cfg, licenseKey: trimmedKey })
    );
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
    return {
      valid: false,
      code: "NETWORK_ERROR",
      details: "Failed to reach Lukittu.",
      raw: licenseCache.raw,
    };
  }
}

export async function requireValidLukittuLicense({ requestLike } = {}) {
  const cfg = getLukittuConfig();

  if (!cfg.enforce) {
    return {
      enforced: false,
      valid: true,
      code: "ENFORCEMENT_DISABLED",
      details: "License enforcement disabled.",
    };
  }

  const firstCheck = licenseCache.valid === null;
  const result = firstCheck
    ? await verifyLukittuLicense({ requestLike })
    : await heartbeatLukittuLicense({ requestLike });

  if (!result.valid) {
    const error = new Error(result.details || "Invalid license.");
    error.code = result.code || "LICENSE_INVALID";
    throw error;
  }

  return {
    enforced: true,
    valid: true,
    code: result.code || "VALID",
    details: result.details || "Valid license.",
  };
}
