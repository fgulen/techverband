import type { GeraetEingabe } from '@/lib/vorpruefung/types';

export type Kontakt = { name: string; email: string; plz: string; telefon: string; organisation: string };
export type KontaktFehler = Partial<Record<keyof Kontakt, string>>;

export type Anfrage = {
  idempotencyKey: string;
  geraete: GeraetEingabe[];
  kontakt: Kontakt;
  erklaerungen: { eigentum: boolean; daten: boolean };
  /** Honeypot: hidden from people, bots fill it. */
  website: string;
};

export const LEERER_KONTAKT: Kontakt = { name: '', email: '', plz: '', telefon: '', organisation: '' };
export const MAX_GERAETE = 10;
const MAX_TEXT = 100;

// The declarations a donor confirms; the version and a hash of this exact text are stored with each request.
export const ERKLAERUNGEN = {
  version: 'erklaerungen-v1',
  eigentum: 'Die Geräte gehören mir oder ich darf sie spenden. Sie sind nicht geleast, gemietet oder Eigentum meines Arbeitgebers.',
  daten: 'Ich habe meine Daten gesichert. Mir ist bewusst, dass Daten auf den Geräten bei der Aufbereitung verloren gehen.',
} as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PLZ = /^\d{5}$/;

export function pruefeKontakt(k: Kontakt): KontaktFehler {
  const f: KontaktFehler = {};
  if (!k.name.trim()) f.name = 'Bitte geben Sie Ihren Namen an.';
  else if (k.name.length > MAX_TEXT) f.name = 'Der Name ist zu lang.';
  if (!EMAIL.test(k.email.trim()) || k.email.length > MAX_TEXT) f.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.';
  if (!PLZ.test(k.plz.trim())) f.plz = 'Bitte geben Sie eine fünfstellige Postleitzahl an.';
  if (k.telefon.length > 40) f.telefon = 'Die Telefonnummer ist zu lang.';
  if (k.organisation.length > MAX_TEXT) f.organisation = 'Der Name der Organisation ist zu lang.';
  return f;
}

const WERTE: { [K in Exclude<keyof GeraetEingabe, 'marke' | 'modell'>]: readonly GeraetEingabe[K][] } = {
  typ: ['laptop', 'chromebook', 'macbook', 'android', 'ipad', 'unbekannt'],
  alter: ['0-3', '4-6', '7-9', '10+', 'unbekannt'],
  startet: ['ja', 'nein', 'unbekannt'],
  display: ['ok', 'schaden', 'unbekannt'],
  akku: ['ok', 'schwach', 'gebläht', 'unbekannt'],
  sperren: ['keine', 'konto', 'firma', 'unbekannt'],
  eigentum: ['ja', 'leasing', 'unbekannt'],
  ram: ['8+', '4', 'unbekannt'],
};

const text = (v: unknown, max = MAX_TEXT) => (typeof v === 'string' && v.length <= max ? v : null);

function geraet(v: unknown): GeraetEingabe | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  const marke = text(o.marke);
  const modell = text(o.modell);
  if (marke === null || modell === null) return null;
  const g: Record<string, unknown> = { marke: marke.trim(), modell: modell.trim() };
  for (const [k, erlaubt] of Object.entries(WERTE)) {
    if (!(erlaubt as readonly unknown[]).includes(o[k])) return null;
    g[k] = o[k];
  }
  return g as GeraetEingabe;
}

/** Server-side check of untrusted input. Returns a clean copy or a message for the donor. */
export function leseAnfrage(v: unknown): { ok: true; anfrage: Anfrage } | { ok: false; fehler: string } {
  const ungueltig = { ok: false as const, fehler: 'Die Angaben sind unvollständig. Bitte prüfen Sie das Formular.' };
  if (!v || typeof v !== 'object') return ungueltig;
  const o = v as Record<string, unknown>;
  if (typeof o.idempotencyKey !== 'string' || !/^[0-9a-f-]{36}$/i.test(o.idempotencyKey)) return ungueltig;
  if (!Array.isArray(o.geraete) || o.geraete.length === 0) return { ok: false, fehler: 'Bitte erfassen Sie mindestens ein Gerät.' };
  if (o.geraete.length > MAX_GERAETE) return { ok: false, fehler: `Bitte senden Sie höchstens ${MAX_GERAETE} Geräte pro Anfrage.` };
  const geraete = o.geraete.map(geraet);
  if (geraete.some((g) => g === null)) return ungueltig;

  const k = (o.kontakt ?? {}) as Record<string, unknown>;
  const kontakt: Kontakt = { name: '', email: '', plz: '', telefon: '', organisation: '' };
  for (const key of Object.keys(kontakt) as (keyof Kontakt)[]) {
    const t = text(k[key] ?? '', 200);
    if (t === null) return ungueltig;
    kontakt[key] = t.trim();
  }
  if (Object.keys(pruefeKontakt(kontakt)).length > 0) return ungueltig;

  const e = (o.erklaerungen ?? {}) as Record<string, unknown>;
  if (e.eigentum !== true || e.daten !== true) return { ok: false, fehler: 'Bitte bestätigen Sie beide Erklärungen.' };

  return {
    ok: true,
    anfrage: {
      idempotencyKey: o.idempotencyKey.toLowerCase(),
      geraete: geraete as GeraetEingabe[],
      kontakt,
      erklaerungen: { eigentum: true, daten: true },
      website: typeof o.website === 'string' ? o.website : '',
    },
  };
}
