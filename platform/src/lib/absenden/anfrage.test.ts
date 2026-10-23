import { describe, expect, it } from 'vitest';
import type { GeraetEingabe } from '@/lib/vorpruefung/types';
import { leseAnfrage, MAX_GERAETE, pruefeKontakt, type Kontakt } from './anfrage';

const kontakt: Kontakt = { name: 'Erika Muster', email: 'erika@example.de', plz: '50667', telefon: '', organisation: '' };
const geraet: GeraetEingabe = {
  typ: 'laptop', marke: 'Lenovo', modell: 'T480', alter: '0-3', startet: 'ja', display: 'ok',
  akku: 'ok', sperren: 'keine', eigentum: 'ja', ram: '8+',
};
const gut = {
  idempotencyKey: '3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e',
  geraete: [geraet], kontakt, erklaerungen: { eigentum: true, daten: true }, website: '',
};

describe('pruefeKontakt', () => {
  it('accepts name, e-mail and a five-digit PLZ; phone and organisation are optional', () => {
    expect(pruefeKontakt(kontakt)).toEqual({});
  });

  it('names each missing or wrong field', () => {
    const f = pruefeKontakt({ ...kontakt, name: ' ', email: 'erika@', plz: '5066' });
    expect(Object.keys(f).sort()).toEqual(['email', 'name', 'plz']);
  });
});

describe('leseAnfrage', () => {
  it('returns a clean copy of a valid request', () => {
    const r = leseAnfrage({ ...gut, kontakt: { ...kontakt, name: '  Erika Muster ' }, extra: 'x' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.anfrage.kontakt.name).toBe('Erika Muster');
      expect(r.anfrage).not.toHaveProperty('extra');
    }
  });

  it('rejects requests without devices, with too many, or with unknown answer values', () => {
    expect(leseAnfrage({ ...gut, geraete: [] }).ok).toBe(false);
    expect(leseAnfrage({ ...gut, geraete: Array(MAX_GERAETE + 1).fill(geraet) }).ok).toBe(false);
    expect(leseAnfrage({ ...gut, geraete: [{ ...geraet, akku: 'explodiert' }] }).ok).toBe(false);
    expect(leseAnfrage({ ...gut, geraete: [{ ...geraet, marke: 'x'.repeat(101) }] }).ok).toBe(false);
  });

  it('requires both declarations and a valid idempotency key', () => {
    expect(leseAnfrage({ ...gut, erklaerungen: { eigentum: true, daten: false } }).ok).toBe(false);
    expect(leseAnfrage({ ...gut, idempotencyKey: 'abc' }).ok).toBe(false);
    expect(leseAnfrage({ ...gut, idempotencyKey: '-'.repeat(36) }).ok).toBe(false);
  });

  it('rejects invalid contact data even if the browser check was skipped', () => {
    expect(leseAnfrage({ ...gut, kontakt: { ...kontakt, email: 'keine-mail' } }).ok).toBe(false);
    expect(leseAnfrage({ ...gut, kontakt: { ...kontakt, telefon: 42 } }).ok).toBe(false);
  });
});
