import type { Metadata } from 'next';
import { FeatureGate } from '@/components/FeatureGate';
import { gatePage } from '@/lib/page-gate';
import { pageTitle } from '@/lib/sitemap';

const TITLE = pageTitle('/geraetepartnerschaft');
export const metadata: Metadata = { title: TITLE };

export default function GeraetepartnerschaftPage() {
  gatePage('geraetepartnerschaft');
  return (
    <>
      <h1>{TITLE}</h1>
      <FeatureGate feature="geraetepartnerschaft">
        <p className="lead">
          Für Unternehmen und Organisationen, die regelmäßig Geräte abgeben möchten. Jede Lieferung prüfen wir einzeln; eine automatische Annahme gibt es nicht.
        </p>
      </FeatureGate>
    </>
  );
}
