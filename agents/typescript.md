# TypeScript

`strict` is on, plus `noUncheckedIndexedAccess`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters`, `exactOptionalPropertyTypes`, and `noImplicitReturns`.

Do not use `any`. Do not use `@ts-ignore` / `@ts-expect-error` unless there is a documented, unavoidable reason.

Prefer explicit domain types in `src/types/domain.ts`. Do not duplicate types.

Return `Result<T>` from server operations so UI errors stay user-safe.

Do not scatter `process.env`. Use `src/lib/env.ts` (server-only) and `src/lib/public-env.ts` (browser-safe Supabase values only).
