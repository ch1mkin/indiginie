create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

create policy "app_settings_admin_read"
on public.app_settings
for select
to authenticated
using (public.current_role() = 'admin');

create policy "app_settings_admin_write"
on public.app_settings
for all
to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

insert into public.app_settings (key, value)
values ('enable_pdf_watermark', 'true')
on conflict (key) do nothing;
