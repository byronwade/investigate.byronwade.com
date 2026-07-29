/**
 * Security header helpers for TanStack Start / Nitro responses.
 * Keep CSP pragmatic: avoid breaking Vite HMR in development.
 */

export type SecurityHeaderMap = Record<string, string>;

export function getSecurityHeaders(isProduction: boolean): SecurityHeaderMap {
  const scriptSrc = isProduction
    ? "script-src 'self'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

  const connectSrc = isProduction ? "connect-src 'self'" : "connect-src 'self' ws: wss:";

  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      scriptSrc,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob:",
      connectSrc,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
    ].join('; '),
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    ...(isProduction
      ? {
          'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        }
      : {}),
  };
}
