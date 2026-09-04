-- Appointment domain: snapshots, booking hours, blocked times, verified booking sessions.

alter table public.business_settings
  add column if not exists booking_enabled boolean not null default true;

alter table public.business_settings
  add column if not exists slot_interval_minutes integer not null default 30
    check (slot_interval_minutes > 0);

alter table public.business_settings
  add column if not exists weekly_hours jsonb not null default '{
    "0":{"open":"09:00","close":"18:00"},
    "1":{"open":"09:00","close":"18:00"},
    "2":{"open":"09:00","close":"18:00"},
    "3":{"open":"09:00","close":"18:00"},
    "4":{"open":"09:00","close":"18:00"},
    "5":{"open":"09:00","close":"14:00"}
  }'::jsonb;

alter table public.appointments
  add column if not exists service_name_at_booking text not null default '';

alter table public.appointments
  add column if not exists price_cents_at_booking integer not null default 0
    check (price_cents_at_booking >= 0);

create table if not exists public.blocked_times (
  id uuid primary key default gen_random_uuid(),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint blocked_times_range check (ends_at > starts_at)
);

create index if not exists blocked_times_range_idx
  on public.blocked_times (starts_at, ends_at);

alter table public.blocked_times enable row level security;

create table if not exists public.booking_sessions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id),
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists booking_sessions_customer_id_idx
  on public.booking_sessions (customer_id);

alter table public.booking_sessions enable row level security;
