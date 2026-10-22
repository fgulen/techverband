import styles from './StatusBadge.module.css';

export function StatusBadge({ kind }: { kind: 'demnaechst' | 'entwurf' }) {
  return kind === 'demnaechst'
    ? <span className={`${styles.badge} ${styles.soon}`}>demnächst</span>
    : <span className={`${styles.badge} ${styles.draft}`}>Entwurf – nur Testumgebung</span>;
}
