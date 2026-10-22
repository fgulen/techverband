import { describe, expect, it } from 'vitest';
import { FEATURES, resolveVisibility } from './features';

describe('resolveVisibility', () => {
  it('shows active features everywhere', () => {
    expect(resolveVisibility('aktiv', 'production')).toBe('show');
    expect(resolveVisibility('aktiv', 'test')).toBe('show');
  });
  it('shows upcoming features disabled everywhere', () => {
    expect(resolveVisibility('demnaechst', 'production')).toBe('show-disabled');
    expect(resolveVisibility('demnaechst', 'test')).toBe('show-disabled');
  });
  it('hides hidden features in production but shows them as draft in test', () => {
    expect(resolveVisibility('verborgen', 'production')).toBe('hide');
    expect(resolveVisibility('verborgen', 'test')).toBe('show-draft');
  });
});

describe('FEATURES (Faz 1 starting values)', () => {
  it('keeps AI, admin and receipts hidden', () => {
    for (const k of ['kiVorpruefung', 'admin', 'spendenbeleg'] as const) expect(FEATURES[k].status).toBe('verborgen');
  });
  it('marks everything else as upcoming', () => {
    const rest = Object.entries(FEATURES).filter(([k]) => !['kiVorpruefung', 'admin', 'spendenbeleg'].includes(k));
    expect(rest.length).toBe(12);
    for (const [, f] of rest) expect(f.status).toBe('demnaechst');
  });
});
