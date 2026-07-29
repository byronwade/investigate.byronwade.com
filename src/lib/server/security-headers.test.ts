import { describe, expect, it } from 'vitest';
import { getSecurityHeaders } from './security-headers';

describe('getSecurityHeaders', () => {
  it('includes HSTS only in production', () => {
    expect(getSecurityHeaders(false)['Strict-Transport-Security']).toBeUndefined();
    expect(getSecurityHeaders(true)['Strict-Transport-Security']).toContain('max-age=');
  });

  it('always sets frame and MIME protections', () => {
    const headers = getSecurityHeaders(true);
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['Content-Security-Policy']).toContain("frame-ancestors 'none'");
  });
});
