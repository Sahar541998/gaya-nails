# Security

Assume input is hostile. Validate every untrusted value on the server (phone, IDs, dates, times, admin input, image metadata, query params, forms). Browser validation is UX only.

Authorize every privileged operation on the server. Hiding a button is not authorization.

Keep secrets server-side. `NEXT_PUBLIC_*` is only for values the browser may see. Never use the service-role key, Twilio, `ADMIN_PASSWORD`, or `ADMIN_JWT_SECRET` in the browser.

Admin auth: username/password on the server, then an HS256 JWT in an httpOnly cookie. Verify that JWT in `requireAdmin()` before any admin mutation. Do not put the JWT in `localStorage` or return it to client JavaScript.

Never trust IDs, prices, or availability from the browser.

Rate-limit verification. Prevent SMS abuse before public launch.

Do not put sensitive data in URLs. Do not use `/manage?phone=...` as access control. Use a secure session or unguessable token when management exists.

Do not log passwords, OTP codes, Twilio tokens, service-role keys, or unnecessary personal data. Be careful with phone numbers. Normalize phones to E.164.

Never expose internal errors to users.

Good: `This appointment time is no longer available.`

Bad: `Postgres error: duplicate key constraint ...`
