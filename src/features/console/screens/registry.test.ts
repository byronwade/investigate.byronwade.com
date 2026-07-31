import { describe, expect, it } from 'vitest';
import { consoleScreenSlugs, consoleScreens, getConsoleScreen } from './registry';

describe('consoleScreens registry', () => {
  it('lists 40 Investigation Console desk screens', () => {
    expect(consoleScreens).toHaveLength(40);
    expect(consoleScreenSlugs).toHaveLength(40);
  });

  it('uses unique slugs', () => {
    expect(new Set(consoleScreenSlugs).size).toBe(consoleScreenSlugs.length);
  });

  it('resolves case overview by slug', () => {
    expect(getConsoleScreen('case-overview')?.paperId).toBe('1-0');
  });
});
