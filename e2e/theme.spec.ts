import { expect, test } from '@playwright/test';

test('theme toggle updates document theme', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: /Switch to dark theme|Switch to light theme/i });
  await expect(toggle).toBeVisible();

  const before = await page.locator('html').getAttribute('data-theme');
  await toggle.click();
  const after = await page.locator('html').getAttribute('data-theme');
  expect(after).not.toEqual(before);
});
