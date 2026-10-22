import Link from "next/link";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <span>© WeiterWert – nicht eingetragener Verein in Gründung</span>
        <nav aria-label="Rechtliches" className={styles.nav}>
          <Link href="/impressum">Impressum</Link>
          <Link href="/datenschutz">Datenschutzerklärung</Link>
        </nav>
      </div>
    </footer>
  );
}
