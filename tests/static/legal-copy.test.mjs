import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

test('no unconditional receipt promise (DE+TR)', () => {
  assert.doesNotMatch(html, /stellen wir auf Wunsch eine Bescheinigung aus/);
  assert.doesNotMatch(html, /talep üzerine belge düzenliyoruz/);
  assert.doesNotMatch(html, /Inventar und Spendenbeleg übernimmt/);
  assert.match(html, /Eintragung geplant 2027/);
  assert.match(html, /erst nach Anerkennung durch das Finanzamt/);
  assert.match(html, /Tescil 2027'de planlanıyor/);
});

test('no transport or data-protection takeover promise (DE+TR)', () => {
  assert.doesNotMatch(html, /Transport[^"<]*übernimmt WeiterWert/);
  assert.doesNotMatch(html, /du übergibst nur die Geräte|Sie übergeben nur die Geräte/);
  assert.doesNotMatch(html, /taşıma, envanter ve bağış makbuzunu/);
  assert.doesNotMatch(html, /sen sadece cihazları teslim edersin/);
});

test('legal status stated (DE+TR)', () => {
  assert.match(html, /nicht eingetragener Verein in Gründung/);
  assert.match(html, /kuruluş aşamasında/);
});

test('no LOGO placeholder slots', () => {
  assert.doesNotMatch(html, /class="partner-slot"/);
  assert.doesNotMatch(html, /Platzhalter für Logos/);
});
