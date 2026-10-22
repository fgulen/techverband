export type Geraetetyp = 'laptop' | 'chromebook' | 'macbook' | 'android' | 'ipad' | 'unbekannt';

export type GeraetEingabe = {
  typ: Geraetetyp;
  marke: string;
  modell: string;
  alter: '0-3' | '4-6' | '7-9' | '10+' | 'unbekannt';
  startet: 'ja' | 'nein' | 'unbekannt';
  display: 'ok' | 'schaden' | 'unbekannt';
  akku: 'ok' | 'schwach' | 'gebläht' | 'unbekannt';
  sperren: 'keine' | 'konto' | 'firma' | 'unbekannt';
  eigentum: 'ja' | 'leasing' | 'unbekannt';
  ram: '8+' | '4' | 'unbekannt';
};

export type Ergebnis = 'geeignet' | 'angaben' | 'manuell' | 'nichtGeeignet';

export type Pruefergebnis = { ergebnis: Ergebnis; gruende: string[]; regelVersion: string };

export const ERGEBNIS_TEXT: Record<Ergebnis, string> = {
  geeignet: 'Vorläufig geeignet',
  angaben: 'Weitere Angaben erforderlich',
  manuell: 'Manuelle Prüfung erforderlich',
  nichtGeeignet: 'Nach den veröffentlichten Kriterien voraussichtlich nicht geeignet',
};
