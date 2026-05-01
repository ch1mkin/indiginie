alter table public.user_services
  add column if not exists whatsapp_country_code text,
  add column if not exists whatsapp_number text,
  add column if not exists preferred_call_time time,
  add column if not exists preferred_call_timezone text,
  add column if not exists call_completed boolean not null default false,
  add column if not exists payment_status text not null default 'not_paid' check (payment_status in ('not_paid', 'paid'));

alter table public.documents
  add column if not exists request_id uuid references public.user_services(id) on delete set null;

create index if not exists documents_request_id_idx on public.documents(request_id);
