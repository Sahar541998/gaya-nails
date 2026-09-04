create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  phone_e164 text not null unique,
  created_at timestamptz not null default now(),
  constraint customers_phone_e164_format check (phone_e164 ~ '^\+[1-9][0-9]{1,14}$')
);

alter table public.customers enable row level security;
