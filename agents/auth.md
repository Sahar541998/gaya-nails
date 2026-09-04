# Auth and SMS

## Customer

No traditional customer account. Phone verification proves control of the number.

Use `getDataAccess().sms` (`SmsVerifier`). Domain API:

- `sendPhoneVerification`
- `verifyPhone`

Do not generate or store OTP codes. Do not log OTP codes. Do not log Twilio credentials.

Normalize phones to E.164. Knowing a phone number is not authorization. Never use `/manage?phone=...` as access control.

Local drivers (`console`, `mock`) accept `000000`. Production must use Twilio Verify.

In-memory rate limits in `src/lib/rate-limit.ts` are a local guard only. They are not durable on Vercel.

## Admin

The nail artist uses Supabase Auth. Every admin operation must call `requireAdmin` on the server. Hiding a button is not authorization.
