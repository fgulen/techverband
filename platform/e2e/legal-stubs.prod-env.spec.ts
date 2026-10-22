import { test, expect } from '@playwright/test';

test('empty legal stub pages are not published in production', async ({ page }) => {
  for (const path of ['/impressum', '/datenschutz']) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(404);
  }
});
