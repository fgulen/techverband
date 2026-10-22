import { test, expect } from '@playwright/test';

test('production build has no test banner and no auth wall', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await expect(page.getByText('Testumgebung – keine echten Spenden')).toHaveCount(0);
});
