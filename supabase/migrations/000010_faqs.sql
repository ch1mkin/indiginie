create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.faqs enable row level security;

create policy "faqs_public_read"
on public.faqs
for select
using (true);

create policy "faqs_admin_write"
on public.faqs
for all
to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');
