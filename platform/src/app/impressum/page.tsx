import type { Metadata } from 'next';
import { pageTitle } from '@/lib/sitemap';

const TITLE = pageTitle('/impressum');
export const metadata: Metadata = { title: TITLE };

export default function ImpressumPage() {
  return (
    <>
      <h1>{TITLE}</h1>
      <p>Der Text wird aus der bestehenden Website übernommen (<code>impressum.html</code>), sobald er vollständig ist.</p>
    </>
  );
}
