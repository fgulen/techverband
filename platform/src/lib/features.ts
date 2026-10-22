import type { AppEnv } from './env';

export type FeatureStatus = 'aktiv' | 'demnaechst' | 'verborgen';
export type Visibility = 'show' | 'show-disabled' | 'show-draft' | 'hide';

export type FeatureKey =
  | 'spenden' | 'ocr' | 'uebergabeAbsprache' | 'abholung' | 'paketversand' | 'sammelstelle'
  | 'kiVorpruefung' | 'konto' | 'statusUpdates' | 'newsletter' | 'geraetepartnerschaft'
  | 'geraetBeantragen' | 'freiwilligTransport' | 'spendenbeleg' | 'admin';

// Faz 1: nothing works yet, so everything is "demnaechst"; later phases switch features to "aktiv".
export const FEATURES: Record<FeatureKey, { status: FeatureStatus; label: string }> = {
  spenden: { status: 'aktiv', label: 'Laptop oder Tablet spenden' },
  ocr: { status: 'demnaechst', label: 'Typenschild fotografieren' },
  uebergabeAbsprache: { status: 'demnaechst', label: 'Übergabe nach Absprache' },
  abholung: { status: 'demnaechst', label: 'Abholung' },
  paketversand: { status: 'demnaechst', label: 'Paketversand' },
  sammelstelle: { status: 'demnaechst', label: 'Sammelstelle' },
  kiVorpruefung: { status: 'verborgen', label: 'KI-Vorprüfung' },
  konto: { status: 'demnaechst', label: 'Mein Konto' },
  statusUpdates: { status: 'demnaechst', label: 'Status-Updates' },
  newsletter: { status: 'demnaechst', label: 'Newsletter' },
  geraetepartnerschaft: { status: 'demnaechst', label: 'Gerätepartnerschaft' },
  geraetBeantragen: { status: 'demnaechst', label: 'Gerät beantragen' },
  freiwilligTransport: { status: 'demnaechst', label: 'Freiwillig transportieren' },
  spendenbeleg: { status: 'verborgen', label: 'Spendenbeleg' },
  admin: { status: 'verborgen', label: 'Verwaltung' },
};

export function resolveVisibility(status: FeatureStatus, env: AppEnv): Visibility {
  if (status === 'aktiv') return 'show';
  if (status === 'demnaechst') return 'show-disabled';
  return env === 'test' ? 'show-draft' : 'hide';
}
