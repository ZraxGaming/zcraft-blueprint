# Supabase Auth Email Templates

Use these in Supabase Dashboard -> Authentication -> Email Templates.

## Confirm Signup

```html
<!DOCTYPE html>
<html>
<body style="margin:0;background:#05080d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="520" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;background:#0f141c;border:1px solid #1b2430;border-radius:18px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.35);">
          <tr><td style="height:4px;background:#22d3ee;"></td></tr>
          <tr><td align="center" style="padding:22px 28px 10px;">
            <img src="https://www.z-craft.xyz/favicon.ico" width="44" height="44" alt="ZCraft" style="display:block;border:0;" />
          </td></tr>
          <tr><td align="center" style="padding:0 28px 6px;">
            <div style="display:inline-block;padding:6px 10px;border-radius:999px;background:rgba(34,211,238,0.10);color:#22d3ee;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
              Account Setup
            </div>
          </td></tr>
          <tr><td align="center" style="padding:6px 28px 0;">
            <h2 style="margin:0;color:#f3f7fb;font-size:28px;line-height:1.2;font-weight:700;">
              Confirm your account
            </h2>
          </td></tr>
          <tr><td align="center" style="padding:14px 36px 0;">
            <p style="margin:0;color:#97a2b3;font-size:15px;line-height:1.7;">
              Activate your Z-Craft account to continue into the network, site features, and account tools.
            </p>
          </td></tr>
          <tr><td align="center" style="padding:20px 28px 0;">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#f3f7fb;color:#081018;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">
              Confirm Account
            </a>
          </td></tr>
          <tr><td style="padding:28px 28px 0;">
            <div style="background:#0a0f16;border:1px solid #1c2633;border-radius:14px;padding:18px;">
              <p style="margin:0;color:#d7deea;font-size:14px;line-height:1.75;">
                If you did not create this account, you can safely ignore this email.
              </p>
            </div>
          </td></tr>
          <tr><td style="padding:24px 28px 28px;">
            <div style="height:1px;background:#1d2735;"></div>
            <p style="margin:14px 0 0;color:#6f7c90;font-size:12px;text-align:center;">
              Z-Craft • Secure authentication
            </p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## Reset Password

```html
<!DOCTYPE html>
<html>
<body style="margin:0;background:#05080d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="520" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;background:#0f141c;border:1px solid #1b2430;border-radius:18px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.35);">
          <tr><td style="height:4px;background:#f59e0b;"></td></tr>
          <tr><td align="center" style="padding:22px 28px 10px;">
            <img src="https://www.z-craft.xyz/favicon.ico" width="44" height="44" alt="ZCraft" style="display:block;border:0;" />
          </td></tr>
          <tr><td align="center" style="padding:0 28px 6px;">
            <div style="display:inline-block;padding:6px 10px;border-radius:999px;background:rgba(245,158,11,0.10);color:#f59e0b;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
              Security
            </div>
          </td></tr>
          <tr><td align="center" style="padding:6px 28px 0;">
            <h2 style="margin:0;color:#f3f7fb;font-size:28px;line-height:1.2;font-weight:700;">
              Reset your password
            </h2>
          </td></tr>
          <tr><td align="center" style="padding:14px 36px 0;">
            <p style="margin:0;color:#97a2b3;font-size:15px;line-height:1.7;">
              We received a request to reset your Z-Craft account password.
            </p>
          </td></tr>
          <tr><td align="center" style="padding:20px 28px 0;">
            <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#f3f7fb;color:#081018;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px;">
              Reset Password
            </a>
          </td></tr>
          <tr><td style="padding:28px 28px 0;">
            <div style="background:#0a0f16;border:1px solid #1c2633;border-radius:14px;padding:18px;">
              <p style="margin:0;color:#d7deea;font-size:14px;line-height:1.75;">
                If you did not request this, ignore the email and your password will remain unchanged.
              </p>
            </div>
          </td></tr>
          <tr><td style="padding:24px 28px 28px;">
            <div style="height:1px;background:#1d2735;"></div>
            <p style="margin:14px 0 0;color:#6f7c90;font-size:12px;text-align:center;">
              Z-Craft • Account recovery
            </p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```
