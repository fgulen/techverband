import { describe, expect, it } from 'vitest';
import { pruefe } from './pruefe';
import type { GeraetEingabe } from './types';

const gut: GeraetEingabe = {
  typ: 'laptop', marke: 'Lenovo', modell: 'ThinkPad T480',
  alter: '0-3', startet: 'ja', display: 'ok', akku: 'ok', sperren: 'keine', eigentum: 'ja', ram: 'unbekannt',
};

describe('pruefe (Annahmekriterien v0.1)', () => {
  it('rates a working, recent, unlocked own device as provisionally suitable', () => {
    const r = pruefe(gut);
    expect(r.ergebnis).toBe('geeignet');
    expect(r.regelVersion).toBe('v0.1');
  });

  it('rejects a swollen battery and says not to ship or bring it', () => {
    const r = pruefe({ ...gut, akku: 'gebläht' });
    expect(r.ergebnis).toBe('nichtGeeignet');
    expect(r.gruende.join(' ')).toMatch(/nicht versenden/);
  });

  it('rejects leased devices', () => {
    expect(pruefe({ ...gut, eigentum: 'leasing' }).ergebnis).toBe('nichtGeeignet');
  });

  it('sends uncertain or borderline cases to manual review, never to rejection', () => {
    for (const patch of [
      { startet: 'nein' }, { alter: '7-9' }, { alter: '10+' }, { display: 'schaden' },
      { akku: 'schwach' }, { sperren: 'konto' }, { sperren: 'firma' }, { ram: '4' },
    ] as Partial<GeraetEingabe>[]) {
      expect(pruefe({ ...gut, ...patch }).ergebnis, JSON.stringify(patch)).toBe('manuell');
    }
  });

  it('asks for more details when key answers are unknown, without blocking', () => {
    for (const patch of [{ alter: 'unbekannt' }, { startet: 'unbekannt' }, { typ: 'unbekannt' }, { eigentum: 'unbekannt' }] as Partial<GeraetEingabe>[]) {
      expect(pruefe({ ...gut, ...patch }).ergebnis, JSON.stringify(patch)).toBe('angaben');
    }
  });

  it('lets the strongest finding win: rejection > manual > details > suitable', () => {
    expect(pruefe({ ...gut, akku: 'gebläht', sperren: 'firma', alter: 'unbekannt' }).ergebnis).toBe('nichtGeeignet');
    expect(pruefe({ ...gut, sperren: 'firma', alter: 'unbekannt' }).ergebnis).toBe('manuell');
  });

  it('flags Chromebooks older than 6 years for an update-end check', () => {
    const r = pruefe({ ...gut, typ: 'chromebook', alter: '7-9' });
    expect(r.ergebnis).toBe('manuell');
    expect(r.gruende.join(' ')).toMatch(/Update-Ende/);
  });

  it('gives a reason for every non-suitable result', () => {
    for (const e of [{ ...gut, akku: 'gebläht' }, { ...gut, alter: '10+' }, { ...gut, startet: 'unbekannt' }] as GeraetEingabe[]) {
      expect(pruefe(e).gruende.length).toBeGreaterThan(0);
    }
  });

  it('never rates unknown battery, display or locks as suitable', () => {
    for (const patch of [{ akku: 'unbekannt' }, { display: 'unbekannt' }, { sperren: 'unbekannt' }] as Partial<GeraetEingabe>[]) {
      expect(pruefe({ ...gut, ...patch }).ergebnis, JSON.stringify(patch)).not.toBe('geeignet');
    }
  });

  it('mentions Windows 11 only for Windows/Linux laptops', () => {
    for (const typ of ['ipad', 'android', 'macbook'] as const) {
      expect(pruefe({ ...gut, typ, alter: '7-9' }).gruende.join(' ')).not.toMatch(/Windows/);
    }
  });

  it('checks the Chromebook update end from 4 years on and for 10+', () => {
    for (const alter of ['4-6', '10+'] as const) {
      const r = pruefe({ ...gut, typ: 'chromebook', alter });
      expect(r.ergebnis, alter).toBe('manuell');
      expect(r.gruende.join(' '), alter).toMatch(/Update-Ende/);
    }
  });
});
