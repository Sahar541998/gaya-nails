# Next.js

Use the App Router. Server Components are the default. Next.js is the application server.

Do not add `"use client"` unless the file needs browser APIs, local state, or event handlers.

Never import a `server-only` module from a Client Component.

Prefer calling server modules directly from Server Components. Do not fetch our own Route Handlers from the browser just to load data.

Use Server Actions for mutations that originate in our UI.

Validate every untrusted input on the server (Zod is already a dependency). Browser validation is UX only.

Keep the public landing page mostly static / server-rendered. Minimize client JavaScript. Optimize images; lazy-load gallery images when that UI exists.

Route layout:

- `src/app/[locale]/(public)/` public pages, including `/he`, `/en`, `/[locale]/work`, `/[locale]/book`, and `/[locale]/manage`
- `src/app/admin/` nail-artist admin
- `src/app/api/` HTTP endpoints only when required

Read `node_modules/next/dist/docs/` when APIs may have changed.
