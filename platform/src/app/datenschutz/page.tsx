import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAppEnv } from '@/lib/env';
import { pageTitle } from '@/lib/sitemap';

const TITLE = pageTitle('/datenschutz');
export const metadata: Metadata = { title: TITLE };

export default function DatenschutzPage() {
  // Empty stub: only visible in the test environment until the legal text is final.
  if (getAppEnv() !== 'test') notFound();
  return (
    <>
      <h1>{TITLE}</h1>
      <p>Der Text wird aus der bestehenden Website übernommen (<code>datenschutz.html</code>) und um die Plattform-Dienste (Supabase) ergänzt.</p>
    </>
  );
}
