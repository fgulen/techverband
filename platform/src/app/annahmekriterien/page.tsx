import type { Metadata } from 'next';
import { FUER_ALLE_GERAETE, KRITERIEN, KRITERIEN_VERSION } from '@/lib/annahmekriterien';
import { pageTitle } from '@/lib/sitemap';
import styles from './kriterien.module.css';

const TITLE = pageTitle('/annahmekriterien');
export const metadata: Metadata = { title: TITLE };

export default function AnnahmekriterienPage() {
  return (
    <>
      <h1>{TITLE}</h1>
      <p><span className={styles.version}>Entwurf {KRITERIEN_VERSION}</span></p>
      <p className="lead">
        Diese Werte sind Ziele, keine starren Grenzen. Die Vorprüfung ist eine Einschätzung; endgültig entscheiden wir erst nach der technischen Prüfung des Geräts.
      </p>
      <h2>Für alle Geräte</h2>
      <ul>{FUER_ALLE_GERAETE.map((t) => <li key={t}>{t}</li>)}</ul>
      {KRITERIEN.map((tab) => (
        <section key={tab.geraet}>
          <h2>{tab.geraet}</h2>
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Kriterium</th>
                  <th scope="col">Vorläufig geeignet</th>
                  <th scope="col">Manuelle Prüfung</th>
                  <th scope="col">Voraussichtlich nicht geeignet</th>
                </tr>
              </thead>
              <tbody>
                {tab.zeilen.map((z) => (
                  <tr key={z.kriterium}>
                    <th scope="row">{z.kriterium}</th>
                    <td>{z.geeignet}</td>
                    <td>{z.pruefung}</td>
                    <td>{z.nichtGeeignet ?? '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}
