import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GeraetEingabe } from '@/lib/vorpruefung/types';
import { sendeAnfrage } from './actions';

const geraet: GeraetEingabe = {
  typ: 'laptop', marke: 'Lenovo', modell: 'T480', alter: '0-3', startet: 'ja', display: 'ok',
  akku: 'ok', sperren: 'keine', eigentum: 'ja', ram: '8+',
};
const anfrage = (key: string, g = geraet) => ({
  idempotencyKey: key, geraete: [g],
  kontakt: { name: 'Erika Muster', email: 'erika@example.de', plz: '50667', telefon: '', organisation: '' },
  erklaerungen: { eigentum: true, daten: true }, website: '',
});

describe('sendeAnfrage (test store)', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_APP_ENV', 'test');
    vi.stubEnv('SUPABASE_SECRET_KEY', '');
  });
  afterEach(() => vi.unstubAllEnvs());

  it('returns a Vorgangsnummer, and the same one when the request is sent twice', async () => {
    const key = '11111111-2222-4333-8444-555555555555';
    const [a, b] = await Promise.all([sendeAnfrage(anfrage(key)), sendeAnfrage(anfrage(key))]);
    expect(a.ok && a.vorgangsnummer).toMatch(/^WW-\d{4}-\d{6}$/);
    expect(b).toEqual(a);
    const c = await sendeAnfrage(anfrage('11111111-2222-4333-8444-666666666666'));
    expect(c.ok && c.vorgangsnummer).not.toBe(a.ok && a.vorgangsnummer);
  });

  it('re-checks devices on the server and refuses one rated not suitable', async () => {
    const r = await sendeAnfrage(anfrage('11111111-2222-4333-8444-777777777777', { ...geraet, akku: 'gebläht' }));
    expect(r.ok).toBe(false);
  });

  it('gives bots that fill the hidden field no number', async () => {
    const r = await sendeAnfrage({ ...anfrage('11111111-2222-4333-8444-888888888888'), website: 'http://spam' });
    expect(r.ok).toBe(false);
  });
});

describe('sendeAnfrage (production without key)', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('saves nothing and points to e-mail', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_ENV', 'production');
    vi.stubEnv('SUPABASE_SECRET_KEY', '');
    const r = await sendeAnfrage(anfrage('11111111-2222-4333-8444-999999999999'));
    expect(r).toEqual({ ok: false, fehler: expect.stringContaining('weiterwert@gmail.com') });
  });
});
