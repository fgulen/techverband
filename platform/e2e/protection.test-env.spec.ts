import { test, expect } from '@playwright/test';

test('without credentials the test site answers 401', async ({ baseURL }) => {
  // Plain fetch: Playwright's request contexts would inherit the project's httpCredentials.
  const res = await fetch(`${baseURL}/`);
  expect(res.status).toBe(401);
  expect(res.headers.get('www-authenticate')).toContain('Basic');
});

test('with credentials: banner, noindex header and robots disallow', async ({ page, request }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  expect(res?.headers()['x-robots-tag']).toContain('noindex');
  await expect(page.getByRole('status')).toHaveText('Testumgebung – keine echten Spenden');
  const robots = await request.get('/robots.txt');
  expect(await robots.text()).toMatch(/Disallow: \//);
});
