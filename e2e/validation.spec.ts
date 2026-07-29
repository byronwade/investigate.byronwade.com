import { expect, test } from '@playwright/test';

test('feedback validation errors are announced', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Submit feedback' }).click();
  await expect(page.getByRole('alert').first()).toBeVisible();
});
