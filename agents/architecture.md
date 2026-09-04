# Architecture

The Next.js app is the application server. Locally it runs in Docker Compose with Postgres and SMS.

```
UI (props-only components)
  → server operations (src/server)
    → getDataAccess()
      → table interfaces (src/da/<table>)
      → SMS interface (src/da/sms)
```

Never:

- React components querying Postgres, Supabase, or Twilio
- business logic living in components
- `useEffect` for data loading
- React Context
- Express, Nest, GraphQL, tRPC, Redux, Prisma, Drizzle, Redis

To replace a database, implement the table interfaces. To replace Twilio, implement `SmsVerifier`. Do not rewrite UI.

Reads: Server Component → `src/server/**` → props.

Mutations from our UI: Client Component → Server Action → `src/server/**`.

HTTP: Route Handlers only for webhooks, callbacks, or real external APIs.
