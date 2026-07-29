import { describe, expect, it } from 'vitest';
import { createQueryClient } from './query-client';

describe('createQueryClient', () => {
  it('creates a query client with sensible defaults', () => {
    const client = createQueryClient();
    expect(client.getDefaultOptions().queries?.staleTime).toBe(30_000);
    expect(client.getDefaultOptions().queries?.retry).toBe(1);
  });
});
