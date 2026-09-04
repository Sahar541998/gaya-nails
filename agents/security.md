# Security

Assume input is hostile. Validate on the server.

Keep secrets server-side. `NEXT_PUBLIC_*` is only for values the browser is allowed to see.

Rate-limit verification. Prevent SMS abuse before launch.

Do not put sensitive data in URLs.

Do not log passwords, OTP codes, Twilio tokens, service-role keys, or unnecessary personal data. Be careful with phone numbers.

Never expose internal errors to users.

Good: `This appointment time is no longer available.`

Bad: `Postgres error: duplicate key constraint ...`
