# Server operations

Every file under `src/server/**`, `src/da/**`, `src/lib/env.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`, `src/lib/supabase/storage.ts`, and `src/lib/twilio/**` must start with `import "server-only"`.

These modules contain secrets, privileged clients, or business logic. They must never be imported by Client Components.

Booking operations live in `src/server/appointments` and `src/server/availability`. Phone verification is implemented. Reads and writes go through `getDataAccess()`.

The database is the source of truth. The server must verify availability, conflicts, prices, durations, identity, and authorization. Appointment creation must prevent double-booking using the exclusion constraint (and a transaction when implemented).

Do not trust IDs, prices, or availability from the browser.

Map provider/database failures to safe UI messages. Log technical detail with `src/lib/logger.ts`. Never return SQL, stack traces, or credentials to the UI.

Domain names: `createAppointment`, `getAvailableSlots`, `sendPhoneVerification`, `verifyPhone`. Not `doThing`, `handleData`, `utils`, `helper`.
