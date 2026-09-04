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

do $constraint$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_no_overlap'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_no_overlap
      exclude using gist (
        tstzrange(starts_at, ends_at, '[)') with &&
      )
      where (status = 'confirmed');
  end if;
end
$constraint$;

alter table public.appointments enable row level security;
