# Appointments

Status `confirmed` is the only status that blocks a slot. `cancelled` and `completed` do not.

Duration and price come from the service row at booking time. The client cannot submit duration or price. Appointments store `service_name_at_booking` and `price_cents_at_booking` so later price/name changes do not rewrite history.

Timezone is `business_settings.timezone` (default `Asia/Jerusalem`). Use `src/lib/business-time.ts` only. Do not convert timezones in components or extra helpers. `timestamptz` is stored in UTC; wall-clock hours are interpreted in the business zone, including DST.

Overlap is enforced in Postgres:

```
EXCLUDE USING gist (tstzrange(starts_at, ends_at, '[)') WITH &&)
WHERE (status = 'confirmed')
```

That is a half-open range, so 11:00–12:00 and 12:00–13:00 can both exist. Concurrent inserts/updates of confirmed rows are rejected. Application checks run first; the constraint is the final lock.

Customer booking requires a verification token from `verifyPhone`, not a client `phoneVerified` flag. A customer may only view/cancel/reschedule their own appointment. Admin operations call `requireAdmin` and are not authorized by hiding UI.
