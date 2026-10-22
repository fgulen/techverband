import { connection } from 'next/server';
import { checkSupabase } from '@/lib/supabase/health';

export async function GET() {
  await connection(); // always evaluate at request time, never prerender
  const db = await checkSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return Response.json({ ok: db === 'up', db }, { status: db === 'up' ? 200 : 503 });
}
