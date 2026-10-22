import { test, expect } from '@playwright/test';
import { SITEMAP } from '../src/lib/sitemap';

for (const p of SITEMAP.filter((x) => x.path !== '/')) {
  test(`${p.path} renders with its title`, async ({ page }) => {
    const res = await page.goto(p.path);
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(p.title);
  });
}

test('/admin is visible only as a draft in the test environment', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByText('Entwurf – nur Testumgebung')).toBeVisible();
});

test('/geraetepartnerschaft is marked as coming soon', async ({ page }) => {
  await page.goto('/geraetepartnerschaft');
  await expect(page.getByText('demnächst').first()).toBeVisible();
});

test('/spenden shows the 8 steps and four handover options, none selectable yet', async ({ page }) => {
  await page.goto('/spenden');
  await expect(page.getByRole('list', { name: 'Ablauf der Spende' }).getByRole('listitem')).toHaveCount(8);
  const group = page.getByRole('group', { name: 'Übergabe' });
  for (const label of ['Übergabe nach Absprache', 'Abholung', 'Paketversand', 'Sammelstelle']) {
    await expect(group.getByLabel(label)).toBeDisabled();
  }
});

test('/annahmekriterien shows draft criteria v0.1', async ({ page }) => {
  await page.goto('/annahmekriterien');
  await expect(page.getByText('Entwurf v0.1')).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(5);
});
