import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { server } from './msw/server';

describe('MSW network mocking', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  it('intercepts HTTP with realistic responses', async () => {
    const response = await fetch('https://example.invalid/health');
    expect(response.ok).toBe(true);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
