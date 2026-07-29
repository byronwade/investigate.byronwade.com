import { afterEach, describe, expect, it, vi } from 'vitest';
import { getPublicEnv, getServerEnv, resetEnvCacheForTests } from './env';

describe('env', () => {
  afterEach(() => {
    resetEnvCacheForTests();
    vi.unstubAllEnvs();
  });

  it('parses public environment defaults', () => {
    const env = getPublicEnv();
    expect(env.VITE_APP_NAME.length).toBeGreaterThan(0);
    expect(env.VITE_APP_URL).toMatch(/^https?:\/\//);
    expect(typeof env.VITE_ENABLE_ANALYTICS).toBe('boolean');
  });

  it('reads server environment in node', () => {
    const env = getServerEnv();
    expect(['development', 'test', 'production']).toContain(env.NODE_ENV);
  });
});
