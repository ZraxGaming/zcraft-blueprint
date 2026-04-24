import crypto from "crypto";
import os from "os";

const TEAM_ID = "58a3c98f-a498-4404-b19c-eac3d9afe6d3";

const cache = {
  valid: null,
  nextCheck: 0,
  data: null,
};

const now = () => Date.now();

const getEnv = (key, fallback = "") =>
  String(process.env[key] ?? fallback).trim();

function getConfig() {
  const licenseKey =
    getEnv("Licesnse_Key") ||
    getEnv("LICENSE_KEY") ||
    getEnv("LUKITTU_LICENSE_KEY");

  return {
    enforce:
      getEnv("LUKITTU_ENFORCE") ||
      (process.env.NODE_ENV === "production" ? "true" : "false"),

    licenseKey,
    productId: getEnv("LUKITTU_PRODUCT_ID"),
    customerId: getEnv("LUKITTU_CUSTOMER_ID"),

    version:
      getEnv("LUKITTU_VERSION") ||
      getEnv("VERCEL_GIT_COMMIT_SHA") ||
      "dev",

    branch:
      getEnv("LUKITTU_BRANCH")
        .replace(/[^a-zA-Z0-9_-]/g, "-")
        .slice(0, 255) || "production",

    hardwareIdentifier: getEnv("LUKITTU_HARDWARE_IDENTIFIER"),
  };
}

function getHardwareId() {
  const cfg = getConfig();
  if (cfg.hardwareIdentifier) return cfg.hardwareIdentifier;

  const seed = [
    os.hostname(),
    os.platform(),
    os.arch(),
    os.cpus()?.[0]?.model || "",
  ].join("|");

  return crypto.createHash("sha256").update(seed).digest("hex");
}

function buildPayload(cfg) {
  const payload = {
    licenseKey: cfg.licenseKey,
    challenge: crypto.randomBytes(16).toString("hex"),
    version: cfg.version,
    branch: cfg.branch,
    hardwareIdentifier: getHardwareId(),
  };

  if (cfg.productId) payload.productId = cfg.productId;
  if (cfg.customerId) payload.customerId = cfg.customerId;

  return payload;
}

async function request(endpoint, payload) {
  const res = await fetch(
    `https://app.lukittu.com/api/v1/client/teams/${TEAM_ID}${endpoint}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  const json = await res.json().catch(() => ({}));

  return {
    ok: res.ok,
    valid: json?.result?.valid === true,
    code: json?.result?.code || "UNKNOWN",
    details: json?.result?.details || "",
    raw: json,
  };
}

async function verify(force = false) {
  const cfg = getConfig();

  if (!cfg.licenseKey) {
    return {
      valid: false,
      code: "NO_LICENSE",
      details: "Missing license key",
    };
  }

  if (!force && cache.valid !== null && now() < cache.nextCheck) {
    return cache.data;
  }

  try {
    const result = await request(
      "/verification/verify",
      buildPayload(cfg)
    );

    cache.valid = result.valid;
    cache.data = result;
    cache.nextCheck =
      now() + (result.valid ? 15 * 60 * 1000 : 60 * 1000);

    return result;
  } catch (e) {
    return {
      valid: false,
      code: "NETWORK_ERROR",
      details: e.message,
    };
  }
}

async function heartbeat() {
  const cfg = getConfig();

  try {
    const result = await request(
      "/verification/heartbeat",
      buildPayload(cfg)
    );

    cache.valid = result.valid;
    cache.data = result;
    cache.nextCheck =
      now() + (result.valid ? 25 * 60 * 1000 : 60 * 1000);

    return result;
  } catch (e) {
    return {
      valid: false,
      code: "NETWORK_ERROR",
      details: e.message,
    };
  }
}

export async function requireLicense() {
  const cfg = getConfig();

  if (cfg.enforce === "false") {
    return { valid: true, bypass: true };
  }

  const first = cache.valid === null;

  const result = first ? await verify() : await heartbeat();

  if (!result.valid) {
    const err = new Error(result.details || "Invalid license");
    err.code = result.code;
    throw err;
  }

  return result;
}