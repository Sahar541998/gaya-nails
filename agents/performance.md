# Performance

The public site must stay fast.

- Server Components by default. Minimize `"use client"`.
- Do not add large client-side libraries.
- Optimize images. Lazy-load gallery images when that UI exists.
- Do not fetch our own Route Handlers from the browser just to load data. Call `src/server/**` from Server Components.
- Keep the landing page mostly static / server-rendered.
- Add caching/revalidation when real content exists, not before.
