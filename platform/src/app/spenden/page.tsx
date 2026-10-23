import type { Metadata } from 'next';
import { FeatureGate } from '@/components/FeatureGate';
import { StatusBadge } from '@/components/StatusBadge';
import { FEATURES, type FeatureKey } from '@/lib/features';
import { gatePage, isUsable } from '@/lib/page-gate';
import { pageTitle } from '@/lib/sitemap';
import styles from './spenden.module.css';
import { absendenMoeglich } from '@/lib/absenden/speicher';
import { GeraeteCheck } from './GeraeteCheck';

const TITLE = pageTitle('/spenden');
export const metadata: Metadata = { title: TITLE };

const SCHRITTE = [
  ['Einstieg', 'Welche Geräte wir annehmen, wie es abläuft, Daten sichern und Sperren lösen.'],
  ['Geräte erfassen', 'Laptop oder Tablet, mehrere Geräte möglich. „Weiß ich nicht“ ist immer erlaubt.'],
  ['Vorprüfung', 'Sofortige Einschätzung nach den veröffentlichten Annahmekriterien.'],
  ['Kontakt und Übergabe', 'Name, E-Mail und Postleitzahl. Die Übergabe stimmen wir mit Ihnen ab.'],
  ['Erklärungen', 'Das Gerät gehört Ihnen und ist nicht geleast. Ihre Daten haben Sie gesichert.'],
  ['Zusammenfassung', 'Alle Angaben noch einmal prüfen und ändern.'],
  ['Absenden', 'Sie erhalten eine Vorgangsnummer.'],
  ['Bestätigung', 'Freiwillig: Status-Updates zu Ihrem Gerät, Neuigkeiten oder ein Konto.'],
] as const;

const UEBERGABE: FeatureKey[] = ['uebergabeAbsprache', 'abholung', 'paketversand', 'sammelstelle'];

export default function SpendenPage() {
  gatePage('spenden');
  return (
    <>
      <h1>{TITLE}</h1>
      <p className="lead">
        Ohne Konto, in wenigen Minuten. Bevor Sie etwas verschicken, sehen Sie, ob Ihr Gerät voraussichtlich passt.
      </p>
      <FeatureGate feature="spenden">
        {absendenMoeglich() ? <GeraeteCheck absenden /> : <GeraeteCheck abschluss={
          <details className={styles.more}>
            <summary>Wie geht es nach der Vorprüfung weiter?</summary>
            <p>Kontaktdaten, Übergabe und Absenden folgen in Kürze. Bis dahin schreiben Sie uns gern an <a href="mailto:weiterwert@gmail.com">weiterwert@gmail.com</a>.</p>
            <ol className={styles.steps} aria-label="Ablauf der Spende">
              {SCHRITTE.map(([titel, text]) => (
                <li key={titel} className={styles.step}>
                  <strong>{titel}</strong>
                  <span>{text}</span>
                </li>
              ))}
            </ol>

            <fieldset className={styles.handover}>
              <legend>Übergabe</legend>
              {UEBERGABE.map((key) => {
                const usable = isUsable(key);
                return (
                  <label key={key} className={styles.option}>
                    <input type="radio" name="uebergabe" value={key} disabled={!usable} />
                    <span>{FEATURES[key].label}</span>
                    {!usable && <StatusBadge kind="demnaechst" />}
                  </label>
                );
              })}
            </fieldset>
          </details>
        } />}
      </FeatureGate>
    </>
  );
}
