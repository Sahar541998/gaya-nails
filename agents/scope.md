# Scope

This is a small nail-artist website, not a SaaS platform. Keep it simple.

Public (later): landing, portfolio, services/prices, booking, phone verification, manage/cancel/reschedule.

Admin (later): calendar, appointments, manual create/cancel, services/prices, portfolio images.

Customers are lightweight. Phone is the business identity. Database rows use internal UUIDs, never phone as the primary key.

Do not invent extra product requirements. Do not build the full booking UI, admin calendar, or complete domain yet unless the current task asks for that slice.

Do not add Express, Nest, a second Node server, GraphQL, Redux, tRPC, Prisma, Drizzle, Redis, or microservices.

Local development uses Docker Compose (Postgres, SMS mock, and the Next.js app). The Next.js app is the application server. Production app host is Vercel.
