alter table public.services
  add column if not exists short_description text not null default '';

alter table public.business_settings
  add column if not exists studio_name text not null default 'Gaya';

alter table public.business_settings
  add column if not exists location_label text not null default '';

alter table public.business_settings
  add column if not exists instagram_url text not null default '';

insert into public.services (name, duration_minutes, price_cents, is_active, short_description)
select 'Gel', 60, 12000, true, 'Classic clean gel manicure'
where not exists (select 1 from public.services where name = 'Gel');

insert into public.services (name, duration_minutes, price_cents, is_active, short_description)
select 'Builder Gel', 90, 15000, true, 'Stronger, longer-lasting structure'
where not exists (select 1 from public.services where name = 'Builder Gel');

insert into public.services (name, duration_minutes, price_cents, is_active, short_description)
select 'Nail Art', 120, 17000, true, 'Custom designs'
where not exists (select 1 from public.services where name = 'Nail Art');
