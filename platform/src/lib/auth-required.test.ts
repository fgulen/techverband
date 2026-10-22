import { describe, expect, it } from 'vitest';
import { requiresAuth } from './auth-required';

// Fatih's decision (2026-10-22): the test site (test.weiterwert.de) is open to everyone;
// the auth wall stays only where credentials are configured and on every Vercel preview.
describe('requiresAuth', () => {
  it('leaves the public test environment open when no credentials are configured', () => {
    expect(requiresAuth({ vercelEnv: 'production', basicAuthUser: undefined })).toBe(false);
    expect(requiresAuth({ vercelEnv: undefined, basicAuthUser: '' })).toBe(false);
  });
  it('protects any Vercel preview', () => {
    expect(requiresAuth({ vercelEnv: 'preview', basicAuthUser: undefined })).toBe(true);
  });
  it('protects a deployment that has credentials configured', () => {
    expect(requiresAuth({ vercelEnv: 'production', basicAuthUser: 'ww' })).toBe(true);
    expect(requiresAuth({ vercelEnv: undefined, basicAuthUser: 'ww' })).toBe(true);
  });
});
