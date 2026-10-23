import { test, expect, type Page } from '@playwright/test';

// Test environment: requests go to the in-memory test store, never to the database.

async function weiter(page: Page) {
  await page.getByRole('button', { name: 'Weiter', exact: true }).click();
}

async function geraetErfassen(page: Page, marke: string) {
  await page.getByLabel('Marke').fill(marke);
  await weiter(page);
  await weiter(page);
  await weiter(page);
}

async function kontaktAusfuellen(page: Page) {
  await page.getByLabel('Name').fill('Erika Muster');
  await page.getByLabel('E-Mail').fill('erika@example.de');
  await page.getByLabel('Postleitzahl').fill('50667');
}

async function bisAbsenden(page: Page) {
  await page.goto('/spenden');
  await geraetErfassen(page, 'Lenovo');
  await page.getByRole('button', { name: 'Weiter zu Kontakt' }).click();
  await expect(page.getByText('Schritt 5 von 6')).toBeVisible();
  await kontaktAusfuellen(page);
  await weiter(page);
  await expect(page.getByText('Schritt 6 von 6')).toBeVisible();
}

async function erklaeren(page: Page) {
  const g = page.getByRole('group', { name: 'Erklärungen' });
  await g.getByRole('checkbox').nth(0).check();
  await g.getByRole('checkbox').nth(1).check();
}

test('a donor sends a request and gets a Vorgangsnummer', async ({ page }) => {
  await bisAbsenden(page);
  await expect(page.getByText('Erika Muster')).toBeVisible();
  await expect(page.getByText('Lenovo –')).toBeVisible();
  await erklaeren(page);
  await page.getByRole('button', { name: 'Anfrage absenden' }).click();
  await expect(page.getByRole('heading', { name: 'Vielen Dank für Ihre Spende!' })).toBeVisible();
  await expect(page.getByText(/^WW-\d{4}-\d{6}$/)).toBeVisible();
  await expect(page.getByRole('list', { name: 'Fortschritt' })).toHaveCount(0);
});

test('contact errors are shown on Weiter and the first wrong field gets focus', async ({ page }) => {
  await page.goto('/spenden');
  await geraetErfassen(page, 'Lenovo');
  await page.getByRole('button', { name: 'Weiter zu Kontakt' }).click();
  await page.getByLabel('Name').fill('Erika');
  await page.getByLabel('E-Mail').fill('erika@');
  await page.getByLabel('Postleitzahl').fill('123');
  await weiter(page);
  await expect(page.getByText('Schritt 5 von 6')).toBeVisible();
  await expect(page.getByText('Bitte geben Sie eine gültige E-Mail-Adresse an.')).toBeVisible();
  await expect(page.getByText('Bitte geben Sie eine fünfstellige Postleitzahl an.')).toBeVisible();
  await expect(page.getByLabel('E-Mail')).toBeFocused();
  await expect(page.getByLabel('E-Mail')).toHaveAttribute('aria-invalid', 'true');
});

test('both declarations are required before sending', async ({ page }) => {
  await bisAbsenden(page);
  await page.getByRole('button', { name: 'Anfrage absenden' }).click();
  await expect(page.getByText('Bitte bestätigen Sie beide Erklärungen.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Vielen Dank für Ihre Spende!' })).toHaveCount(0);
});

test('a second device can be added and both are in the summary', async ({ page }) => {
  await page.goto('/spenden');
  await geraetErfassen(page, 'Lenovo');
  await page.getByRole('button', { name: 'Weiteres Gerät erfassen' }).click();
  await expect(page.getByText('Schritt 1 von 6')).toBeVisible();
  await geraetErfassen(page, 'Apple');
  await page.getByRole('button', { name: 'Weiter zu Kontakt' }).click();
  await kontaktAusfuellen(page);
  await weiter(page);
  await expect(page.getByRole('heading', { name: 'Geräte (2)', exact: true })).toBeVisible();
});

test('going back from contact shows the list without re-adding the device', async ({ page }) => {
  await page.goto('/spenden');
  await geraetErfassen(page, 'Lenovo');
  await page.getByRole('button', { name: 'Weiter zu Kontakt' }).click();
  await page.getByRole('button', { name: 'Zurück' }).click();
  await expect(page.getByText('Schritt 4 von 6')).toBeVisible();
  await page.getByRole('button', { name: 'Weiter zu Kontakt' }).click();
  await expect(page.getByRole('list', { name: 'Ihre Geräte' }).getByRole('listitem')).toHaveCount(1);
});

test('a device rated not suitable is left out when another device is on the list', async ({ page }) => {
  await page.goto('/spenden');
  await geraetErfassen(page, 'Lenovo');
  await page.getByRole('button', { name: 'Weiteres Gerät erfassen' }).click();
  await page.getByLabel('Marke').fill('Kaputt');
  await weiter(page);
  await page.getByRole('group', { name: 'Akku' }).getByLabel('Gebläht oder beschädigt', { exact: true }).check();
  await weiter(page);
  await weiter(page);
  await expect(page.getByText('Dieses Gerät nehmen wir nicht in Ihre Anfrage auf.')).toBeVisible();
  await page.getByRole('button', { name: 'Weiter zu Kontakt' }).click();
  const list = page.getByRole('list', { name: 'Ihre Geräte' });
  await expect(list.getByRole('listitem')).toHaveCount(1);
  await expect(list).not.toContainText('Kaputt');
});

test('a lost connection keeps the answers and shows a retry message', async ({ page }) => {
  await bisAbsenden(page);
  await erklaeren(page);
  await page.route('**/spenden', (route) => (route.request().headers()['next-action'] ? route.abort() : route.continue()));
  await page.getByRole('button', { name: 'Anfrage absenden' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Bitte versuchen Sie es erneut' })).toBeVisible();
  await expect(page.getByText('Erika Muster')).toBeVisible();
  await page.unroute('**/spenden');
  await page.getByRole('button', { name: 'Anfrage absenden' }).click();
  await expect(page.getByText(/^WW-\d{4}-\d{6}$/)).toBeVisible();
});
