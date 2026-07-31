import { expect, test } from '@playwright/test';

test('application starts and home route renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/serious foundation/i);
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
});

test('console redirects to case overview', async ({ page }) => {
  await page.goto('/console');
  await expect(page).toHaveURL(/\/console\/cases\/northridge\/overview/);
  await expect(page.getByRole('heading', { name: /Northridge/i })).toBeVisible();
});
