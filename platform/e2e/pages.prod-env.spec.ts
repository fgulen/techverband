import { test, expect } from '@playwright/test';

test('/admin does not exist in production', async ({ page }) => {
  const res = await page.goto('/admin');
  expect(res?.status()).toBe(404);
});
