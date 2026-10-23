import { test, expect } from '@playwright/test';

test('/admin does not exist in production', async ({ page }) => {
  const res = await page.goto('/admin');
  expect(res?.status()).toBe(404);
});

// Without the server-side key, production ends at the result and points to e-mail.
test('/spenden shows the 8 steps and four handover options on the result step, none selectable yet', async ({ page }) => {
  await page.goto('/spenden');
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Weiter', exact: true }).click();
  await page.getByText('Wie geht es nach der Vorprüfung weiter?').click();
  await expect(page.getByRole('list', { name: 'Ablauf der Spende' }).getByRole('listitem')).toHaveCount(8);
  const group = page.getByRole('group', { name: 'Übergabe' });
  for (const label of ['Übergabe nach Absprache', 'Abholung', 'Paketversand', 'Sammelstelle']) {
    await expect(group.getByLabel(label)).toBeDisabled();
  }
});

test('/spenden has no contact step while saving is not configured', async ({ page }) => {
  await page.goto('/spenden');
  await expect(page.getByText('Schritt 1 von 4')).toBeVisible();
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Weiter', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Weiter zu Kontakt' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Gerät zur Liste hinzufügen' })).toBeVisible();
});
