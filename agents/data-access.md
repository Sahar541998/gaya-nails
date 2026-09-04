# Data access

`src/da/contracts.ts` is the only persistence/SMS API `src/server/**` may call.

Get a composed instance with `getDataAccess()` from `src/da/index.ts`. Do not construct adapters in UI or in random helpers.

Domain types live in `src/types/domain.ts`. Map snake_case rows to those types inside `src/da/postgres`. Never return database rows from server operations.

Postgres is accessed with `postgres` (postgres.js) through `DATABASE_URL`. Production uses the Supabase Postgres connection string. Local uses Docker Postgres. The rest of the app should not care which host it is.

SMS is an `SmsVerifier` (`send`, `check`):

- `console` — no network; accept code `000000`
- `mock` — Docker `sms-mock`; accept code `000000`
- `twilio` — Twilio Verify for production

Do not generate or store OTP codes in our database.

When swapping the database, implement the repository interfaces. Do not rewrite server operations or React components.
