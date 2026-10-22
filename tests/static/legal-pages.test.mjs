import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = f => readFileSync(new URL(`../../${f}`, import.meta.url), 'utf8');
const LEGAL = ['impressum.html', 'datenschutz.html'];
const complete = f => !/⟦FEHLT/.test(read(f));

// Invariant: a legal page is linked and deployed only once it has no placeholders left.
test('incomplete legal pages are neither linked nor deployed; complete ones are both', () => {
  const html = read('index.html');
  const ignore = read('.vercelignore').split(/\r?\n/).map(l => l.trim());
  for (const f of LEGAL) {
    const linked = html.includes(`href="${f}"`);
    const deployed = ignore.includes(`!/${f}`);
    if (complete(f)) {
      assert.ok(linked && deployed, `${f} is complete: link it and deploy it`);
    } else {
      assert.ok(!linked && !deployed, `${f} still has placeholders: must not be linked or deployed`);
    }
  }
});

test('footer says legal pages follow while any is incomplete', () => {
  const html = read('index.html');
  if (!LEGAL.every(complete)) assert.match(html, /data-i18n="footerLegalHint"/);
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

test('datenschutz does not claim an unverified processing agreement with Vercel', () => {
  assert.doesNotMatch(read('datenschutz.html'), /Mit Vercel besteht ein Vertrag zur Auftragsverarbeitung/);
});

test('legal pages link back and to each other', () => {
  for (const f of LEGAL) {
    const s = read(f);
    assert.match(s, /href="index.html"/);
    assert.match(s, /href="impressum.html"/);
    assert.match(s, /href="datenschutz.html"/);
    assert.doesNotMatch(s, /fonts\.(googleapis|gstatic)\.com/);
  }
});
