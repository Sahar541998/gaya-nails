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

The nail artist uses Supabase Auth. Every admin operation must call `requireAdmin` on the server.
