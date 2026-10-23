import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const read = f => readFileSync(new URL(`../../${f}`, import.meta.url), 'utf8');
const LEGAL = ['impressum.html', 'datenschutz.html', 'barrierefreiheit.html'];

// Decision 2026-10-23: legal pages go live with open fields marked "wird ausgefüllt".
// Invariant: every legal page is linked in the footer and deployed.
test('every legal page is linked in the footer and deployed', () => {
  const html = read('index.html');
  const ignore = read('.vercelignore').split(/\r?\n/).map(l => l.trim());
  for (const f of LEGAL) {
    assert.ok(html.includes(`href="${f}"`), `${f} not linked in footer`);
    assert.ok(ignore.includes(`!/${f}`), `${f} not deployed`);
  }
});

test('open fields use the marker, not raw placeholders', () => {
  for (const f of LEGAL) {
    const s = read(f);
    assert.doesNotMatch(s, /⟦FEHLT|\[ausfüllen\]/, `${f} has a raw placeholder`);
    for (const m of s.matchAll(/<span class="tbd">([^<]*)<\/span>/g)) {
      assert.match(m[1], /– wird ausgefüllt$/, `${f}: marker text`);
    }
  }
  assert.doesNotMatch(read('index.html'), /footerLegalHint/);
});

test('no cookie banner or AI claims while the site uses neither', () => {
  const s = read('datenschutz.html');
  assert.match(s, /keine Cookies/);
  assert.match(s, /keine KI-Funktionen/);
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
  for (const n of ['Vercel', 'Supabase', 'Google (Gmail)', 'Art. 6 Abs. 1', 'Beschwerde', 'localStorage', '§ 25 Abs. 2 TDDDG', 'keine Cookies']) {
    assert.ok(s.includes(n), n);
  }
});

test('datenschutz does not claim an unverified processing agreement with Vercel', () => {
  assert.doesNotMatch(read('datenschutz.html'), /Mit Vercel besteht ein Vertrag zur Auftragsverarbeitung/);
});

test('legal pages link back and to each other', () => {
  for (const f of LEGAL) {
    const s = read(f);
    for (const target of ['index.html', ...LEGAL]) assert.match(s, new RegExp(`href="${target}"`));
    assert.doesNotMatch(s, /fonts\.(googleapis|gstatic)\.com/);
  }
});
