import type { Metadata } from 'next';
import { FeatureGate } from '@/components/FeatureGate';
import { gatePage } from '@/lib/page-gate';
import { pageTitle } from '@/lib/sitemap';

const TITLE = pageTitle('/admin');
export const metadata: Metadata = { title: TITLE, robots: { index: false } };

const BEREICHE = ['Übersicht', 'Anfragen', 'Inventar', 'Dokumente', 'E-Mail', 'Übergabe', 'Einstellungen'];

export default function AdminPage() {
  gatePage('admin');
  return (
    <>
      <h1>{TITLE}</h1>
      <FeatureGate feature="admin">
        <p>Geplante Bereiche (Faz 3, Admin-MVP):</p>
        <ul>{BEREICHE.map((b) => <li key={b}>{b}</li>)}</ul>
      </FeatureGate>
    </>
  );
}
