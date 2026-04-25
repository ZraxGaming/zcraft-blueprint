import { verifyLukittuLicense } from "../_lib/_t9.js";

/**
 * POST /api/license/verify
 *
 * Body (all optional — server falls back to env-configured key):
 *   { license_key?: string, device_identifier?: string, force?: boolean }
 *
 * Calls Lukittu:
 *   POST https://app.lukittu.com/api/v1/client/teams/{teamId}/verification/verify
 *
 * Response shape (frontend-friendly):
 *   {
 *     valid: boolean,
 *     success: boolean,
 *     licensed: boolean,
 *     code: string,
 *     message: string,
 *     license: { status, customer_email, expires_at, ip_limit, hwid_limit, ... }
 *   }
 */
export default async function handler(req, res) {
  // Vercel Node runtime — accept POST primarily, allow GET for heartbeat probes.
  if (req.method !== "POST" && req.method !== "GET") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({
      valid: false,
      success: false,
      licensed: false,
      code: "METHOD_NOT_ALLOWED",
      message: "Use POST to verify a license.",
    });
  }

  try {
    const body =
      typeof req.body === "string"
        ? safeJson(req.body)
        : req.body || {};

    const result = await verifyLukittuLicense({
      licenseKey: body.license_key || body.licenseKey,
      force: Boolean(body.force),
    });

    if (!result.valid) {
      return res.status(200).json({
        valid: false,
        success: false,
        licensed: false,
        code: result.code || "LICENSE_INVALID",
        message: result.details || "Invalid license.",
        license: { status: "invalid" },
      });
    }

    const license = result.raw?.data?.license || {};
    const customers = result.raw?.data?.customers || [];

    return res.status(200).json({
      valid: true,
      success: true,
      licensed: true,
      code: result.code || "VALID",
      message: result.details || "License verified.",
      license: {
        status: "active",
        customer_email: customers?.[0]?.email ?? null,
        expires_at: license?.expirationDate ?? null,
        ip_limit: license?.ipLimit ?? null,
        hwid_limit: license?.hwidLimit ?? null,
        expiration_type: license?.expirationType ?? null,
        expiration_start: license?.expirationStart ?? null,
        expiration_days: license?.expirationDays ?? null,
      },
      activation_count: null,
      max_activations: license?.hwidLimit ?? null,
    });
  } catch (err) {
    console.error("[/api/license/verify] error:", err);
    return res.status(200).json({
      valid: false,
      success: false,
      licensed: false,
      code: "LICENSE_SERVER_ERROR",
      message: err?.message || "License server error.",
    });
  }
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
