# Server operations

Every file under `src/server/**`, `src/da/**`, `src/lib/env.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`, `src/lib/supabase/storage.ts` must start with `import "server-only"`.

These modules contain secrets, privileged clients, or business logic. They must never be imported by Client Components.

Booking domain functions may still be stubbed. Phone verification and read models that already have repositories should go through `getDataAccess()`.

The database is the source of truth. The server must verify availability, conflicts, prices, durations, identity, and authorization. Appointment creation must rely on the overlap exclusion constraint.

Do not trust IDs, prices, or availability from the browser.

Map adapter failures to `Result` errors. Log technical detail with `src/lib/logger.ts`. Never return SQL, stack traces, or credentials to the UI.
