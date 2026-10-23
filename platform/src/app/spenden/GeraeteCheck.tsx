'use client';

import { useEffect, useId, useRef, useState, useTransition, type ReactNode } from 'react';
import { ERKLAERUNGEN, LEERER_KONTAKT, pruefeKontakt, type Kontakt, type KontaktFehler } from '@/lib/absenden/anfrage';
import { pruefe } from '@/lib/vorpruefung/pruefe';
import { ERGEBNIS_TEXT, type GeraetEingabe, type Geraetetyp, type Pruefergebnis } from '@/lib/vorpruefung/types';
import { sendeAnfrage } from './actions';
import styles from './check.module.css';

type Option<V extends string> = { value: V; label: string };
type Art = 'laptop' | 'tablet';
type FrageKey = Exclude<keyof GeraetEingabe, 'marke' | 'modell'>;
type Eintrag = { eingabe: GeraetEingabe; r: Pruefergebnis };

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
    marke: 'z. B. Apple, Samsung', modell: 'z. B. iPad 9. Generation',
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

const SCHRITTE_PRUEFUNG = ['Gerät', 'Zustand', 'Konten und Eigentum', 'Ergebnis'];
const SCHRITTE_ANFRAGE = [...SCHRITTE_PRUEFUNG, 'Kontakt', 'Absenden'];
const ERGEBNIS = 3;
const KONTAKT = 4;
const ABSENDEN = 5;

const KONTAKT_FELDER: { key: keyof Kontakt; label: string; type: string; autoComplete: string; pflicht: boolean; inputMode?: 'numeric' }[] = [
  { key: 'name', label: 'Name', type: 'text', autoComplete: 'name', pflicht: true },
  { key: 'email', label: 'E-Mail', type: 'email', autoComplete: 'email', pflicht: true },
  { key: 'plz', label: 'Postleitzahl', type: 'text', autoComplete: 'postal-code', pflicht: true, inputMode: 'numeric' },
  { key: 'telefon', label: 'Telefon (optional)', type: 'tel', autoComplete: 'tel', pflicht: false },
  { key: 'organisation', label: 'Schule, Firma oder Organisation (optional)', type: 'text', autoComplete: 'organization', pflicht: false },
];

const geraetName = (g: GeraetEingabe, i: number) => [g.marke, g.modell].filter(Boolean).join(' ') || `Gerät ${i + 1}`;

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

