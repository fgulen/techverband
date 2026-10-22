import { notFound } from 'next/navigation';
import { getAppEnv } from './env';
import { FEATURES, resolveVisibility, type FeatureKey, type Visibility } from './features';

/** For whole pages behind a feature: 404 when hidden, otherwise the visibility to render with. */
export function gatePage(feature: FeatureKey): Exclude<Visibility, 'hide'> {
  const v = resolveVisibility(FEATURES[feature].status, getAppEnv());
  if (v === 'hide') notFound();
  return v;
}

export function isUsable(feature: FeatureKey): boolean {
  return resolveVisibility(FEATURES[feature].status, getAppEnv()) === 'show';
}
