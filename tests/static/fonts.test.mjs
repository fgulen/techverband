import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

test('no requests to Google Fonts', () => {
  assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/);
});

test('Inter is self-hosted for latin and latin-ext (Turkish) in all weights', () => {
  for (const sub of ['latin', 'latin-ext']) {
    for (const w of [400, 500, 600, 700, 800]) {
      const f = `assets/fonts/inter-${sub}-${w}.woff2`;
      assert.ok(existsSync(new URL(`../../${f}`, import.meta.url)), `${f} missing`);
      assert.ok(html.includes(f), `${f} not referenced`);
    }
  }
});
