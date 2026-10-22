import { test, expect } from '@playwright/test';

test('home page renders in German', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page).toHaveTitle(/WeiterWert/);
});
