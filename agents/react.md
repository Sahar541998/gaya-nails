# React

Functional components only. Server Components by default.

Do not add `"use client"` unless the file needs browser events, local widget state, or browser APIs.

Components should be logic-free. They render props. They do not fetch, authorize, validate for security, or talk to Postgres/Twilio.

Put decisions in `src/server/**` or in the route file (Server Component). Pass the result down as props.

```tsx
// page.tsx (server) — may load data
<ServicesList services={services} />

// services-list.tsx — no fetching, no useEffect
export function ServicesList({ services }: { services: readonly Service[] }) {
  return ...
}
```

Do not use React Context. Do not add Redux or other global client stores.

Do not use `useEffect` to load data, sync props into state, or mirror server state. If data is needed, load it in a Server Component (or a Server Action) and pass it as props.

Interactive bits stay small and colocated. Lift that state to the nearest client parent and pass it down. Do not mark a whole page as client to hold one input.
