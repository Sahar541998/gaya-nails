# Auth and SMS

## Customer

No traditional customer account. Phone verification proves control of the number.

Domain API in `src/server/verification/`:

- `sendPhoneVerification`
- `verifyPhone` — on success, issues a booking session token. Return `{ verificationToken, expiresAt }`. Never trust `phoneVerified: true` from the client.

Those functions use `getDataAccess().sms` (`SmsVerifier`). They must not import Twilio.

Swap SMS by changing `SMS_DRIVER` and the adapter in `src/da/sms/`:

- local: `docker` (Compose `sms` service, code `000000`)
- production: `twilio`

Do not generate or store OTP codes. Do not log OTP codes or Twilio credentials.

Normalize phones to E.164. Knowing a phone number is not authorization.

In-memory rate limits in `src/lib/rate-limit.ts` are a local guard only. They are not durable on Vercel.

## Admin

The studio owner uses `/admin` (not `/manage`, which is reserved for customer appointment management).

The admin API is `src/server/admin/**`. UI mutations go through Server Actions into those functions. Every privileged function must call `requireAdmin()` on the server. Hiding UI is not authorization.

Flow:

1. Owner submits **username + password** (`ADMIN_USERNAME`, `ADMIN_PASSWORD`).
2. Server checks credentials (timing-safe). Rate-limited.
3. Server issues an **HS256 JWT** signed with `ADMIN_JWT_SECRET` (or `ADMIN_SESSION_SECRET` as fallback).
4. JWT is stored in an **httpOnly, SameSite=Lax** cookie (`gaya_admin`). It is never sent to client JavaScript and must not go in `localStorage`.
5. `requireAdmin()` verifies the JWT signature and expiry on every admin read/mutation.

Local Docker Compose:

- username: `gaya`
- password: `gaya-local`

Change those before any public deploy. Tests may set `ADMIN_TEST_BYPASS=1` (never in production).
