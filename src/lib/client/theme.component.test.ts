/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { applyTheme, getPreferredTheme, THEME_STORAGE_KEY } from './theme';

describe('theme DOM helpers', () => {
  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('reads stored theme preference', () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(getPreferredTheme()).toBe('dark');
  });

  it('applies theme to the document element', () => {
    applyTheme('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });
});
