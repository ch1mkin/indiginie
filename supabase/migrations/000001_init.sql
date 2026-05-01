-- Indiginie NRI Solutions — core schema, RLS, storage, and profile bootstrap
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin', 'employee')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid();
$$;

grant execute on function public.current_role() to authenticated;

create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.current_role() = 'admin');

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_update_admin"
on public.profiles
for update
to authenticated
using (public.current_role() = 'admin');

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Services catalog
-- ---------------------------------------------------------------------------
create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  price_type text not null check (price_type in ('fixed', 'custom')),
  created_at timestamptz not null default now()
);

alter table public.services enable row level security;

create policy "services_select_public"
on public.services
for select
using (true);

create policy "services_write_admin"
on public.services
for insert
to authenticated
with check (public.current_role() = 'admin');

create policy "services_update_admin"
on public.services
for update
to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy "services_delete_admin"
on public.services
for delete
to authenticated
using (public.current_role() = 'admin');

-- ---------------------------------------------------------------------------
-- User service requests
-- ---------------------------------------------------------------------------
create table public.user_services (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'active', 'completed')),
  assigned_employee uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create index user_services_user_id_idx on public.user_services (user_id);
create index user_services_assigned_idx on public.user_services (assigned_employee);

alter table public.user_services enable row level security;

create policy "user_services_select"
on public.user_services
for select
to authenticated
using (
  user_id = auth.uid()
  or public.current_role() = 'admin'
  or (public.current_role() = 'employee' and assigned_employee = auth.uid())
);

create policy "user_services_insert_own"
on public.user_services
for insert
to authenticated
with check (user_id = auth.uid());

create policy "user_services_update_admin"
on public.user_services
for update
to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy "user_services_update_assigned_employee"
on public.user_services
for update
to authenticated
using (public.current_role() = 'employee' and assigned_employee = auth.uid())
with check (public.current_role() = 'employee' and assigned_employee = auth.uid());

-- ---------------------------------------------------------------------------
-- Documents metadata (files live in Storage bucket "documents")
-- ---------------------------------------------------------------------------
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  service_id uuid not null references public.services (id) on delete cascade,
  type text not null check (type in ('upload', 'output')),
  file_url text not null,
  created_at timestamptz not null default now()
);

create index documents_user_service_idx on public.documents (user_id, service_id);

alter table public.documents enable row level security;

create policy "documents_select"
on public.documents
for select
to authenticated
using (
  user_id = auth.uid()
  or public.current_role() = 'admin'
  or (
    public.current_role() = 'employee'
    and exists (
      select 1
      from public.user_services us
      where us.user_id = documents.user_id
        and us.service_id = documents.service_id
        and us.assigned_employee = auth.uid()
    )
  )
);

create policy "documents_insert_uploads"
on public.documents
for insert
to authenticated
with check (user_id = auth.uid() and type = 'upload');

create policy "documents_insert_outputs_admin"
on public.documents
for insert
to authenticated
with check (
  type = 'output'
  and public.current_role() = 'admin'
);

create policy "documents_insert_outputs_employee"
on public.documents
for insert
to authenticated
with check (
  type = 'output'
  and public.current_role() = 'employee'
  and exists (
    select 1
    from public.user_services us
    where us.user_id = documents.user_id
      and us.service_id = documents.service_id
      and us.assigned_employee = auth.uid()
  )
);

-- ---------------------------------------------------------------------------
-- Support tickets
-- ---------------------------------------------------------------------------
create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

alter table public.tickets enable row level security;

create policy "tickets_select"
on public.tickets
for select
to authenticated
using (
  user_id = auth.uid()
  or public.current_role() = 'admin'
  or (
    public.current_role() = 'employee'
    and exists (
      select 1
      from public.user_services us
      where us.user_id = tickets.user_id
        and us.assigned_employee = auth.uid()
    )
  )
);

create policy "tickets_insert_own"
on public.tickets
for insert
to authenticated
with check (user_id = auth.uid());

create policy "tickets_update_owner"
on public.tickets
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "tickets_update_staff"
on public.tickets
for update
to authenticated
using (public.current_role() in ('admin', 'employee'))
with check (public.current_role() in ('admin', 'employee'));

-- ---------------------------------------------------------------------------
-- Callback requests
-- ---------------------------------------------------------------------------
create table public.callback_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'contacted')),
  created_at timestamptz not null default now()
);

alter table public.callback_requests enable row level security;

create policy "callback_select"
on public.callback_requests
for select
to authenticated
using (user_id = auth.uid() or public.current_role() = 'admin');

create policy "callback_insert_own"
on public.callback_requests
for insert
to authenticated
with check (user_id = auth.uid());

create policy "callback_update_admin"
on public.callback_requests
for update
to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- ---------------------------------------------------------------------------
-- Storage: private bucket "documents", paths:
--   {user_id}/{service_id}/uploads/{filename}
--   {user_id}/{service_id}/outputs/{filename}
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "documents_storage_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'documents'
  and (
    split_part(name, '/', 1) = auth.uid()::text
    or public.current_role() = 'admin'
    or (
      public.current_role() = 'employee'
      and exists (
        select 1
        from public.user_services us
        where us.user_id::text = split_part(name, '/', 1)
          and us.service_id::text = split_part(name, '/', 2)
          and us.assigned_employee = auth.uid()
      )
    )
  )
);

create policy "documents_storage_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'documents'
  and (
    split_part(name, '/', 1) = auth.uid()::text
    or public.current_role() = 'admin'
    or (
      public.current_role() = 'employee'
      and exists (
        select 1
        from public.user_services us
        where us.user_id::text = split_part(name, '/', 1)
          and us.service_id::text = split_part(name, '/', 2)
          and us.assigned_employee = auth.uid()
      )
    )
  )
);

create policy "documents_storage_delete_admin"
on storage.objects
for delete
to authenticated
using (bucket_id = 'documents' and public.current_role() = 'admin');
