import { getAppEnv } from '@/lib/env';

export function TestBanner() {
  if (getAppEnv() !== 'test') return null;
  return (
    <div role="status" style={{ background: 'var(--brand-sun)', color: 'var(--ink)', textAlign: 'center', fontWeight: 700, padding: '6px 16px', fontSize: '0.9rem' }}>
      Testumgebung – keine echten Spenden
    </div>
  );
}
