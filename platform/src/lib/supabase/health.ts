export type DbHealth = 'up' | 'down' | 'unconfigured';

/** Pings Supabase's auth health endpoint with the public key. Never throws. */
export async function checkSupabase(url: string | undefined, key: string | undefined, fetchFn: typeof fetch = fetch): Promise<DbHealth> {
  if (!url || !key) return 'unconfigured';
  try {
    const res = await fetchFn(`${url}/auth/v1/health`, { headers: { apikey: key }, cache: 'no-store' });
    return res.ok ? 'up' : 'down';
  } catch {
    return 'down';
  }
}
