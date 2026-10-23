-- Spendenanfrage (Faz 2): contact, request, devices, notification outbox.
-- Run once in the Supabase SQL editor. Tables are closed to the public API (RLS on, no policies);
-- only the server, with the secret key, may call the two functions below.

create table if not exists public.contact (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  plz text not null,
  telefon text,
  organisation text,
  created_at timestamptz not null default now()
);

create table if not exists public.donation_request (
  id uuid primary key default gen_random_uuid(),
  vorgangsnummer text not null unique,
  idempotency_key uuid not null unique,
  contact_id uuid not null references public.contact(id) on delete cascade,
  status text not null default 'neu',
  regel_version text not null,
  erklaerung_version text not null,
  erklaerung_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.donation_device (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.donation_request(id) on delete cascade,
  position int not null,
  typ text not null,
  marke text,
  modell text,
  angaben jsonb not null,
  ergebnis text not null,
  gruende text[] not null default '{}'
);

create table if not exists public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.donation_request(id) on delete cascade,
  art text not null,
  empfaenger text,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  versuche int not null default 0,
  letzter_fehler text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

alter table public.contact enable row level security;
alter table public.donation_request enable row level security;
alter table public.donation_device enable row level security;
alter table public.notification_outbox enable row level security;
revoke all on public.contact, public.donation_request, public.donation_device, public.notification_outbox from anon, authenticated;

create or replace function public.submit_donation(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  schluessel uuid := (payload->>'idempotency_key')::uuid;
  vorhanden text;
  kid uuid;
  rid uuid;
  oid uuid;
  nr text;
  g jsonb;
  pos int := 0;
begin
  select vorgangsnummer into vorhanden from donation_request where idempotency_key = schluessel;
  if vorhanden is not null then
    return jsonb_build_object('vorgangsnummer', vorhanden, 'neu', false, 'outbox_id', null);
  end if;

  insert into contact (name, email, plz, telefon, organisation)
  values (
    payload->'kontakt'->>'name', payload->'kontakt'->>'email', payload->'kontakt'->>'plz',
    nullif(payload->'kontakt'->>'telefon', ''), nullif(payload->'kontakt'->>'organisation', '')
  )
  returning id into kid;

  loop
    nr := 'WW-' || to_char(now() at time zone 'utc', 'YYYY') || '-' || lpad(floor(random() * 1000000)::int::text, 6, '0');
    exit when not exists (select 1 from donation_request where vorgangsnummer = nr);
  end loop;

  insert into donation_request (vorgangsnummer, idempotency_key, contact_id, regel_version, erklaerung_version, erklaerung_hash)
  values (nr, schluessel, kid, payload->>'regel_version', payload->>'erklaerung_version', payload->>'erklaerung_hash')
  returning id into rid;

  for g in select * from jsonb_array_elements(payload->'geraete') loop
    pos := pos + 1;
    insert into donation_device (request_id, position, typ, marke, modell, angaben, ergebnis, gruende)
    values (
      rid, pos, g->>'typ', nullif(g->>'marke', ''), nullif(g->>'modell', ''), g->'angaben', g->>'ergebnis',
      array(select jsonb_array_elements_text(g->'gruende'))
    );
  end loop;

  insert into notification_outbox (request_id, art, empfaenger)
  values (rid, 'intern_neue_anfrage', payload->>'mail_to')
  returning id into oid;

  return jsonb_build_object('vorgangsnummer', nr, 'neu', true, 'outbox_id', oid);
exception when unique_violation then
  -- Two clicks at the same moment: the second one returns the first one's number.
  select vorgangsnummer into vorhanden from donation_request where idempotency_key = schluessel;
  if vorhanden is not null then
    return jsonb_build_object('vorgangsnummer', vorhanden, 'neu', false, 'outbox_id', null);
  end if;
  raise;
end;
$$;

create or replace function public.mark_notification(outbox_id uuid, ok boolean, fehler text)
returns void
language sql
security definer
set search_path = public
as $$
  update notification_outbox
  set status = case when ok then 'sent' else 'failed' end,
      versuche = versuche + 1,
      letzter_fehler = fehler,
      sent_at = case when ok then now() else sent_at end
  where id = outbox_id;
$$;

revoke execute on function public.submit_donation(jsonb) from public, anon, authenticated;
revoke execute on function public.mark_notification(uuid, boolean, text) from public, anon, authenticated;
grant execute on function public.submit_donation(jsonb) to service_role;
grant execute on function public.mark_notification(uuid, boolean, text) to service_role;
