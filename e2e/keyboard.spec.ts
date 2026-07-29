import { expect, test } from '@playwright/test';

test('keyboard navigation reaches primary controls', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();

  // From main, sequential focus continues into page content.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Explore foundation' })).toBeFocused();

  // Header controls remain reachable when tabbing from the document start.
  await page.getByRole('link', { name: 'Skip to content' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Investigate' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Home' }),
  ).toBeFocused();
});
