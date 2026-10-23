import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

// We accept laptops and tablets only; the donation page rejects phones.
test('no device list promises phones (DE+TR)', () => {
  assert.doesNotMatch(html, /Telefone|Telefon —|Smartphone|Handy/);
  assert.doesNotMatch(html, /telefonları|telefonunu/);
});
