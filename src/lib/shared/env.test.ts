import { afterEach, describe, expect, it } from 'vitest';
import {
  emptyToUndefined,
  getPublicEnv,
  getServerEnv,
  parsePublicEnv,
  resetEnvCacheForTests,
} from './env';

describe('env', () => {
  afterEach(() => {
    resetEnvCacheForTests();
  });

  it('parses public environment defaults', () => {
    const env = getPublicEnv();
    expect(env.VITE_APP_NAME.length).toBeGreaterThan(0);
    expect(env.VITE_APP_URL).toMatch(/^https?:\/\//);
    expect(typeof env.VITE_ENABLE_ANALYTICS).toBe('boolean');
  });

  it('treats blank public env values as unset defaults', () => {
    const env = parsePublicEnv({
      VITE_APP_NAME: '',
      VITE_APP_URL: '   ',
      VITE_ENABLE_ANALYTICS: '',
    });
    expect(env.VITE_APP_NAME).toBe('Investigate');
    expect(env.VITE_APP_URL).toBe('http://localhost:3000');
    expect(env.VITE_ENABLE_ANALYTICS).toBe(false);
  });

  it('emptyToUndefined collapses blank strings', () => {
    expect(emptyToUndefined('')).toBeUndefined();
    expect(emptyToUndefined('  ')).toBeUndefined();
    expect(emptyToUndefined('Investigate')).toBe('Investigate');
  });

  it('reads server environment in node', () => {
    const env = getServerEnv();
    expect(['development', 'test', 'production']).toContain(env.NODE_ENV);
  });
});
