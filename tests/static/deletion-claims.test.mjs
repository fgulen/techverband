import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

// Spec: no unproven deletion promises until a documented erasure procedure exists (Faz 3).
test('no unproven data-deletion promises (DE+TR)', () => {
  assert.doesNotMatch(html, /unwiederbringlich/);
  assert.doesNotMatch(html, /dokumentieren die Löschung für jedes Gerät/);
  assert.doesNotMatch(html, /nach einem dokumentierten Verfahren/);
  assert.doesNotMatch(html, /geri dönüşü mümkün olmayacak/);
  assert.doesNotMatch(html, /belgelenmiş bir yöntemle siliyoruz/);
});
