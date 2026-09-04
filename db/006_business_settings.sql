create table if not exists public.business_settings (
  id boolean primary key default true check (id),
  timezone text not null default 'Asia/Jerusalem',
  updated_at timestamptz not null default now()
);

insert into public.business_settings (id)
values (true)
on conflict (id) do nothing;

alter table public.business_settings enable row level security;
