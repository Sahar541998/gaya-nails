-- Admin operations: private busy-block notes, service ordering.

alter table public.blocked_times
  add column if not exists note text not null default '';

alter table public.blocked_times
  add column if not exists updated_at timestamptz not null default now();

alter table public.services
  add column if not exists sort_order integer not null default 0;

alter table public.services
  add column if not exists updated_at timestamptz not null default now();

create index if not exists services_active_sort_idx
  on public.services (is_active, sort_order, name);
