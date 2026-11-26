# Repository Guidelines

## Scope & Architecture Invariants
- Personal journal identity; projects belong in the Archive vault (not main homepage portfolio). Never invent achievements, history, images, contacts, or metrics; keep unknown URLs as placeholders.
- `src/data/` is the content source of truth; Visual Archive ingestion rules live in `docs/image-rules.md` (owner supplies folder/Chinese names/IDs; agent converts WebP and updates `src/data/visualArchive.ts` without guessing).
- **Intentional omissions**: React `<StrictMode>` is intentionally absent in `src/main.tsx`; no React Router — keep `src/appRoute.ts` hash routes stable and use `import.meta.env.BASE_URL` for `/seiya-digital-journal/` assets.
- **Unenforced Worker/UI invariants**: keep Worker profile bootstrap idempotent (`resolution=ignore-duplicates` in `worker/src/index.ts`); the 2026-08-02 comment rate-limit check-then-insert race trade-off is accepted; header profile errors must show a neutral placeholder (not `avatar-01`); keep AccountMenu popover ARIA (`aria-pressed` avatar group) intact.
- **Privacy hard ban**: when porting effects, strip webcam/orientation features; never introduce `face-api`, `getUserMedia`, `modelsPath`, `DeviceOrientationEvent`, `enableWebcam`, or `showPreview` in runtime source.

## Commands & Verification
```powershell
npm test && npm run lint && npm run build
cd worker && npm run typecheck && npm test
npm run test:browser
```
- `npm test` uses `--experimental-strip-types`: keep `.ts` extensions in test/shared imports. Editing `worker/` or shared `src/lib/{interactions,profile}.ts` / `src/worker/cors.ts` requires running Worker checks.
- `npm run test:browser` does **not** start Vite: start preview/dev at `127.0.0.1:4178` with the synthetic-service env from `.github/workflows/validate-pr.yml` (default path `/seiya-digital-journal/`, override via `TEST_BASE_URL`).
- **Playwright pin**: keep `playwright` exact `1.64.1` in `package.json` with Chromium build `1248` in `%LOCALAPPDATA%\ms-playwright`; never upgrade, downgrade, or download another browser without explicit dependency authorization.
- **Formatting**: 2 spaces, single quotes, no semicolons, colocated plain CSS. Note `.gitignore` ignores `scripts/` (existing `scripts/trace-image.mjs` is force-tracked).

## Security & Authorization
- Never read, print, or commit `.env`, `.env.local`, `.dev.vars`, or expose `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY` to the frontend.
- Read all `supabase/migrations/` and verify actual remote application before any authorized DB work.
- Explicit authorization is required before commits, pushes (pushing `main` triggers `.github/workflows/deploy.yml`), deploys, migrations, DB writes, releases, tags, dependency installs, auto-fixes, or whole-repo formatting.
