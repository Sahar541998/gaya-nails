# Data access

Each table has its own folder. The interface file is the contract. The postgres file is today’s adapter.

```
src/da/<table>/<table>.ts     interface
src/da/<table>/postgres.ts    Postgres implementation
```

`src/server/**` may only use `getDataAccess()` from `src/da/index.ts`. It must not import postgres.js, SQL, or Twilio.

To replace Postgres with another store, add `src/da/<table>/<other>.ts` that implements the same interface and wire it in `src/da/index.ts`. Do not change server operations or React.

SMS follows the same rule:

- `src/da/sms/sms-verifier.ts` — interface (`send`, `check`)
- `src/da/sms/docker.ts` — local Docker mock
- `src/da/sms/twilio.ts` — production Twilio Verify
- `src/lib/twilio/verify.ts` — Twilio SDK only

Do not generate or store OTP codes. Local Docker SMS accepts `000000`.
