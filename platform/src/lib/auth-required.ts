/**
 * The auth wall is on for every Vercel preview and for any deployment that has credentials configured.
 * The public test site (test.weiterwert.de) runs without credentials by Fatih's decision.
 */
export function requiresAuth(opts: { vercelEnv: string | undefined; basicAuthUser: string | undefined }): boolean {
  return opts.vercelEnv === 'preview' || Boolean(opts.basicAuthUser);
}
