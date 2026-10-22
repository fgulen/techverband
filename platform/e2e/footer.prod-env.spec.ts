import { test, expect } from '@playwright/test';

test('footer says legal pages follow and does not link to empty stubs', async ({ page }) => {
  await page.goto('/spenden');
  const footer = page.getByRole('contentinfo');
  await expect(footer).toContainText('Impressum und Datenschutz folgen.');
  await expect(footer.getByRole('link', { name: 'Impressum' })).toHaveCount(0);
});
