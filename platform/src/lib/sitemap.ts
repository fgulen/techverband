import type { FeatureKey } from './features';

export type SitemapEntry = { path: string; title: string; feature?: FeatureKey; germanOnly?: boolean };

// Slim Faz 1 set; the full sitemap (spec §8) is added page by page.
export const SITEMAP: SitemapEntry[] = [
  { path: '/', title: 'Startseite' },
  { path: '/spenden', title: 'Laptop oder Tablet spenden', feature: 'spenden', germanOnly: true },
  { path: '/annahmekriterien', title: 'Annahmekriterien', germanOnly: true },
  { path: '/geraetepartnerschaft', title: 'Gerätepartnerschaft', feature: 'geraetepartnerschaft' },
  { path: '/impressum', title: 'Impressum', germanOnly: true },
  { path: '/datenschutz', title: 'Datenschutzerklärung', germanOnly: true },
  { path: '/admin', title: 'Verwaltung', feature: 'admin', germanOnly: true },
];

export function pageTitle(path: string): string {
  const e = SITEMAP.find((p) => p.path === path);
  if (!e) throw new Error(`Unknown page ${path}`);
  return e.title;
}
