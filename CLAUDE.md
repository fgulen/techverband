# WeiterWert

Two sites in one repo:

- **weiterwert.de**: static `index.html` plus legal pages. Vercel project `techverband`. Every push to `master` deploys it. Vercel skips the build when only `platform/`, `docs/`, `tests/`, `*.md` or `package.json` changed (project setting "Ignored Build Step"). `.vercelignore` publishes only the site files.
- **spenden.weiterwert.de**: Next.js app in `platform/`. Vercel project `weiterwert-platform`. It is not connected to Git: deploy it from `platform/` with `vercel deploy --prod --yes`. `platform/.vercelignore` keeps tests, e2e and SQL out of the upload.

Session log: `docs/GUNLUK.md` (Turkish).

## Kapat

- Plan / log: `docs/GUNLUK.md`, one dated section per session. Open items for Fatih go in a separate list.
- Tests before every commit:
  - In the repo root: `npm run test:static`.
  - In `platform/`: `npx tsc --noEmit`, `npx vitest run`, `CI=1 npx playwright test`.
- `npm run test:deploy-gate` fails on purpose while legal fields still say "wird ausgefüllt". It lists those fields.
- UI changes: check every step on mobile at 320 px, iPhone 13 and Pixel 7 before reporting.
- Deploy targets:
  - Push to `master` deploys weiterwert.de.
  - `vercel deploy --prod` in `platform/` deploys the donation site.
  - Ask before either one.
