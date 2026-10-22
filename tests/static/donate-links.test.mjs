import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
const URL_SPENDEN = 'https://spenden.weiterwert.de/spenden';

test('every donate button opens the online donation page', () => {
  for (const key of ['navCta', 'heroCtaPrimary', 'path1Btn']) {
    const m = html.match(new RegExp(`<a href="([^"]+)"[^>]*data-i18n="${key}"`));
    assert.ok(m, `${key} link missing`);
    assert.equal(m[1], URL_SPENDEN, key);
  }
});

test('donate button is not rewritten as a mail link by the language switch', () => {
  assert.doesNotMatch(html, /data-i18n="path1Btn" data-i18n-subject/);
});
