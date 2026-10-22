import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

test('motto is the hero headline and page title (DE)', () => {
  assert.match(html, /<h1 data-i18n="heroH1">Technik weitergeben\. Chancen eröffnen\.<\/h1>/);
  assert.match(html, /<title>WeiterWert — Technik weitergeben\. Chancen eröffnen\.<\/title>/);
  assert.match(html, /heroH1: "Technik weitergeben\. Chancen eröffnen\."/);
});
