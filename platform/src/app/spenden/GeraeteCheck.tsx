'use client';

import { useId, useState } from 'react';
import { pruefe } from '@/lib/vorpruefung/pruefe';
import { ERGEBNIS_TEXT, type GeraetEingabe, type Pruefergebnis } from '@/lib/vorpruefung/types';
import styles from './check.module.css';

type Option<V extends string> = { value: V; label: string };

const LEER: GeraetEingabe = {
  typ: 'unbekannt', marke: '', modell: '', alter: 'unbekannt', startet: 'unbekannt', display: 'unbekannt',
  akku: 'unbekannt', sperren: 'unbekannt', eigentum: 'unbekannt', ram: 'unbekannt',
};

const WEISS_NICHT = 'Weiß ich nicht';

const FRAGEN: { key: Exclude<keyof GeraetEingabe, 'marke' | 'modell'>; legend: string; options: Option<string>[] }[] = [
  { key: 'typ', legend: 'Gerätetyp', options: [
    { value: 'laptop', label: 'Laptop (Windows/Linux)' }, { value: 'macbook', label: 'MacBook' },
    { value: 'chromebook', label: 'Chromebook' }, { value: 'android', label: 'Android-Tablet' },
    { value: 'ipad', label: 'iPad' }, { value: 'unbekannt', label: WEISS_NICHT },
  ] },
  { key: 'alter', legend: 'Ungefähres Alter', options: [
    { value: '0-3', label: 'bis 3 Jahre' }, { value: '4-6', label: '4 bis 6 Jahre' },
    { value: '7-9', label: '7 bis 9 Jahre' }, { value: '10+', label: '10 Jahre oder älter' },
    { value: 'unbekannt', label: WEISS_NICHT },
  ] },
  { key: 'startet', legend: 'Startet das Gerät?', options: [
    { value: 'ja', label: 'Ja' }, { value: 'nein', label: 'Nein' }, { value: 'unbekannt', label: WEISS_NICHT },
  ] },
  { key: 'display', legend: 'Display', options: [
    { value: 'ok', label: 'In Ordnung' }, { value: 'schaden', label: 'Riss oder Fehler' }, { value: 'unbekannt', label: WEISS_NICHT },
  ] },
  { key: 'akku', legend: 'Akku', options: [
    { value: 'ok', label: 'In Ordnung' }, { value: 'schwach', label: 'Hält kaum Ladung' },
    { value: 'gebläht', label: 'Gebläht oder beschädigt' }, { value: 'unbekannt', label: WEISS_NICHT },
  ] },
  { key: 'sperren', legend: 'Konten und Sperren', options: [
    { value: 'keine', label: 'Alles entfernt' }, { value: 'konto', label: 'Konto oder Passwort noch aktiv' },
    { value: 'firma', label: 'Firmengerät mit Verwaltung (IT)' }, { value: 'unbekannt', label: WEISS_NICHT },
  ] },
  { key: 'ram', legend: 'Arbeitsspeicher (optional)', options: [
    { value: '8+', label: '8 GB oder mehr' }, { value: '4', label: '4 GB' }, { value: 'unbekannt', label: WEISS_NICHT },
  ] },
  { key: 'eigentum', legend: 'Gehört das Gerät Ihnen?', options: [
    { value: 'ja', label: 'Ja, es gehört mir' }, { value: 'leasing', label: 'Nein, es ist geleast' },
    { value: 'unbekannt', label: WEISS_NICHT },
  ] },
];

function Ergebnisbox({ r }: { r: Pruefergebnis }) {
  return (
    <div role="status" aria-live="polite" aria-label="Vorprüfung" className={`${styles.result} ${styles[r.ergebnis]}`}>
      <strong>{ERGEBNIS_TEXT[r.ergebnis]}</strong>
      {r.gruende.length > 0 && <ul>{r.gruende.map((g) => <li key={g}>{g}</li>)}</ul>}
      <small>Einschätzung nach Annahmekriterien {r.regelVersion}. Endgültig entscheiden wir nach der Prüfung des Geräts.</small>
    </div>
  );
}

export function GeraeteCheck() {
  const [geraet, setGeraet] = useState<GeraetEingabe>(LEER);
  const [liste, setListe] = useState<{ eingabe: GeraetEingabe; r: Pruefergebnis }[]>([]);
  const id = useId();
  const r = pruefe(geraet);
  const set = <K extends keyof GeraetEingabe>(k: K, v: GeraetEingabe[K]) => setGeraet((g) => ({ ...g, [k]: v }));

  return (
    <div className={styles.wrap}>
      {liste.length > 0 && (
        <section className={styles.listBox}>
          <h2>Ihre Geräte ({liste.length})</h2>
          <ul aria-label="Ihre Geräte" className={styles.list}>
            {liste.map((d, i) => (
              <li key={i} className={styles.item}>
                <span>{[d.eingabe.marke, d.eingabe.modell].filter(Boolean).join(' ') || `Gerät ${i + 1}`}</span>
                <span className={`${styles.chip} ${styles[d.r.ergebnis]}`}>{ERGEBNIS_TEXT[d.r.ergebnis]}</span>
                <button type="button" className={styles.linkBtn} onClick={() => setListe((l) => l.filter((_, j) => j !== i))}>Entfernen</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <form className={styles.form} onSubmit={(ev) => {
        ev.preventDefault();
        if (r.ergebnis === 'nichtGeeignet') return;
        setListe((l) => [...l, { eingabe: geraet, r }]);
        setGeraet(LEER);
      }}>
        <h2>{liste.length === 0 ? 'Ihr Gerät' : 'Weiteres Gerät'}</h2>
        <p className={styles.hint}>Alle Fragen sind freiwillig. „Weiß ich nicht“ ist immer in Ordnung.</p>

        <div className={styles.row}>
          <label htmlFor={`${id}-marke`}>Marke</label>
          <input id={`${id}-marke`} value={geraet.marke} onChange={(e) => set('marke', e.target.value)} placeholder="z. B. Lenovo, HP, Apple" autoComplete="off" />
          <label htmlFor={`${id}-modell`}>Modell (optional)</label>
          <input id={`${id}-modell`} value={geraet.modell} onChange={(e) => set('modell', e.target.value)} placeholder="z. B. ThinkPad T480" autoComplete="off" />
        </div>

        {FRAGEN.map((f) => (
          <fieldset key={f.key} className={styles.q}>
            <legend>{f.legend}</legend>
            <div className={styles.opts}>
              {f.options.map((o) => (
                <label key={o.value} className={styles.opt}>
                  <input type="radio" name={`${id}-${f.key}`} value={o.value}
                    checked={geraet[f.key] === o.value}
                    onChange={() => set(f.key, o.value as never)} />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <Ergebnisbox r={r} />
        <button type="submit" className="btn" disabled={r.ergebnis === 'nichtGeeignet'}>Gerät zur Liste hinzufügen</button>
      </form>
    </div>
  );
}
