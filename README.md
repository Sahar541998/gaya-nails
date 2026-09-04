# Gaya Nails

Website for Gaya’s nail studio. This repository is a Next.js App Router app (Server Components by default). There is no separate backend. Persistence goes through a small data-access layer so Postgres (local Docker or hosted Supabase) can be replaced without rewriting the UI.

## Stack

- Next.js 16 (App Router, React Compiler, TypeScript)
- Oxlint + Prettier
- PostgreSQL (Docker locally, Supabase in production)
- Twilio Verify for production SMS
- Vercel for the app

## Requirements

- Node.js 20+
- npm
- Docker Desktop (or another Docker Engine) for local Postgres and the SMS mock

Optional later: a [Supabase](https://supabase.com) project and a [Twilio](https://www.twilio.com) Verify service.

## Expected local setup

1. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

2. For day-to-day local work, keep these values (already in `.env.example`):

   | Variable       | Local value                                         |
   | -------------- | --------------------------------------------------- |
   | `DA_DRIVER`    | `postgres`                                          |
   | `DATABASE_URL` | `postgres://gaya:gaya@localhost:5432/gaya_nails`    |
   | `SMS_DRIVER`   | `console` (no SMS container) or `mock` (Docker SMS) |
   | `SMS_MOCK_URL` | `http://localhost:4010` (only if `SMS_DRIVER=mock`) |

3. Start third-party services:

   ```bash
   docker compose up -d --build
   ```

   Postgres is created with `supabase/migrations/0001_init.sql` on first boot.

4. Install and run the app:

   ```bash
   npm install
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

   Health: [http://localhost:3000/api/health](http://localhost:3000/api/health) (`database: true` when Postgres is up).

Local SMS codes (`console` and `mock` drivers) are always `000000`. Do not use that in production.

## Production-shaped environment

When you are ready to use hosted Supabase and Twilio, set in `.env.local` or Vercel:

| Variable                        | Purpose                         |
| ------------------------------- | ------------------------------- |
| `DATABASE_URL`                  | Supabase Postgres URI           |
| `NEXT_PUBLIC_SUPABASE_URL`      | Auth / Storage                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + cookie session client |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only privileged client   |
| `SMS_DRIVER`                    | `twilio`                        |
| `TWILIO_ACCOUNT_SID`            | Verify                          |
| `TWILIO_AUTH_TOKEN`             | Verify                          |
| `TWILIO_VERIFY_SERVICE_SID`     | Verify                          |

Apply `supabase/migrations/` to the Supabase project (SQL editor or CLI), including `0002_storage.sql` for the portfolio bucket.

Never put service-role, database, or Twilio secrets in `NEXT_PUBLIC_*`.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run format
npm run format:check
npm run build
docker compose down        # stop local Postgres + SMS mock
docker compose down -v     # also delete local database volume
```

## Architecture

UI calls `src/server/**`. Those modules call `getDataAccess()` (`src/da`). See [AGENTS.md](AGENTS.md).

## Deploy

Connect the repo to Vercel, set production environment variables, and point `DATABASE_URL` at Supabase Postgres.
