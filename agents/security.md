# Security

Assume input is hostile. Validate every untrusted value on the server (phone, IDs, dates, times, admin input, image metadata, query params, forms). Browser validation is UX only.

Authorize every privileged operation on the server. Hiding a button is not authorization.

Keep secrets server-side. `NEXT_PUBLIC_*` is only for values the browser may see. Never use the service-role key or Twilio in the browser.

Never trust IDs, prices, or availability from the browser.

Rate-limit verification. Prevent SMS abuse before public launch.

Do not put sensitive data in URLs. Do not use `/manage?phone=...` as access control. Use a secure session or unguessable token when management exists.

Do not log passwords, OTP codes, Twilio tokens, service-role keys, or unnecessary personal data. Be careful with phone numbers. Normalize phones to E.164.

Never expose internal errors to users.

Good: `This appointment time is no longer available.`

Bad: `Postgres error: duplicate key constraint ...`
