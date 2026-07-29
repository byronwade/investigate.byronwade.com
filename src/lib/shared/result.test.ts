import { describe, expect, it } from 'vitest';
import { err, ok } from './result';

describe('result', () => {
  it('creates ok and err variants', () => {
    expect(ok(1)).toEqual({ ok: true, value: 1 });
    expect(err('nope')).toEqual({ ok: false, error: 'nope' });
  });
});
