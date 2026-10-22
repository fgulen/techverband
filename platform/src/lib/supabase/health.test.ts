import { describe, expect, it } from 'vitest';
import { checkSupabase } from './health';

const URL_ = 'https://example.supabase.co';
const okFetch = (status: number) => async (input: RequestInfo | URL, init?: RequestInit) => {
  okFetch.calls.push({ url: String(input), apikey: new Headers(init?.headers).get('apikey') });
  return new Response(null, { status });
};
okFetch.calls = [] as { url: string; apikey: string | null }[];

describe('checkSupabase', () => {
  it('is unconfigured without url or key', async () => {
    expect(await checkSupabase(undefined, 'k', okFetch(200))).toBe('unconfigured');
    expect(await checkSupabase(URL_, '', okFetch(200))).toBe('unconfigured');
  });
  it('is up when the auth health endpoint answers 200 with the key', async () => {
    okFetch.calls = [];
    expect(await checkSupabase(URL_, 'anon-key', okFetch(200))).toBe('up');
    expect(okFetch.calls[0]).toEqual({ url: `${URL_}/auth/v1/health`, apikey: 'anon-key' });
  });
  it('is down on error status or network failure', async () => {
    expect(await checkSupabase(URL_, 'k', okFetch(401))).toBe('down');
    expect(await checkSupabase(URL_, 'k', async () => { throw new Error('offline'); })).toBe('down');
  });
});
