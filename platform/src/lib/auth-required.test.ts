import { describe, expect, it } from 'vitest';
import { requiresAuth } from './auth-required';

describe('requiresAuth', () => {
  it('protects the test environment', () => {
    expect(requiresAuth({ appEnv: 'test', vercelEnv: undefined, basicAuthUser: undefined })).toBe(true);
  });
  it('protects any Vercel preview even if APP_ENV is missing or misspelled', () => {
    expect(requiresAuth({ appEnv: 'production', vercelEnv: 'preview', basicAuthUser: undefined })).toBe(true);
  });
  it('protects a deployment that has credentials configured even if APP_ENV is wrong', () => {
    expect(requiresAuth({ appEnv: 'production', vercelEnv: 'production', basicAuthUser: 'ww' })).toBe(true);
  });
  it('leaves a real production build without credentials open', () => {
    expect(requiresAuth({ appEnv: 'production', vercelEnv: 'production', basicAuthUser: undefined })).toBe(false);
    expect(requiresAuth({ appEnv: 'production', vercelEnv: undefined, basicAuthUser: '' })).toBe(false);
  });
});
