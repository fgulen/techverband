import Link from "next/link";
import styles from "./SiteHeader.module.css";

const NAV = [
  { href: "/spenden", label: "Gerät spenden" },
  { href: "/annahmekriterien", label: "Annahmekriterien" },
  { href: "/geraetepartnerschaft", label: "Gerätepartnerschaft" },
];

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Link href="/" className={styles.brand}>
          <img src="/logo-mark.svg" alt="" width={36} height={36} />
          <span>Weiter<span className={styles.accent}>Wert</span></span>
        </Link>
        <nav aria-label="Hauptmenü" className={styles.nav}>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>{n.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
