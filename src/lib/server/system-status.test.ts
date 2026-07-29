import { afterEach, describe, expect, it } from 'vitest';
import { resetEnvCacheForTests } from '#/lib/shared/env';
import { getSystemStatus } from './system-status';

describe('getSystemStatus', () => {
  afterEach(() => {
    resetEnvCacheForTests();
  });

  it('returns a healthy status payload', () => {
    const status = getSystemStatus('Investigate');
    expect(status.ok).toBe(true);
    expect(status.app).toBe('Investigate');
    expect(status.nodeVersion).toBeTruthy();
    expect(Number.isNaN(Date.parse(status.timestamp))).toBe(false);
  });
});
