# Lint and format

Use the repo scripts:

- `npm run lint` — Oxlint (type-aware). This repo uses Oxlint instead of ESLint.
- `npm run typecheck` — `tsc --noEmit`
- `npm run format` / `npm run format:check` — Prettier

Do not add ESLint. Do not add large custom Oxlint rule sets without a reason.

The project should pass lint, typecheck, and format:check.

Never commit `.env`, `.env.local`, credentials, or private keys. Commit `.env.example` only.
