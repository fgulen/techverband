import { test, expect } from '@playwright/test';

test('footer links to the legal pages on the main site, not to the empty local stubs', async ({ page }) => {
  await page.goto('/spenden');
  const footer = page.getByRole('contentinfo');
  for (const [name, file] of [['Impressum', 'impressum'], ['Datenschutzerklärung', 'datenschutz'], ['Barrierefreiheit', 'barrierefreiheit']]) {
    await expect(footer.getByRole('link', { name })).toHaveAttribute('href', `https://weiterwert.de/${file}.html`);
  }
});
