import type { AppEnv } from './env';

/**
 * Fail closed: the auth wall is on for the test environment, for every Vercel preview,
 * and for any deployment that has credentials configured — so one wrong env var cannot open the test site.
 */
export function requiresAuth(opts: { appEnv: AppEnv; vercelEnv: string | undefined; basicAuthUser: string | undefined }): boolean {
  return opts.appEnv === 'test' || opts.vercelEnv === 'preview' || Boolean(opts.basicAuthUser);
}
