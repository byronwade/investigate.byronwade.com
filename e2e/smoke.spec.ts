import { expect, test } from '@playwright/test';

test('application starts and home route renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/serious foundation/i);
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
});

test('console redirects to command center', async ({ page }) => {
  await page.goto('/console');
  await expect(page).toHaveURL(/\/console\/command-center/);
  await expect(page.getByRole('heading', { name: /Good morning/i })).toBeVisible();
});

test('console case overview remains reachable', async ({ page }) => {
  await page.goto('/console/cases/northridge/overview');
  await expect(page.getByRole('heading', { name: /Northridge/i })).toBeVisible();
});

test('console mobile navigation opens agency destinations', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/console/command-center');
  await page.getByRole('button', { name: /open navigation/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page
    .getByRole('dialog')
    .getByRole('link', { name: /^Cases$/i })
    .click();
  await expect(page).toHaveURL(/\/console\/cases$/);
  await expect(page.getByRole('heading', { name: /Cases portfolio/i })).toBeVisible();
});
