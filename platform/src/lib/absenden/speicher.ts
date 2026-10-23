import { getAppEnv } from '@/lib/env';

export type Gespeichert = { vorgangsnummer: string; neu: boolean; outboxId: string | null };

export type Speicher = {
  name: 'supabase' | 'test-attrappe';
  speichere(payload: Record<string, unknown>): Promise<Gespeichert>;
  markiere(outboxId: string, ok: boolean, fehler: string | null): Promise<void>;
};

/** Saving is switched on by the server-only secret key. Without it, production keeps the e-mail fallback. */
export function speicherKonfiguriert(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

async function rpc<T>(fn: string, body: unknown): Promise<T> {
  const key = process.env.SUPABASE_SECRET_KEY!;
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: key,
      // A legacy service_role JWT also has to be sent as bearer token; new sb_secret_ keys must not be.
      ...(key.startsWith('eyJ') ? { Authorization: `Bearer ${key}` } : {}),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Supabase ${fn}: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

const supabase: Speicher = {
  name: 'supabase',
  async speichere(payload) {
    const r = await rpc<{ vorgangsnummer: string; neu: boolean; outbox_id: string | null }>('submit_donation', { payload });
    return { vorgangsnummer: r.vorgangsnummer, neu: r.neu, outboxId: r.outbox_id ?? null };
  },
  async markiere(outboxId, ok, fehler) {
    await rpc('mark_notification', { outbox_id: outboxId, ok, fehler });
  },
};

// Test environment only: keeps requests in memory so the flow can be tried without a database.
const attrappe: Speicher = (() => {
  const nachSchluessel = new Map<string, string>();
  return {
    name: 'test-attrappe' as const,
    async speichere(payload) {
      const key = String(payload.idempotency_key);
      const vorhanden = nachSchluessel.get(key);
      if (vorhanden) return { vorgangsnummer: vorhanden, neu: false, outboxId: null };
      const nr = `WW-${new Date().getUTCFullYear()}-${String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')}`;
      nachSchluessel.set(key, nr);
      return { vorgangsnummer: nr, neu: true, outboxId: null };
    },
    async markiere() {},
  };
})();

// The test environment never writes to the real database, even if the key is in .env.local.
export function waehleSpeicher(): Speicher | null {
  if (getAppEnv() === 'test') return attrappe;
  return speicherKonfiguriert() ? supabase : null;
}

/** Whether the page offers the contact and submit steps. */
export function absendenMoeglich(): boolean {
  return waehleSpeicher() !== null;
}
