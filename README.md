# Gaya Nails

Website for Gaya’s nail studio. Next.js App Router is the application server. Local development runs in Docker. Persistence and SMS go through per-table / per-provider interfaces so Postgres or Twilio can be replaced without rewriting the UI.

## Stack

- Next.js 16 (App Router, React Compiler, TypeScript)
- Oxlint + Prettier
- PostgreSQL (Docker locally, Supabase in production)
- SMS: Docker mock locally, Twilio Verify in production
- Vercel for production

## Requirements

- Docker Desktop (or another Docker Engine)
- Node.js 20+ and npm only if you run the app on the host

## Run locally (Docker)

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000).

Health: [http://localhost:3000/api/health](http://localhost:3000/api/health) (`database: true` when Postgres is up).

The Compose `app` service uses:

| Variable       | Docker value                                    |
| -------------- | ----------------------------------------------- |
| `DATABASE_URL` | `postgres://gaya:gaya@postgres:5432/gaya_nails` |
| `SMS_DRIVER`   | `docker`                                        |
| `SMS_MOCK_URL` | `http://sms:4010`                               |

Local verification code is always `000000`.

Schema is created from `db/*.sql` the first time the Postgres volume is created. `npm run db:apply` (and Vercel `npm run build`) applies the same files to whatever `DATABASE_URL` points at.

## Run the app on the host

```bash
docker compose up -d postgres sms
cp .env.example .env.local
npm install
npm run dev
```

`.env.local` must keep `localhost` in `DATABASE_URL` and `SMS_MOCK_URL`.

## Production-shaped environment

Set these in Vercel. Schema is applied automatically on deploy from `db/*.sql`:

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

Never put service-role, database, or Twilio secrets in `NEXT_PUBLIC_*`.

## Scripts

```bash
docker compose up --build
docker compose down
docker compose down -v     # delete local database volume
npm run lint
npm run typecheck
npm run format
npm run format:check
npm run db:apply
npm run build
```

## Architecture

UI is props-only. Pages call `src/server/**`. Server code calls `getDataAccess()`. See [AGENTS.md](AGENTS.md).
