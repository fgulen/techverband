import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('no unfilled placeholders before deploy', () => {
  for (const f of ['impressum.html', 'datenschutz.html']) {
    const s = readFileSync(new URL(`../../${f}`, import.meta.url), 'utf8');
    assert.doesNotMatch(s, /⟦FEHLT/, `${f} still has placeholders`);
  }
});
