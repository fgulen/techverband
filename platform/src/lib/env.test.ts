import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAppEnv } from './env';

afterEach(() => vi.unstubAllEnvs());

describe('getAppEnv', () => {
  it('is test only when explicitly set to test', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_ENV', 'test');
    expect(getAppEnv()).toBe('test');
  });
  it('defaults to production when env unknown', () => {
    vi.stubEnv('NEXT_PUBLIC_APP_ENV', '');
    expect(getAppEnv()).toBe('production');
    vi.stubEnv('NEXT_PUBLIC_APP_ENV', 'staging');
    expect(getAppEnv()).toBe('production');
    vi.stubEnv('NEXT_PUBLIC_APP_ENV', 'TEST');
    expect(getAppEnv()).toBe('production');
  });
});
