# Docker

Local development runs entirely in Docker Compose: Postgres, SMS mock, and the Next.js app.

```bash
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000).

- `postgres` — port 5432, schema from `db/*.sql` on first boot
- `sms` — port 4010, code `000000`
- `app` — port 3000, `SMS_DRIVER=docker`, `DATABASE_URL` points at the `postgres` service

To run Next on the host instead, start only dependencies:

```bash
docker compose up -d postgres sms
cp .env.example .env.local
npm run dev
```

Host `.env.local` must use `localhost` URLs, not Docker service names.

Reset local data with `docker compose down -v`.

Do not add Redis or a fake full Supabase stack unless a feature needs them. Production app host is Vercel; Compose is local only.
