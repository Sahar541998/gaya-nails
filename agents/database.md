# Database

PostgreSQL is the source of truth. Hosted Postgres is Supabase. Local Postgres is Docker.

Schema lives in `supabase/migrations/`. `0001_init.sql` is applied by Docker on first boot and by Supabase (SQL editor or CLI) in hosted environments. `0002_storage.sql` is Supabase Storage only; it is not applied to local Docker Postgres.

Customers use an internal UUID primary key. Phone (`phone_e164`) is unique, never the primary key.

Confirmed appointments must not overlap (`appointments_no_overlap`). Do not weaken that constraint.

Enable RLS on hosted Supabase. The Next.js server talks to tables through `DATABASE_URL` (server-only). Do not query tables from the browser.

Supabase JS clients in `src/lib/supabase/**` are for Auth and Storage, not for table CRUD.

Never put `DATABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` in `NEXT_PUBLIC_*`.
