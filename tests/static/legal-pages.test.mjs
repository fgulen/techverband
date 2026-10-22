import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = f => readFileSync(new URL(`../../${f}`, import.meta.url), 'utf8');

test('footer links to legal pages', () => {
  const html = read('index.html');
  assert.match(html, /href="impressum.html"/);
  assert.match(html, /href="datenschutz.html"/);
  assert.doesNotMatch(html, /Impressum und Datenschutz folgen/);
});

test('impressum states legal form and responsibility', () => {
  assert.ok(existsSync(new URL('../../impressum.html', import.meta.url)));
  const s = read('impressum.html');
  assert.match(s, /Angaben gemäß § 5 DDG/);
  assert.match(s, /nicht eingetragener Verein in Gründung/);
  assert.match(s, /Verantwortlich/);
  assert.doesNotMatch(s, /Registergericht|Registernummer|USt-IdNr/);
});

test('datenschutz names processors, bases and rights', () => {
  const s = read('datenschutz.html');
  for (const n of ['Vercel', 'Google (Gmail)', 'Art. 6 Abs. 1', 'Beschwerde', 'localStorage', '§ 25 Abs. 2 TDDDG', 'keine Cookies']) {
    assert.ok(s.includes(n), n);
  }
});

test('legal pages link back and to each other', () => {
  for (const f of ['impressum.html', 'datenschutz.html']) {
    const s = read(f);
    assert.match(s, /href="index.html"|href="\/"/);
    assert.match(s, /href="impressum.html"/);
    assert.match(s, /href="datenschutz.html"/);
    assert.doesNotMatch(s, /fonts\.(googleapis|gstatic)\.com/);
  }
});
