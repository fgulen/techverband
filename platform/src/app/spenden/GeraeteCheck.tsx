'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { pruefe } from '@/lib/vorpruefung/pruefe';
import { ERGEBNIS_TEXT, type GeraetEingabe, type Geraetetyp, type Pruefergebnis } from '@/lib/vorpruefung/types';
import styles from './check.module.css';

type Option<V extends string> = { value: V; label: string };
type Art = 'laptop' | 'tablet';
type FrageKey = Exclude<keyof GeraetEingabe, 'marke' | 'modell'>;

const LEER: GeraetEingabe = {
  typ: 'unbekannt', marke: '', modell: '', alter: 'unbekannt', startet: 'unbekannt', display: 'unbekannt',
  akku: 'unbekannt', sperren: 'unbekannt', eigentum: 'unbekannt', ram: 'unbekannt',
};

const WEISS_NICHT = 'Weiß ich nicht';

// The toggle decides which device types and questions are shown.
const ART: Record<Art, { label: string; typen: Option<Geraetetyp>[]; marke: string; modell: string }> = {
  laptop: {
    label: 'Laptop',
    typen: [
      { value: 'laptop', label: 'Laptop (Windows/Linux)' }, { value: 'macbook', label: 'MacBook' },
      { value: 'chromebook', label: 'Chromebook' }, { value: 'unbekannt', label: WEISS_NICHT },
    ],
    marke: 'z. B. Lenovo, HP, Apple', modell: 'z. B. ThinkPad T480',
  },
  tablet: {
    label: 'Tablet',
    typen: [
      { value: 'ipad', label: 'iPad' }, { value: 'android', label: 'Android-Tablet' }, { value: 'unbekannt', label: WEISS_NICHT },
    ],
    marke: 'z. B. Apple, Samsung, Lenovo', modell: 'z. B. iPad 9. Generation',
  },
};

const FRAGEN: { key: FrageKey; schritt: number; legend: string; nurLaptop?: boolean; options: Option<string>[] }[] = [
  { key: 'alter', schritt: 1, legend: 'Ungefähres Alter', options: [
    { value: '0-3', label: 'bis 3 Jahre' }, { value: '4-6', label: '4 bis 6 Jahre' },
    { value: '7-9', label: '7 bis 9 Jahre' }, { value: '10+', label: '10 Jahre oder älter' },
    { value: 'unbekannt', label: WEISS_NICHT },
  ] },
  { key: 'startet', schritt: 1, legend: 'Startet das Gerät?', options: [
    { value: 'ja', label: 'Ja' }, { value: 'nein', label: 'Nein' }, { value: 'unbekannt', label: WEISS_NICHT },
  ] },
  { key: 'display', schritt: 1, legend: 'Display', options: [
    { value: 'ok', label: 'In Ordnung' }, { value: 'schaden', label: 'Riss oder Fehler' }, { value: 'unbekannt', label: WEISS_NICHT },
  ] },
  { key: 'akku', schritt: 1, legend: 'Akku', options: [
    { value: 'ok', label: 'In Ordnung' }, { value: 'schwach', label: 'Hält kaum Ladung' },
    { value: 'gebläht', label: 'Gebläht oder beschädigt' }, { value: 'unbekannt', label: WEISS_NICHT },
  ] },
  { key: 'ram', schritt: 1, nurLaptop: true, legend: 'Arbeitsspeicher (optional)', options: [
    { value: '8+', label: '8 GB oder mehr' }, { value: '4', label: '4 GB' }, { value: 'unbekannt', label: WEISS_NICHT },
  ] },
  { key: 'sperren', schritt: 2, legend: 'Konten und Sperren', options: [
    { value: 'keine', label: 'Alles entfernt' }, { value: 'konto', label: 'Konto oder Passwort noch aktiv' },
    { value: 'firma', label: 'Firmengerät mit Verwaltung (IT)' }, { value: 'unbekannt', label: WEISS_NICHT },
  ] },
  { key: 'eigentum', schritt: 2, legend: 'Gehört das Gerät Ihnen?', options: [
    { value: 'ja', label: 'Ja, es gehört mir' }, { value: 'leasing', label: 'Nein, es ist geleast' },
    { value: 'unbekannt', label: WEISS_NICHT },
  ] },
];

const SCHRITTE = ['Gerät', 'Zustand', 'Konten und Eigentum', 'Ergebnis'];

function Ergebnisbox({ r }: { r: Pruefergebnis }) {
  return (
    <div role="status" aria-live="polite" aria-label="Vorprüfung" className={`${styles.result} ${styles[r.ergebnis]}`}>
      <strong>{ERGEBNIS_TEXT[r.ergebnis]}</strong>
      {r.gruende.length > 0 && <ul>{r.gruende.map((g) => <li key={g}>{g}</li>)}</ul>}
      <small>Einschätzung nach Annahmekriterien {r.regelVersion}. Endgültig entscheiden wir nach der Prüfung des Geräts.</small>
    </div>
  );
}

