# Vercel

Deploy the Next.js app on Vercel. Set the same server environment variables as `.env.example` (production values).

Required in production:

- `DATABASE_URL` — Supabase Postgres URI (prefer the pooled connection and keep `prepare: false` in the client)
- `SMS_DRIVER=twilio` plus Twilio Verify secrets
- Supabase public URL/anon key and service role if Auth/Storage are used

Do not enable Vercel deployments of Docker Compose. Compose is local only.

Point the production domain at this Vercel project. Do not add a second Node server.