function Fortschritt({ schritte, schritt }: { schritte: string[]; schritt: number }) {
  return (
    <div className={styles.progress}>
      <p className={styles.progressText}>Schritt {schritt + 1} von {schritte.length}: <strong>{schritte[schritt]}</strong></p>
      <ol aria-label="Fortschritt" className={styles.progressList} style={{ gridTemplateColumns: `repeat(${schritte.length},1fr)` }}>
        {schritte.map((s, i) => (
          <li key={s} aria-current={i === schritt ? 'step' : undefined}
            className={i < schritt ? styles.done : i === schritt ? styles.current : undefined}>
            <span className={styles.label}>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * Pre-check wizard. With `absenden` the donor can send the request (contact + submit steps);
 * without it the flow ends at the result and `abschluss` explains how to continue.
 */
export function GeraeteCheck({ abschluss, absenden = false }: { abschluss?: ReactNode; absenden?: boolean }) {
  const schritte = absenden ? SCHRITTE_ANFRAGE : SCHRITTE_PRUEFUNG;
  const [art, setArt] = useState<Art>('laptop');
  const [geraet, setGeraet] = useState<GeraetEingabe>(LEER);
  const [schritt, setSchritt] = useState(0);
  const [liste, setListe] = useState<Eintrag[]>([]);
  // False once the current device has been put on the list (e.g. after "Weiter zu Kontakt").
  const [entwurf, setEntwurf] = useState(true);
  const [kontakt, setKontakt] = useState<Kontakt>(LEERER_KONTAKT);
  const [kontaktFehler, setKontaktFehler] = useState<KontaktFehler>({});
  const [erkl, setErkl] = useState({ eigentum: false, daten: false });
  const [erklFehler, setErklFehler] = useState(false);
  const [website, setWebsite] = useState('');
  const [schluessel, setSchluessel] = useState<string | null>(null);
  const [sendFehler, setSendFehler] = useState<string | null>(null);
  const [vorgangsnummer, setVorgangsnummer] = useState<string | null>(null);
  const [sendet, startSenden] = useTransition();
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const r = pruefe(geraet);
  const set = <K extends keyof GeraetEingabe>(k: K, v: GeraetEingabe[K]) => setGeraet((g) => ({ ...g, [k]: v }));
  const letzterPruefschritt = SCHRITTE_PRUEFUNG.length - 1;

  // After a step change, put focus and view on the new step (not on first render).
  useEffect(() => {
    if (!moved.current) return;
    heading.current?.focus();
    heading.current?.closest('section, form')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }, [schritt, vorgangsnummer]);
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

  // Puts the current device on the list unless it is rated not suitable; either way the draft ends.
  const uebernehmeEntwurf = () => {
    if (entwurf && r.ergebnis !== 'nichtGeeignet') setListe((l) => [...l, { eingabe: geraet, r }]);
    setGeraet(LEER);
    setEntwurf(false);
  };
  const neuesGeraet = () => { uebernehmeEntwurf(); setEntwurf(true); gehe(0); };
  const anzahlNachUebernahme = liste.length + (entwurf && r.ergebnis !== 'nichtGeeignet' ? 1 : 0);

  const zuAbsenden = () => {
    const f = pruefeKontakt(kontakt);
    setKontaktFehler(f);
    const erster = KONTAKT_FELDER.find((k) => f[k.key]);
    if (erster) { document.getElementById(`${id}-${erster.key}`)?.focus(); return; }
    setSchluessel((s) => s ?? crypto.randomUUID());
    gehe(ABSENDEN);
  };

  const senden = () => {
    if (!erkl.eigentum || !erkl.daten) { setErklFehler(true); document.getElementById(`${id}-erkl`)?.focus(); return; }
    setErklFehler(false);
    setSendFehler(null);
    startSenden(async () => {
      try {
        const antwort = await sendeAnfrage({
          idempotencyKey: schluessel, geraete: liste.map((d) => d.eingabe), kontakt, erklaerungen: erkl, website,
        });
        if (antwort.ok) { moved.current = true; setVorgangsnummer(antwort.vorgangsnummer); }
        else setSendFehler(antwort.fehler);
      } catch {
        // Lost connection or an outdated page after a deploy; the same key makes a retry safe.
        setSendFehler('Die Verbindung ist fehlgeschlagen. Ihre Angaben sind noch da. Bitte versuchen Sie es erneut.');
      }
    });
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

  if (vorgangsnummer) {
    return (
      <section className={`${styles.form} ${styles.danke}`} aria-labelledby={`${id}-danke`}>
        <h2 id={`${id}-danke`} ref={heading} tabIndex={-1} className={styles.stepHeading}>Vielen Dank für Ihre Spende!</h2>
        <p>Ihre Anfrage ist bei uns angekommen. Ihre Vorgangsnummer:</p>
        <p className={styles.nummer}>{vorgangsnummer}</p>
        <p>Wir melden uns per E-Mail bei Ihnen, um die Übergabe abzustimmen. Bitte notieren Sie sich die Vorgangsnummer für Rückfragen.</p>
        <p className={styles.hint}>Bitte bringen oder schicken Sie noch nichts, bevor wir uns gemeldet haben.</p>
      </section>
    );
  }

  return (
    <div className={styles.wrap}>
      {liste.length > 0 && schritt !== ABSENDEN && (
        <section className={styles.listBox}>
          <h2>Ihre Geräte ({liste.length})</h2>
          <ul aria-label="Ihre Geräte" className={styles.list}>
            {liste.map((d, i) => (
              <li key={i} className={styles.item}>
                <span>{geraetName(d.eingabe, i)}</span>
                <span className={`${styles.chip} ${styles[d.r.ergebnis]}`}>{ERGEBNIS_TEXT[d.r.ergebnis]}</span>
                <button type="button" className={styles.linkBtn} onClick={() => setListe((l) => l.filter((_, j) => j !== i))}>Entfernen</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <form className={styles.form} noValidate onSubmit={(ev) => {
        ev.preventDefault();
        if (schritt < letzterPruefschritt) { gehe(schritt + 1); return; }
        if (!absenden) {
          if (r.ergebnis === 'nichtGeeignet') return;
          setListe((l) => [...l, { eingabe: geraet, r }]);
          setGeraet(LEER);
          gehe(0);
          return;
        }
        if (schritt === ERGEBNIS) { if (anzahlNachUebernahme > 0) { uebernehmeEntwurf(); gehe(KONTAKT); } return; }
        if (schritt === KONTAKT) { zuAbsenden(); return; }
        senden();
      }}>
        <Fortschritt schritte={schritte} schritt={schritt} />
        <h2 ref={heading} tabIndex={-1} className={styles.stepHeading}>
          {schritt === 0 ? (liste.length === 0 ? 'Ihr Gerät' : 'Weiteres Gerät') : schritte[schritt]}
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
              <input id={`${id}-marke`} value={geraet.marke} onChange={(e) => set('marke', e.target.value)} placeholder={ART[art].marke} autoComplete="off" maxLength={100} />
              <label htmlFor={`${id}-modell`}>Modell (optional)</label>
              <input id={`${id}-modell`} value={geraet.modell} onChange={(e) => set('modell', e.target.value)} placeholder={ART[art].modell} autoComplete="off" maxLength={100} />
            </div>
          </>
        )}

        {FRAGEN.filter((f) => f.schritt === schritt && !(f.nurLaptop && art === 'tablet')).map(frage)}

        {/* Safety notes (swollen battery, leasing) must not wait until the last step. */}
        {schritt <= ERGEBNIS && entwurf && (schritt === ERGEBNIS || r.ergebnis === 'nichtGeeignet') && <Ergebnisbox r={r} />}

        {absenden && schritt === ERGEBNIS && (
          <p className={styles.hint}>
            {!entwurf ? 'Ihre Geräte sehen Sie oben in der Liste.'
              : r.ergebnis === 'nichtGeeignet'
                ? (liste.length > 0 ? 'Dieses Gerät nehmen wir nicht in Ihre Anfrage auf.' : 'Dieses Gerät können wir leider nicht annehmen. Sie können ein anderes Gerät erfassen.')
                : 'Möchten Sie noch ein Gerät spenden? Dann erfassen Sie es jetzt, bevor Sie Ihre Kontaktdaten angeben.'}
          </p>
        )}

        {schritt === KONTAKT && (
          <>
            <p className={styles.hint}>Wir nutzen Ihre Angaben nur, um die Übergabe mit Ihnen abzustimmen.</p>
            <div className={styles.row}>
              {KONTAKT_FELDER.map((f) => (
                <div key={f.key} className={styles.field}>
                  <label htmlFor={`${id}-${f.key}`}>{f.label}</label>
                  <input id={`${id}-${f.key}`} type={f.type} autoComplete={f.autoComplete} inputMode={f.inputMode}
                    value={kontakt[f.key]} maxLength={f.key === 'plz' ? 5 : 100} required={f.pflicht}
                    aria-invalid={kontaktFehler[f.key] ? true : undefined}
                    aria-describedby={kontaktFehler[f.key] ? `${id}-${f.key}-fehler` : undefined}
                    onChange={(e) => setKontakt((k) => ({ ...k, [f.key]: e.target.value }))} />
                  {kontaktFehler[f.key] && <span id={`${id}-${f.key}-fehler`} className={styles.fehler}>{kontaktFehler[f.key]}</span>}
                </div>
              ))}
            </div>
            <div className={styles.infoBox}>
              <strong>Übergabe nach Absprache</strong>
              <span>Wir melden uns per E-Mail und stimmen Ort und Zeit mit Ihnen ab. Abholung, Paketversand und Sammelstelle folgen.</span>
            </div>
          </>
        )}

        {schritt === ABSENDEN && (
          <>
            <p className={styles.hint}>Bitte prüfen Sie Ihre Angaben.</p>
            <div className={styles.summary}>
              <div className={styles.summaryHead}><h3>Geräte ({liste.length})</h3><button type="button" className={styles.linkBtn} onClick={() => gehe(ERGEBNIS)}>Ändern</button></div>
              {liste.length === 0
                ? <p className={styles.fehler}>Bitte erfassen Sie mindestens ein Gerät.</p>
                : <ul className={styles.summaryList}>{liste.map((d, i) => <li key={i}>{geraetName(d.eingabe, i)} – {ERGEBNIS_TEXT[d.r.ergebnis]}</li>)}</ul>}
            </div>
            <div className={styles.summary}>
              <div className={styles.summaryHead}><h3>Kontakt</h3><button type="button" className={styles.linkBtn} onClick={() => gehe(KONTAKT)}>Ändern</button></div>
              <p className={styles.summaryText}>
                {kontakt.name}<br />{kontakt.email}<br />PLZ {kontakt.plz}
                {kontakt.telefon && <><br />{kontakt.telefon}</>}
                {kontakt.organisation && <><br />{kontakt.organisation}</>}
              </p>
            </div>
            <fieldset className={styles.q} id={`${id}-erkl`} tabIndex={-1} aria-describedby={erklFehler ? `${id}-erkl-fehler` : undefined}>
              <legend>Erklärungen</legend>
              <label className={styles.check}>
                <input type="checkbox" checked={erkl.eigentum} onChange={(e) => setErkl((x) => ({ ...x, eigentum: e.target.checked }))} />
                <span>{ERKLAERUNGEN.eigentum}</span>
              </label>
              <label className={styles.check}>
                <input type="checkbox" checked={erkl.daten} onChange={(e) => setErkl((x) => ({ ...x, daten: e.target.checked }))} />
                <span>{ERKLAERUNGEN.daten}</span>
              </label>
              {erklFehler && <span id={`${id}-erkl-fehler`} className={styles.fehler}>Bitte bestätigen Sie beide Erklärungen.</span>}
            </fieldset>
            <p className={styles.hint}>
              Wir verarbeiten Ihre Angaben, um Ihre Spende abzuwickeln. Mehr dazu in unserer{' '}
              <a href="https://weiterwert.de/datenschutz.html">Datenschutzerklärung</a>.
            </p>
            <div className={styles.honeypot} aria-hidden="true">
              <label htmlFor={`${id}-website`}>Website</label>
              <input id={`${id}-website`} tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
            {sendFehler && <p role="alert" className={styles.fehlerBox}>{sendFehler}</p>}
          </>
        )}

        <div className={styles.nav}>
          {schritt > 0 && !(schritt === ERGEBNIS && absenden && !entwurf) && (
            <button type="button" className={styles.back} onClick={() => gehe(schritt - 1)}>Zurück</button>
          )}
          {schritt < letzterPruefschritt && <button type="submit" className="btn">Weiter</button>}
          {schritt === ERGEBNIS && !absenden && (
            <button type="submit" className="btn" disabled={r.ergebnis === 'nichtGeeignet'}>Gerät zur Liste hinzufügen</button>
          )}
          {schritt === ERGEBNIS && absenden && (
            <>
              <button type="button" className={styles.back} onClick={neuesGeraet}>Weiteres Gerät erfassen</button>
              <button type="submit" className="btn" disabled={anzahlNachUebernahme === 0}>Weiter zu Kontakt</button>
            </>
          )}
          {schritt === KONTAKT && <button type="submit" className="btn">Weiter</button>}
          {schritt === ABSENDEN && (
            <button type="submit" className="btn" disabled={sendet || liste.length === 0}>{sendet ? 'Wird gesendet …' : 'Anfrage absenden'}</button>
          )}
        </div>

        {schritt === ERGEBNIS && abschluss}
      </form>
    </div>
  );
}
