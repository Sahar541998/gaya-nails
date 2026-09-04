alter table public.customers
  add column if not exists display_name text not null default '';

alter table public.customers
  add column if not exists email text not null default '';

alter table public.appointments
  add column if not exists note text not null default '';
