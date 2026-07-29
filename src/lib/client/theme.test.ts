import { describe, expect, it } from 'vitest';
import { isTheme, toggleTheme } from './theme';

describe('theme helpers', () => {
  it('validates theme values', () => {
    expect(isTheme('light')).toBe(true);
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('system')).toBe(false);
  });

  it('toggles theme', () => {
    expect(toggleTheme('light')).toBe('dark');
    expect(toggleTheme('dark')).toBe('light');
  });
});
