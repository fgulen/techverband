import { test, expect, type Page } from '@playwright/test';

async function choose(page: Page, group: string, option: string) {
  await page.getByRole('group', { name: group }).getByLabel(option, { exact: true }).check();
}

test('a recent working laptop is provisionally suitable', async ({ page }) => {
  await page.goto('/spenden');
  await choose(page, 'Gerätetyp', 'Laptop (Windows/Linux)');
  await page.getByLabel('Marke').fill('Lenovo');
  await choose(page, 'Ungefähres Alter', 'bis 3 Jahre');
  await choose(page, 'Startet das Gerät?', 'Ja');
  await choose(page, 'Display', 'In Ordnung');
  await choose(page, 'Akku', 'In Ordnung');
  await choose(page, 'Konten und Sperren', 'Alles entfernt');
  await choose(page, 'Gehört das Gerät Ihnen?', 'Ja, es gehört mir');
  await expect(page.getByRole('status', { name: 'Vorprüfung' })).toContainText('Vorläufig geeignet');
});

test('a swollen battery is flagged as not suitable with a safety note', async ({ page }) => {
  await page.goto('/spenden');
  await choose(page, 'Akku', 'Gebläht oder beschädigt');
  const status = page.getByRole('status', { name: 'Vorprüfung' });
  await expect(status).toContainText('voraussichtlich nicht geeignet');
  await expect(status).toContainText('nicht versenden');
});

test('unknown answers ask for details but never block', async ({ page }) => {
  await page.goto('/spenden');
  await expect(page.getByRole('status', { name: 'Vorprüfung' })).toContainText('Weitere Angaben erforderlich');
  await expect(page.getByRole('button', { name: 'Gerät zur Liste hinzufügen' })).toBeEnabled();
});

test('several devices can be collected in one request', async ({ page }) => {
  await page.goto('/spenden');
  await page.getByLabel('Marke').fill('Lenovo');
  await page.getByRole('button', { name: 'Gerät zur Liste hinzufügen' }).click();
  await page.getByLabel('Marke').fill('Apple');
  await page.getByRole('button', { name: 'Gerät zur Liste hinzufügen' }).click();
  const list = page.getByRole('list', { name: 'Ihre Geräte' });
  await expect(list.getByRole('listitem')).toHaveCount(2);
  await expect(list).toContainText('Lenovo');
  await expect(list).toContainText('Apple');
});
