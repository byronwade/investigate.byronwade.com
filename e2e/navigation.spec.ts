import { expect, test } from '@playwright/test';

test('primary navigation reaches foundation route', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Primary' })
    .getByRole('link', { name: 'Foundation' })
    .click();
  await expect(page).toHaveURL(/\/foundation$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Platform foundation/i);
});

test('unknown routes show not-found content', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Page not found/i);
  await expect(page.getByRole('link', { name: /Return home/i })).toBeVisible();
});
