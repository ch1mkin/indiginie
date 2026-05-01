-- Platform+ upgrade: richer services, CMS, notifications, ticket chat, profile settings

alter table public.services
  add column if not exists thumbnail_url text,
  add column if not exists detailed_description text,
  add column if not exists required_documents text[] not null default '{}',
  add column if not exists timeline_estimate text;

create table if not exists public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists ticket_messages_ticket_id_idx on public.ticket_messages(ticket_id);

alter table public.ticket_messages enable row level security;

create policy "ticket_messages_select"
on public.ticket_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.tickets t
    where t.id = ticket_messages.ticket_id
      and (
        t.user_id = auth.uid()
        or public.current_role() = 'admin'
        or (
          public.current_role() = 'employee'
          and exists (
            select 1
            from public.user_services us
            where us.user_id = t.user_id
              and us.assigned_employee = auth.uid()
          )
        )
      )
  )
);

create policy "ticket_messages_insert"
on public.ticket_messages
for insert
to authenticated
with check (
  exists (
    select 1
    from public.tickets t
    where t.id = ticket_messages.ticket_id
      and (
        t.user_id = auth.uid()
        or public.current_role() in ('admin', 'employee')
      )
  )
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  category text not null default 'general',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "notifications_select_own"
on public.notifications
for select
to authenticated
using (user_id = auth.uid());

create policy "notifications_insert_staff_or_own"
on public.notifications
for insert
to authenticated
with check (user_id = auth.uid() or public.current_role() in ('admin', 'employee'));

create policy "notifications_update_own"
on public.notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create table if not exists public.landing_content (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.landing_content enable row level security;

create policy "landing_content_public_read"
on public.landing_content
for select
using (true);

create policy "landing_content_admin_write"
on public.landing_content
for all
to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create table if not exists public.landing_testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  quote text not null,
  created_at timestamptz not null default now()
);

alter table public.landing_testimonials enable row level security;

create policy "landing_testimonials_public_read"
on public.landing_testimonials
for select
using (true);

create policy "landing_testimonials_admin_write"
on public.landing_testimonials
for all
to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

insert into public.landing_content(key, value)
values
  ('hero_title', 'Managing your India matters, from anywhere'),
  ('hero_subtitle', 'A unified ledger for NRIs: services, documents, and progress with institutional clarity.'),
  ('hero_primary_cta', 'Explore Services'),
  ('hero_secondary_cta', 'Request Callback')
on conflict (key) do nothing;

insert into public.landing_testimonials(name, role, quote)
select * from (
  values
    ('Vikram Mehta', 'Chief Surgeon, NHS London', 'The platform saved me dozens of hours and prevented compliance errors.'),
    ('Priya S.', 'VP Engineering, Fintech', 'Managing property matters from abroad became actually manageable.')
) as t(name, role, quote)
where not exists (select 1 from public.landing_testimonials);
