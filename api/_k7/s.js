import { heartbeatLukittuLicense, verifyLukittuLicense } from "../_lib/_t9.js";

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

function mapLicensePayload(raw) {
  const license = raw?.data?.license || {};
  const customers = raw?.data?.customers || [];

  return {
    status: raw?.result?.valid ? "active" : "invalid",
    customer_email: customers?.[0]?.email || null,
    expires_at: license?.expirationDate || null,
    ip_limit: license?.ipLimit ?? null,
    hwid_limit: license?.hwidLimit ?? null,
    expiration_type: license?.expirationType ?? null,
  };
}

export async function GET(request) {
  // Prefer heartbeat (cheaper intent), but fall back to verify if heartbeat fails.
  const heartbeat = await heartbeatLukittuLicense({ requestLike: { headers: request.headers } });
  const result = heartbeat.valid ? heartbeat : await verifyLukittuLicense({ requestLike: { headers: request.headers } });

  if (!result.valid) {
    return json(
      {
        licensed: false,
        valid: false,
        success: false,
        code: result.code || "LICENSE_INVALID",
        message: result.details || "License not valid.",
        license: { status: "invalid" },
      },
      { status: 403 }
    );
  }

  return json({
    licensed: true,
    valid: true,
    success: true,
    code: result.code || "VALID",
    message: result.details || "License OK.",
    license: mapLicensePayload(result.raw),
  });
}
