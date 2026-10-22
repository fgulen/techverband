import styles from "./SiteFooter.module.css";

// Same wording as the main site: the legal pages are linked only once they are complete.
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <span>© WeiterWert – nicht eingetragener Verein in Gründung</span>
        <span>Impressum und Datenschutz folgen.</span>
      </div>
    </footer>
  );
}
