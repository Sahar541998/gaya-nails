-- Foundation schema. RLS is enabled with no public policies.
-- The service-role key bypasses RLS and must stay server-only.
-- Admin/user policies will be added when those flows are implemented.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  phone_e164 text not null unique,
  created_at timestamptz not null default now(),
  constraint customers_phone_e164_format check (phone_e164 ~ '^\+[1-9][0-9]{1,14}$')
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer not null check (price_cents >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id),
  service_id uuid not null references public.services (id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  constraint appointments_time_range check (ends_at > starts_at)
);

create index if not exists appointments_starts_at_idx
  on public.appointments (starts_at);

alter table public.appointments
  add constraint appointments_no_overlap
  exclude using gist (
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status = 'confirmed');

create table if not exists public.portfolio_images (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.business_settings (
  id boolean primary key default true check (id),
  timezone text not null default 'Asia/Jerusalem',
  updated_at timestamptz not null default now()
);

insert into public.business_settings (id)
values (true)
on conflict (id) do nothing;

alter table public.customers enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.portfolio_images enable row level security;
alter table public.business_settings enable row level security;
