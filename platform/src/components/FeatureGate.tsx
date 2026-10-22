import type { ReactNode } from 'react';
import { getAppEnv } from '@/lib/env';
import { FEATURES, resolveVisibility, type FeatureKey } from '@/lib/features';
import { StatusBadge } from './StatusBadge';

/** Renders children according to the feature's status: live, disabled ("demnächst"), draft (test only) or not at all. */
export function FeatureGate({ feature, children }: { feature: FeatureKey; children: ReactNode }) {
  const v = resolveVisibility(FEATURES[feature].status, getAppEnv());
  if (v === 'hide') return null;
  if (v === 'show') return <>{children}</>;
  return (
    <div aria-disabled={v === 'show-disabled' || undefined} data-visibility={v}>
      <StatusBadge kind={v === 'show-disabled' ? 'demnaechst' : 'entwurf'} />
      {children}
    </div>
  );
}
