alter table public.profiles
  add column if not exists alternate_phone text,
  add column if not exists time_zone text,
  add column if not exists preferred_contact_method text,
  add column if not exists date_of_birth date,
  add column if not exists nationality text,
  add column if not exists passport_number text,
  add column if not exists india_address text,
  add column if not exists property_location text,
  add column if not exists service_purpose text,
  add column if not exists profile_completed_at timestamptz;

create table if not exists public.user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  statement text not null,
  version text not null default 'v1',
  metadata jsonb not null default '{}'::jsonb,
  accepted_at timestamptz not null default now()
);

alter table public.user_consents enable row level security;

create policy "consents_own_select"
on public.user_consents
for select
to authenticated
using (auth.uid() = user_id);

create policy "consents_own_insert"
on public.user_consents
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "consents_admin_select_all"
on public.user_consents
for select
to authenticated
using (public.current_role() = 'admin');
