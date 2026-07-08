# Repository Guidelines

## Project Overview

Personal digital growth journal (client-side SPA). React 19 + TypeScript + Vite 8, deployed to GitHub Pages at `/seiya-digital-journal/`. Uses Framer Motion, GSAP, and Three.js for animation. Supabase Auth for authentication, Cloudflare Worker for API, Supabase PostgreSQL for data. Entry: `index.html` → `src/main.tsx` → `src/App.tsx`. Build output: `dist/`. Push to `main` triggers GitHub Actions deploy workflow.

## Project Structure & Module Organization

- `src/` — application source (React components, pages, styles, data, auth, lib)
- `src/components/effects/` — visual effects and React Bits ported components
- `src/components/sections/` — Home sections; `ui/` — shared UI (Header, AccountMenu, DesktopOnly)
- `src/components/profile/` — profile editing and activity components
- `src/pages/` — top-level route pages (HomePage, ArchivePage, ProfilePage, AuthPage, GalleryPage, MotionLabPage)
- `src/data/` — static content (profile.ts, notes.ts, projects.ts, gallery.ts, links.ts)
- `src/styles/` — CSS: `tokens.css` (design tokens), `global.css`, co-located component CSS
- `src/auth/` — AuthContext and auth utilities
- `src/profile/` — ProfileProvider and profile state management
- `src/lib/` — utility modules (api, profileApi, interactions, authFlow, supabase client)
- `src/worker/` — Cloudflare Worker utilities shared with frontend (cors handling)
- `worker/src/index.ts` — Cloudflare Worker entrypoint (API endpoints)
- `supabase/migrations/` — SQL migrations for Supabase database
- `public/` — static assets (images, favicon)
- `.github/workflows/deploy.yml` — CI/CD: push to main → build → GitHub Pages deploy

## Architecture Notes

- **No React Router.** Hash-based routing in `App.tsx` via `getPageFromHash()`. Routes: `#/` (home), `#/auth`, `#/profile` (protected), `#/lab`/`#/motion-lab` (lazy), `#/archive/*`, `#/gallery`. Add/change routes there and verify backward compatibility.
- **Base path** `/seiya-digital-journal/`. Reference `public/` assets via `import.meta.env.BASE_URL`.
- **CSS only.** No CSS modules or CSS-in-JS. Files co-located with components. `tokens.css` for design tokens. Dark-only theme in `color-scheme: dark`.
- **Client/Server split.** Frontend communicates with a Cloudflare Worker API (`worker/src/index.ts`). Worker uses Supabase service role for database ops. Frontend uses Supabase publishable key for auth only.
- **Supabase.** Project ref and migrations tracked. RLS enabled on tables; anon/authenticated have no table-level permissions — all DB access goes through Worker.

## Build, Test & Development Commands

```powershell
npm ci          # clean install (use in CI)
npm run dev     # Vite dev server at localhost:5173
npm test        # Node built-in runner: node --experimental-strip-types --test src/**/*.test.ts
npm run lint    # Oxlint (zero warnings policy)
npm run build   # tsc -b && vite build → dist/
npm run preview # local preview of production build
```

Single test: `node --experimental-strip-types --test <relative-path>`. Worker typecheck: `npx tsc -p worker/tsconfig.json --noEmit`.

Commands requiring explicit authorization: deploy, publish, migration, commit, push, release, database writes.

## Coding Style & Naming Conventions

Two-space indent, single quotes, no semicolons. React components `PascalCase`, functions/variables `camelCase`. TypeScript strict (`noUnusedLocals`, `noUnusedParameters`). CSS class names describe purpose. Keep reduced-motion (`prefers-reduced-motion`) and touch compatibility. Follow adjacent code patterns.

## Testing & Verification

- **Framework:** Node built-in (`node:test` + `node:assert/strict`)
- **Location:** Tests co-located with source as `*.test.ts` (17 tests found across data, lib, auth, profile, components)
- **Run:** `npm test` or single test via `node --experimental-strip-types --test <path>`
- **Pre-completion:** Run `npm test && npm run lint && npm run build` before claiming work done
- UI changes require manual browser check (no Playwright/screenshot automation configured)
- Use `git status --short` and `git diff --stat` to catch unintended files
- Do not mask test failures or modify unrelated behavior to pass tests

## Commit & Pull Request Guidelines

Conventional commits: `feat:`, `fix:`, `refactor:`, `perf:`, `style:`, `chore:`. Single purpose, short summary. Push to `main` triggers deploy, so ensure only intended changes are committed. Do not commit `dist/`, `node_modules/`, logs, cache, raw image directories, or secrets.

## Security & Configuration

- Never commit `.env`, `.dev.vars`, `.env.local`, or any environment files containing secrets
- Never expose service role key (`SUPABASE_SERVICE_ROLE_KEY`) to frontend code
- Worker secrets (names only, never values): `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_ORIGINS`
- No client-side secrets in logs, docs, replies, or commit messages
- Modifying auth, permissions, database, production config, or billing requires explicit risk explanation and user authorization

## Agent-Specific Instructions

- Read relevant files and state a brief plan before implementing changes
- Favor small, reviewable patches. Do not modify unrelated code or overwrite uncommitted user changes
- Do not fabricate commands, directory structures, interfaces, or deployment flows
- When uncertain: stop, explain the risk, and ask before proceeding
- Installation of dependencies, auto-fixes, or full-repo formatting requires explicit authorization
- Commit, push, deploy, publish, release, and database operations require explicit authorization
- Production, permissions, secrets, data integrity, signing, and billing changes require prior approval
- Report test failures and verification gaps honestly; do not skip or suppress them
- **Visual Archive images:** When adding images, follow the `adding-visual-archive-images` skill. User provides folder, renames files to Chinese, and writes data entries. Agent reviews entries for format correctness, converts/places files, and updates `visualArchive.ts`. Agent does NOT read images.

## Pre-Commit Checklist

- `git status --short` — verify only intended files are modified
- `git diff --stat` — review scope of changes
- Confirm no secrets, debug logs, cache files, or generated artifacts
- Run `npm test`, `npm run lint`, `npm run build` (or document what was not run and why)
- Explicit user authorization obtained for commit/push
