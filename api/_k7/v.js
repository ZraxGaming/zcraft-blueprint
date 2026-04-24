import { verifyLukittuLicense } from "../_lib/_t9.js";

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

  const expirationDate = license?.expirationDate || null;
  const email = customers?.[0]?.email || null;

  return {
    status: "active",
    customer_email: email,
    expires_at: expirationDate,
    ip_limit: license?.ipLimit ?? null,
    hwid_limit: license?.hwidLimit ?? null,
    expiration_type: license?.expirationType ?? null,
    expiration_start: license?.expirationStart ?? null,
    expiration_days: license?.expirationDays ?? null,
  };
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const licenseKey = body?.license_key || body?.licenseKey || undefined;

  const result = await verifyLukittuLicense({
    licenseKey,
    requestLike: { headers: request.headers },
    force: Boolean(body?.force),
  });

  if (!result.valid) {
    return json(
      {
        valid: false,
        success: false,
        licensed: false,
        code: result.code || "LICENSE_INVALID",
        message: result.details || "Invalid license.",
        license: { status: "invalid" },
      },
      { status: 403 }
    );
  }

  return json({
    valid: true,
    success: true,
    licensed: true,
    code: result.code || "VALID",
    message: result.details || "License verified.",
    license: mapLicensePayload(result.raw),
    activation_count: null,
    max_activations: null,
  });
}
