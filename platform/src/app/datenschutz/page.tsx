import type { Metadata } from 'next';
import { pageTitle } from '@/lib/sitemap';

const TITLE = pageTitle('/datenschutz');
export const metadata: Metadata = { title: TITLE };

export default function DatenschutzPage() {
  return (
    <>
      <h1>{TITLE}</h1>
      <p>Der Text wird aus der bestehenden Website übernommen (<code>datenschutz.html</code>) und um die Plattform-Dienste (Supabase) ergänzt.</p>
    </>
  );
}
