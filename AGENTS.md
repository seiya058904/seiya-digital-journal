# Repository Guidelines

## Project Overview

Seiya Digital Journal is a dark, client-side personal journal SPA. The frontend uses React 19, TypeScript, Vite 8, Framer Motion, GSAP, Three.js, and Supabase Auth. It is built to `dist/` and deployed to GitHub Pages at `/seiya-digital-journal/` by `.github/workflows/deploy.yml`. A separate Cloudflare Worker in `worker/` exposes the authenticated API; Supabase PostgreSQL is accessed by that Worker.

## Project Structure & Module Organization

- `src/main.tsx` and `src/App.tsx` — application entry and hash-based routing.
- `src/pages/` — Home, Archive, Gallery, Auth, Profile, and Motion Lab pages.
- `src/components/` — sections, shared UI, profile/project components, and visual effects.
- `src/data/` — editable journal, project, link, avatar, effect, and Visual Archive metadata.
- `src/auth/`, `src/profile/`, and `src/lib/` — auth/profile state, API clients, validation, and shared domain logic.
- `public/` and `src/assets/` — static and imported assets.
- `worker/src/index.ts` — Cloudflare Worker API entrypoint; `worker/` has its own package and typecheck.
- `supabase/migrations/` — tracked SQL schema migrations.
- `.github/workflows/deploy.yml` — GitHub Pages build and deploy workflow.

## Architecture Notes

There is no React Router. `App.tsx` maps URL hashes such as `#/`, `#/auth`, `#/profile`, `#/lab`, `#/archive/*`, and `#/gallery` to page components; preserve existing hashes when changing routes. The frontend uses `AuthProvider` and `ProfileProvider`, then calls the Worker API. The Worker validates the Supabase access token and performs database operations with server-side credentials. Never move those credentials into frontend code. Vite's base path is `/seiya-digital-journal/`; use `import.meta.env.BASE_URL` for public asset URLs.

## Build, Test & Development Commands

```powershell
npm ci                 # clean root install
npm run dev            # Vite development server
npm test               # Node built-in test runner
npm run lint           # Oxlint
npm run build          # TypeScript build check plus Vite production build
npm run preview        # preview dist locally
cd worker; npm ci; npm run typecheck
```

The Worker also defines `npm run deploy` (`wrangler deploy`), but deployment, publish, migration, database writes, commit, push, release, and tag operations require explicit user authorization. GitHub Pages deployment is triggered by pushes to `main`; do not run it implicitly.

## Coding Style & Naming Conventions

Follow adjacent code: two-space indentation, single quotes, no semicolons, React components in `PascalCase`, and functions/variables in `camelCase`. TypeScript is strict through `tsconfig.app.json`; keep unused-code checks passing. Use co-located plain CSS and existing dependencies. Preserve reduced-motion behavior, touch support, the dark theme, the Vite base path, and existing hash routes.

## Testing & Verification

Tests are co-located as `*.test.ts` under `src/` and use Node's built-in `node:test` and `node:assert/strict`; there are currently 19 test files. For code changes, run `npm test`, `npm run lint`, and `npm run build`; run `cd worker; npm run typecheck` when Worker or shared Worker-imported code changes. For UI changes, manually check relevant routes and responsive/reduced-motion behavior; automated browser inspection is not part of the default workflow. Finish with `git status --short`, `git diff --stat`, and `git diff --check`.

## Commit & Pull Request Guidelines

Use short Conventional Commit subjects such as `feat:`, `fix:`, `perf:`, `refactor:`, `docs:`, or `chore:`. Keep each commit focused. Describe behavior changes and verification in PRs; include screenshots when a UI change needs visual review. Do not include `dist/`, `node_modules/`, logs, caches, temporary files, raw source-image folders, or unrelated changes.

## Security & Configuration

Never read, print, commit, or copy values from `.env`, `.env.local`, `.dev.vars`, or other local environment files. Keep only safe example variable names in documentation. Never expose `SUPABASE_SERVICE_ROLE_KEY` or other Worker secrets to the client. Before changing auth, permissions, database schema/data, production configuration, signing, or billing, explain the risk and obtain authorization. Do not put secrets in code, reports, replies, or commit messages.

## Agent-Specific Instructions

Before editing, read the relevant files and state a brief plan. Make the smallest reviewable change, preserve unrelated user work, and reuse existing helpers and dependencies. Do not invent commands, routes, APIs, or deployment steps. Do not install dependencies, run auto-fixes, or format the whole repository without permission. Stop and explain the risk when requirements or repository state are unclear. Report failed or skipped checks honestly. Commit, push, deploy, publish, release, tag, and database operations always require explicit authorization.

## Pre-Commit Checklist

- `git status --short` and `git diff --stat` show only intended files.
- `git diff --check` reports no whitespace errors.
- No secrets, debug logs, caches, temporary files, or generated artifacts are included.
- Required tests, lint, build, and relevant Worker checks have run; skipped checks are stated.
- The commit or push has explicit user authorization.
