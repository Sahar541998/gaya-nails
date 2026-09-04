# Architecture

UI (Server Components by default) calls `src/server/**`. Server operations own business rules. Persistence and SMS go through `src/da` interfaces.

```
UI → server operations → DataAccess interfaces → postgres / SMS adapters
```

Never:

- React components talking to Postgres, Supabase, or Twilio
- business logic living in components
- extra application servers (Express, Nest, GraphQL, tRPC)
- leaking SQL or provider types into UI

Organize `src/server/` by domain (`appointments`, `customers`, `services`, `portfolio`, `availability`, `verification`, `auth`).

Organize `src/da/` by capability (`contracts.ts`, `postgres/*`, `sms/*`). To replace Postgres or Twilio, keep the contracts and swap the adapter.

Prefer Server Components → server functions for reads.

Prefer Client Component → Server Action → `src/server/**` for mutations from our UI.

Use Route Handlers only for webhooks, callbacks, or real HTTP APIs.

Keep dependencies minimal.
