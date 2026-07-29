import { expect, test } from '@playwright/test';

test('application starts and home route renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/serious foundation/i);
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
});
