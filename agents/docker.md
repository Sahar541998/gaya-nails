# Docker

Third parties run in Docker Compose for local development:

- `postgres` on port `5432` (user `gaya`, db `gaya_nails`)
- `sms-mock` on port `4010` (always accepts code `000000`)

```bash
docker compose up -d --build
```

Wait until Postgres is healthy, then `npm run dev`.

`SMS_DRIVER=console` does not need `sms-mock`. `SMS_DRIVER=mock` does.

Do not run the Next.js app inside Docker unless there is a clear reason. Vercel is the app host.

Do not add Redis, extra admin UIs, or a fake Supabase stack unless a feature needs them.

Reset local data with `docker compose down -v` (destroys the Postgres volume).
