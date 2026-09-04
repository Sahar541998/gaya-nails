# Database

PostgreSQL is the source of truth. Local Postgres is Docker. Hosted Postgres is Supabase.

Table SQL lives in `db/`, one file per table (plus extensions and `007_appointment_domain.sql`). Docker applies that folder on first boot. Apply the same files to Supabase (SQL editor or CLI), then `supabase/migrations/0002_storage.sql` for the portfolio bucket.

If Postgres was created before `007_appointment_domain.sql` existed, apply that file once (or `docker compose down -v` and start fresh).

Customers use an internal UUID primary key. Phone (`phone_e164`) is unique, never the primary key.

Confirmed appointments must not overlap (`appointments_no_overlap`). Do not weaken that constraint.

Enable RLS on hosted Supabase. Table access from the Next.js server goes through `DATABASE_URL` and `src/da`. Do not query tables from the browser.

Supabase JS clients in `src/lib/supabase/**` are for Auth and Storage, not table CRUD.

Never put `DATABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` in `NEXT_PUBLIC_*`.
