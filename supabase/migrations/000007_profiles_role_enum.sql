do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('user', 'admin', 'employee');
  end if;
end $$;

do $$
declare
  c record;
begin
  for c in
    select conname
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table public.profiles drop constraint if exists %I', c.conname);
  end loop;
end $$;

alter table public.profiles
  alter column role drop default;

alter table public.profiles
  alter column role type public.app_role
  using role::text::public.app_role;

alter table public.profiles
  alter column role set default 'user'::public.app_role;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select p.role::text
  from public.profiles p
  where p.id = auth.uid();
$$;
