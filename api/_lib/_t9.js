import crypto from "crypto";
import os from "os";

/**
 * Lukittu license client.
 * Docs: https://docs.lukittu.com/api-reference/client--verify/verify-license
 *
 * Endpoint:
 *   POST https://app.lukittu.com/api/v1/client/teams/{teamId}/verification/verify
 *
 * Body (per docs):
 *   {
 *     licenseKey: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX",
 *     challenge: "<random hex>",
 *     version?: string,
 *     branch?: string,
 *     hardwareIdentifier?: string,
 *     productId?: uuid,
 *     customerId?: uuid,
 *   }
 */

const TEAM_ID =
  String(process.env.LUKITTU_TEAM_ID || "58a3c98f-a498-4404-b19c-eac3d9afe6d3").trim();

// Cached results to avoid hammering Lukittu.
const cache = {
  verify: { result: null, expiresAt: 0 },
  heartbeat: { result: null, expiresAt: 0 },
};

const now = () => Date.now();
const getEnv = (key, fallback = "") => String(process.env[key] ?? fallback).trim();

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
      getEnv("LUKITTU_VERSION") || getEnv("VERCEL_GIT_COMMIT_SHA") || "dev",
    branch:
      getEnv("LUKITTU_BRANCH").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 255) ||
      "production",
    hardwareIdentifier: getEnv("LUKITTU_HARDWARE_IDENTIFIER"),
  };
}

function getHardwareId(cfg) {
  if (cfg.hardwareIdentifier) return cfg.hardwareIdentifier;
  const seed = [
    os.hostname(),
    os.platform(),
    os.arch(),
    os.cpus()?.[0]?.model || "",
    process.env.VERCEL_URL || "",
  ].join("|");
  return crypto.createHash("sha256").update(seed).digest("hex");
}

function buildPayload(cfg, overrideKey) {
  const payload = {
    licenseKey: overrideKey || cfg.licenseKey,
    challenge: crypto.randomBytes(16).toString("hex"),
    version: cfg.version,
    branch: cfg.branch,
    hardwareIdentifier: getHardwareId(cfg),
  };
  if (cfg.productId) payload.productId = cfg.productId;
  if (cfg.customerId) payload.customerId = cfg.customerId;
  return payload;
}

function normalize(json, ok) {
  return {
    ok,
    valid: json?.result?.valid === true,
    code: json?.result?.code || (ok ? "UNKNOWN" : "HTTP_ERROR"),
    details: json?.result?.details || json?.message || "",
    raw: json,
  };
}

async function callLukittu(endpoint, payload) {
  const url = `https://app.lukittu.com/api/v1/client/teams/${TEAM_ID}${endpoint}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (process.env.LUKITTU_DEBUG === "true") {
      console.log("[lukittu]", endpoint, res.status, JSON.stringify(json));
    }
    return normalize(json, res.ok);
  } catch (err) {
    if (process.env.LUKITTU_DEBUG === "true") {
      console.error("[lukittu] network error", endpoint, err);
    }
    return {
      ok: false,
      valid: false,
      code: "NETWORK_ERROR",
      details: err?.message || "Network error contacting license server",
      raw: null,
    };
  }
}

/**
 * Verify a license against Lukittu.
 * @param {object} opts
 * @param {string} [opts.licenseKey] override env license key
 * @param {boolean} [opts.force] bypass cache
 */
export async function verifyLukittuLicense(opts = {}) {
  const cfg = getConfig();
  const key = (opts.licenseKey || cfg.licenseKey || "").trim();

  if (!key) {
    return {
      ok: false,
      valid: false,
      code: "CONFIG_MISSING",
      details: "No license key configured on the server.",
      raw: null,
    };
  }

  if (!opts.force && cache.verify.result && now() < cache.verify.expiresAt) {
    return cache.verify.result;
  }

  const result = await callLukittu("/verification/verify", buildPayload(cfg, key));
  cache.verify.result = result;
  cache.verify.expiresAt = now() + (result.valid ? 15 * 60 * 1000 : 60 * 1000);
  return result;
}

export async function heartbeatLukittuLicense(opts = {}) {
  const cfg = getConfig();
  const key = (opts.licenseKey || cfg.licenseKey || "").trim();

  if (!key) {
    return {
      ok: false,
      valid: false,
      code: "CONFIG_MISSING",
      details: "No license key configured on the server.",
      raw: null,
    };
  }

  if (!opts.force && cache.heartbeat.result && now() < cache.heartbeat.expiresAt) {
    return cache.heartbeat.result;
  }

  // Lukittu uses the same verify endpoint as the canonical check; we keep a
  // separate cache window so periodic pulses don't invalidate the verify cache.
  const result = await callLukittu("/verification/verify", buildPayload(cfg, key));
  cache.heartbeat.result = result;
  cache.heartbeat.expiresAt = now() + (result.valid ? 25 * 60 * 1000 : 60 * 1000);
  return result;
}

/**
 * Throws a tagged Error if the license is not valid.
 * Honors `LUKITTU_ENFORCE=false` to bypass entirely.
 */
export async function requireValidLukittuLicense(opts = {}) {
  const cfg = getConfig();
  if (cfg.enforce === "false") {
    return { valid: true, bypass: true, code: "BYPASS", details: "Enforcement disabled" };
  }

  const result = await verifyLukittuLicense(opts);
  if (!result.valid) {
    const err = new Error(result.details || "Invalid license");
    err.code = result.code || "LICENSE_INVALID";
    err.details = result.details;
    err.raw = result.raw;
    throw err;
  }
  return result;
}

// Back-compat alias used by older callers.
export const requireLicense = requireValidLukittuLicense;