import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Lists the legal fields still marked "wird ausgefüllt". Fails until all are filled in.
test('no open legal fields', () => {
  const open = [];
  for (const f of ['impressum.html', 'datenschutz.html', 'barrierefreiheit.html']) {
    const s = readFileSync(new URL(`../../${f}`, import.meta.url), 'utf8');
    for (const m of s.matchAll(/<span class="tbd">([^<]*)<\/span>/g)) open.push(`${f}: ${m[1]}`);
  }
  assert.deepEqual(open, [], `open fields:\n${open.join('\n')}`);
});
