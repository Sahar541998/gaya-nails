# Database

PostgreSQL is the source of truth. Local Postgres is Docker. Hosted Postgres is Supabase.

Table SQL lives in `db/`, one file per table (plus extensions and `007_appointment_domain.sql`). Keep those files safe to rerun (`if not exists`, guarded constraints).

Docker applies `db/` on first boot. Vercel applies the same files during `npm run build` (`scripts/apply-schema.mjs`) using `DATABASE_URL`. That env var must be available at build time. `supabase/migrations/0002_storage.sql` runs only when the `storage` schema exists.

`npm run db:apply` applies schema without building. If Postgres was created before later files existed, run that (or `docker compose down -v` and start fresh).

Busy periods live in `public.blocked_times` (not a second availability table). Overlapping busy blocks are allowed; both are considered by `getAvailableSlots`. Private `note` is admin-only.

Customers use an internal UUID primary key. Phone (`phone_e164`) is unique, never the primary key.

Confirmed appointments must not overlap (`appointments_no_overlap`). Do not weaken that constraint.

Enable RLS on hosted Supabase. Table access from the Next.js server goes through `DATABASE_URL` and `src/da`. Do not query tables from the browser.

Supabase JS clients in `src/lib/supabase/**` are for Auth and Storage, not table CRUD.

Never put `DATABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` in `NEXT_PUBLIC_*`.
