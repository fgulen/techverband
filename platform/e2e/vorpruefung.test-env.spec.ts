import { test, expect, type Page } from '@playwright/test';

async function choose(page: Page, group: string, option: string) {
  await page.getByRole('group', { name: group }).getByLabel(option, { exact: true }).check();
}

async function weiter(page: Page) {
  await page.getByRole('button', { name: 'Weiter', exact: true }).click();
}

const status = (page: Page) => page.getByRole('status', { name: 'Vorprüfung' });
const zuKontakt = (page: Page) => page.getByRole('button', { name: 'Weiter zu Kontakt' });

test('the stepper shows six steps and where the user is', async ({ page }) => {
  await page.goto('/spenden');
  const progress = page.getByRole('list', { name: 'Fortschritt' });
  await expect(progress.getByRole('listitem')).toHaveCount(6);
  await expect(page.getByText('Schritt 1 von 6')).toBeVisible();
  await expect(progress.locator('[aria-current="step"]')).toContainText('Gerät');
  await weiter(page);
  await expect(page.getByText('Schritt 2 von 6')).toBeVisible();
  await expect(progress.locator('[aria-current="step"]')).toContainText('Zustand');
  await page.getByRole('button', { name: 'Zurück' }).click();
  await expect(page.getByText('Schritt 1 von 6')).toBeVisible();
});

test('a recent working laptop is provisionally suitable', async ({ page }) => {
  await page.goto('/spenden');
  await choose(page, 'Was möchten Sie spenden?', 'Laptop');
  await choose(page, 'Gerätetyp', 'Laptop (Windows/Linux)');
  await page.getByLabel('Marke').fill('Lenovo');
  await weiter(page);
  await choose(page, 'Ungefähres Alter', 'bis 3 Jahre');
  await choose(page, 'Startet das Gerät?', 'Ja');
  await choose(page, 'Display', 'In Ordnung');
  await choose(page, 'Akku', 'In Ordnung');
  await weiter(page);
  await choose(page, 'Konten und Sperren', 'Alles entfernt');
  await choose(page, 'Gehört das Gerät Ihnen?', 'Ja, es gehört mir');
  await weiter(page);
  await expect(page.getByText('Schritt 4 von 6')).toBeVisible();
  await expect(status(page)).toContainText('Vorläufig geeignet');
});

test('the tablet toggle shows only tablet types and no memory question', async ({ page }) => {
  await page.goto('/spenden');
  await choose(page, 'Was möchten Sie spenden?', 'Tablet');
  const typ = page.getByRole('group', { name: 'Gerätetyp' });
  await expect(typ.getByLabel('iPad', { exact: true })).toBeVisible();
  await expect(typ.getByLabel('Android-Tablet', { exact: true })).toBeVisible();
  await expect(typ.getByLabel('MacBook', { exact: true })).toHaveCount(0);
  await expect(typ.getByLabel('Chromebook', { exact: true })).toHaveCount(0);
  await weiter(page);
  await expect(page.getByRole('group', { name: 'Arbeitsspeicher (optional)' })).toHaveCount(0);
});

test('switching to tablet drops laptop-only answers', async ({ page }) => {
  await page.goto('/spenden');
  await choose(page, 'Gerätetyp', 'Chromebook');
  await weiter(page);
  await choose(page, 'Ungefähres Alter', '7 bis 9 Jahre');
  await choose(page, 'Arbeitsspeicher (optional)', '4 GB');
  await page.getByRole('button', { name: 'Zurück' }).click();
  await choose(page, 'Was möchten Sie spenden?', 'Tablet');
  await weiter(page);
  await weiter(page);
  await weiter(page);
  await expect(status(page)).not.toContainText('Chromebook');
  await expect(status(page)).not.toContainText('Arbeitsspeicher');
  await expect(status(page)).toContainText('Ältere Geräte prüfen wir einzeln');
});

test('a swollen battery is flagged right away with a safety note', async ({ page }) => {
  await page.goto('/spenden');
  await weiter(page);
  await choose(page, 'Akku', 'Gebläht oder beschädigt');
  await expect(page.getByText('Schritt 2 von 6')).toBeVisible();
  await expect(status(page)).toContainText('voraussichtlich nicht geeignet');
  await expect(status(page)).toContainText('nicht versenden');
});

test('unknown answers ask for details but never block', async ({ page }) => {
  await page.goto('/spenden');
  await weiter(page);
  await weiter(page);
  await weiter(page);
  await expect(status(page)).toContainText('Weitere Angaben erforderlich');
  await expect(zuKontakt(page)).toBeEnabled();
});

test('several devices can be collected in one request', async ({ page }) => {
  await page.goto('/spenden');
  for (const marke of ['Lenovo', 'Apple']) {
    await page.getByLabel('Marke').fill(marke);
    await weiter(page);
    await weiter(page);
    await weiter(page);
    await page.getByRole('button', { name: 'Weiteres Gerät erfassen' }).click();
    await expect(page.getByText('Schritt 1 von 6')).toBeVisible();
  }
  const list = page.getByRole('list', { name: 'Ihre Geräte' });
  await expect(list.getByRole('listitem')).toHaveCount(2);
  await expect(list).toContainText('Lenovo');
  await expect(list).toContainText('Apple');
});

test('a device rated not suitable alone cannot lead to the contact step', async ({ page }) => {
  await page.goto('/spenden');
  await weiter(page);
  await choose(page, 'Akku', 'Gebläht oder beschädigt');
  await weiter(page);
  await weiter(page);
  await expect(zuKontakt(page)).toBeDisabled();
});
