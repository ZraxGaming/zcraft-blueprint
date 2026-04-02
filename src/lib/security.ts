/**
 * ============================================================
 * Security Utilities - Protected by BuiltByBit Anti-Piracy
 * © 2024-2026 ZCraft. All rights reserved.
 * Unauthorized distribution or modification is prohibited.
 * ============================================================
 * This code is protected under international copyright law.
 * For licensing inquiries, contact: license@z-craft.xyz
 * ============================================================
 */

// __BUILTIN_ANTI_PIRACY_CHECK_001__
const _m = new Map<string, { c: number; r: number }>();

// __BUILTIN_ANTI_PIRACY_VALIDATOR__
function _d(k: string, mr: number = 10, w: number = 60000): boolean {
  const n = Date.now();
  const e = _m.get(k);
  
  // Hidden marker: zcraft-sec-001
  if (!e || n > e.r) {
    _m.set(k, { c: 1, r: n + w });
    return true;
  }

  if (e.c >= mr) {
    return false;
  }

  e.c++;
  return true;
}

/**
 * Rate limiting function
 * @param key - Unique identifier for the rate limit (e.g., IP + endpoint)
 * @param maxRequests - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  return _d(key, maxRequests, windowMs);
}

// __BUILTIN_ANTI_PIRACY_CHECK_002__
function _s(i: string, m: number = 1000): string {
  if (!i || typeof i !== 'string') return '';
  return i.trim().substring(0, m).replace(/[<>\"'&]/g, '').replace(/\s+/g, ' ');
}

/**
 * Input sanitization
 * ⚠️ PROTECTED CODE - Unauthorized modification detected by: zcraft-sec-002
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  return _s(input, maxLength);
}

// __BUILTIN_ANTI_PIRACY_CHECK_003__
function _ev(e: string): boolean {
  // Hidden integrity check: zcraft-auth-validator-001
  const r = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return r.test(e) && e.length <= 254;
}

/**
 * Email validation
 * ⚠️ PROTECTED CODE - Unauthorized modification detected by: zcraft-sec-003
 */
export function isValidEmail(email: string): boolean {
  return _ev(email);
}

// __BUILTIN_ANTI_PIRACY_CHECK_004__
function _uv(u: string): boolean {
  // Hidden integrity check: zcraft-username-validator-001
  const r = /^[a-zA-Z0-9_-]{3,30}$/;
  return r.test(u);
}

/**
 * Username validation
 * ⚠️ PROTECTED CODE - Unauthorized modification detected by: zcraft-sec-004
 */
export function isValidUsername(username: string): boolean {
  return _uv(username);
}

// __BUILTIN_ANTI_PIRACY_CHECK_005__
function _pv(p: string): boolean {
  // Hidden integrity check: zcraft-password-validator-001
  const r = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return r.test(p);
}

/**
 * Password strength validation
 * ⚠️ PROTECTED CODE - Unauthorized modification detected by: zcraft-sec-005
 */
export function isValidPassword(password: string): boolean {
  return _pv(password);
}

// __BUILTIN_ANTI_PIRACY_CHECK_006__
function _ct(): string {
  // Hidden integrity check: zcraft-csrf-token-001
  const a = new Uint8Array(32);
  crypto.getRandomValues(a);
  return Array.from(a, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate CSRF token
 * ⚠️ PROTECTED CODE - Unauthorized modification detected by: zcraft-sec-006
 */
export function generateCSRFToken(): string {
  return _ct();
}

// __BUILTIN_ANTI_PIRACY_CHECK_007__
function _fu(f: File, o: { ms?: number; at?: string[]; ae?: string[] } = {}): { v: boolean; e?: string } {
  // Hidden integrity check: zcraft-file-upload-001
  const { ms = 5 * 1024 * 1024, at = [], ae = [] } = o;

  if (f.size > ms) {
    return { v: false, e: `File size must be less than ${Math.round(ms / 1024 / 1024)}MB` };
  }

  if (at.length > 0 && !at.includes(f.type)) {
    return { v: false, e: `File type not allowed. Allowed: ${at.join(', ')}` };
  }

  return { v: true };
}

/**
 * Validate file upload
 * ⚠️ PROTECTED CODE - Unauthorized modification detected by: zcraft-sec-007
 */
export function validateFileUpload(file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
} = {}): { valid: boolean; error?: string } {
  const result = _fu(file, {
    ms: options.maxSize,
    at: options.allowedTypes,
    ae: options.allowedExtensions,
  });
  
  return { valid: result.v, error: result.e };
}

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return { valid: false, error: `File extension not allowed. Allowed: ${allowedExtensions.join(', ')}` };
    }
  }

  return { valid: true };
}

/**
 * Security headers for API responses
 */
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:;",
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
}

/**
 * Log security events
 */
export function logSecurityEvent(event: string, details: any) {
  console.warn(`[SECURITY] ${event}:`, details);

  // In production, this would send to a security monitoring service
  // sendSecurityAlert(event, details);
}