function Icon({ art }: { art: Art }) {
  return art === 'laptop' ? (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="11" rx="1.5" /><path d="M2 19h20" /></svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="2.5" width="14" height="19" rx="2" /><path d="M11 18.5h2" /></svg>
  );
}

function Fortschritt({ schritt }: { schritt: number }) {
  return (
    <div className={styles.progress}>
      <p className={styles.progressText}>Schritt {schritt + 1} von {SCHRITTE.length}: <strong>{SCHRITTE[schritt]}</strong></p>
      <ol aria-label="Fortschritt" className={styles.progressList}>
        {SCHRITTE.map((s, i) => (
          <li key={s} aria-current={i === schritt ? 'step' : undefined}
            className={i < schritt ? styles.done : i === schritt ? styles.current : undefined}>
            <span className={styles.dot}>{i + 1}</span>
            <span className={styles.label}>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** `abschluss` is shown on the result step: what happens after the pre-check. */
export function GeraeteCheck({ abschluss }: { abschluss?: ReactNode }) {
  const [art, setArt] = useState<Art>('laptop');
  const [geraet, setGeraet] = useState<GeraetEingabe>(LEER);
  const [schritt, setSchritt] = useState(0);
  const [liste, setListe] = useState<{ eingabe: GeraetEingabe; r: Pruefergebnis }[]>([]);
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const r = pruefe(geraet);
  const set = <K extends keyof GeraetEingabe>(k: K, v: GeraetEingabe[K]) => setGeraet((g) => ({ ...g, [k]: v }));
  const letzter = SCHRITTE.length - 1;

  // After Weiter/Zurück, put focus and view on the new step (not on first render).
  useEffect(() => {
    if (!moved.current) return;
    heading.current?.focus();
    heading.current?.closest('form')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [schritt]);
  const gehe = (s: number) => { moved.current = true; setSchritt(s); };

  // Answers that do not exist for the new device kind must not keep influencing the result.
  const waehleArt = (a: Art) => {
    setArt(a);
    setGeraet((g) => ({
      ...g,
      typ: ART[a].typen.some((t) => t.value === g.typ) ? g.typ : 'unbekannt',
      ram: a === 'tablet' ? 'unbekannt' : g.ram,
    }));
  };

  const frage = (f: (typeof FRAGEN)[number]) => (
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
  );

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
        if (schritt < letzter) { gehe(schritt + 1); return; }
        if (r.ergebnis === 'nichtGeeignet') return;
        setListe((l) => [...l, { eingabe: geraet, r }]);
        setGeraet(LEER);
        gehe(0);
      }}>
        <Fortschritt schritt={schritt} />
        <h2 ref={heading} tabIndex={-1} className={styles.stepHeading}>
          {schritt === 0 ? (liste.length === 0 ? 'Ihr Gerät' : 'Weiteres Gerät') : SCHRITTE[schritt]}
        </h2>

        {schritt === 0 && (
          <>
            <fieldset className={styles.q}>
              <legend>Was möchten Sie spenden?</legend>
              <div className={styles.toggle}>
                {(Object.keys(ART) as Art[]).map((a) => (
                  <label key={a} className={styles.toggleOpt}>
                    <input type="radio" name={`${id}-art`} value={a} checked={art === a} onChange={() => waehleArt(a)} />
                    <Icon art={a} />
                    <span>{ART[a].label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p className={styles.hint}>Alle Fragen sind freiwillig. „Weiß ich nicht“ ist immer in Ordnung.</p>
            {frage({ key: 'typ', schritt: 0, legend: 'Gerätetyp', options: ART[art].typen })}
            <div className={styles.row}>
              <label htmlFor={`${id}-marke`}>Marke</label>
              <input id={`${id}-marke`} value={geraet.marke} onChange={(e) => set('marke', e.target.value)} placeholder={ART[art].marke} autoComplete="off" />
              <label htmlFor={`${id}-modell`}>Modell (optional)</label>
              <input id={`${id}-modell`} value={geraet.modell} onChange={(e) => set('modell', e.target.value)} placeholder={ART[art].modell} autoComplete="off" />
            </div>
          </>
        )}

        {FRAGEN.filter((f) => f.schritt === schritt && !(f.nurLaptop && art === 'tablet')).map(frage)}

        {/* Safety notes (swollen battery, leasing) must not wait until the last step. */}
        {(schritt === letzter || r.ergebnis === 'nichtGeeignet') && <Ergebnisbox r={r} />}

        <div className={styles.nav}>
          {schritt > 0 && <button type="button" className={styles.back} onClick={() => gehe(schritt - 1)}>Zurück</button>}
          {schritt < letzter
            ? <button type="submit" className="btn">Weiter</button>
            : <button type="submit" className="btn" disabled={r.ergebnis === 'nichtGeeignet'}>Gerät zur Liste hinzufügen</button>}
        </div>

        {schritt === letzter && abschluss}
      </form>
    </div>
  );
}
