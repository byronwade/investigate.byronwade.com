import { describe, expect, it } from 'vitest';
import { validateFeedback } from './feedback';

describe('validateFeedback', () => {
  it('accepts valid input', () => {
    const result = validateFeedback({
      name: 'Ada',
      message: 'This foundation looks solid.',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Ada');
    }
  });

  it('returns field errors for short values', () => {
    const result = validateFeedback({ name: 'A', message: 'Too short' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.fieldErrors.name).toBeTruthy();
      expect(result.fieldErrors.message).toBeTruthy();
    }
  });
});
