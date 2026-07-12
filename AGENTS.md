# Repository Guidelines

## Project Overview

Seiya Digital Journal is a client-side journal SPA built with React 19, TypeScript, Vite 8, Framer Motion, GSAP, Three.js, and Supabase Auth. The frontend entry points are `src/main.tsx` and `src/App.tsx`; hash-based routing maps views such as Home, Archive, Gallery, Auth, Profile, and Motion Lab. The app is built to `dist/` and deployed to GitHub Pages under `/seiya-digital-journal/`. A separate Cloudflare Worker in `worker/` serves the authenticated API and talks to Supabase PostgreSQL with server-side credentials.

## Project Structure & Module Organization

- `src/pages/` - page-level views, including the hash-routed app screens.
- `src/components/` - shared UI, effects, sections, profile pieces, and Motion Lab demos.
- `src/data/` - editable journal, project, link, avatar, effect, and Visual Archive content.
- `src/auth/`, `src/profile/`, `src/lib/`, and `src/worker/` - auth state, profile state, shared validation, API helpers, and worker-related helpers.
- `public/` and `src/assets/` - static and imported assets used by the frontend.
- `worker/src/index.ts` - Cloudflare Worker API entrypoint; `worker/` has its own package and typecheck.
- `supabase/migrations/` - tracked schema migrations.
- `.github/workflows/deploy.yml` - GitHub Pages build and deploy workflow.
- `scripts/` - local helper scripts.
- `docs/` - supporting project documentation.

## Architecture Notes

There is no React Router. `src/App.tsx` switches on `location.hash` and preserves existing hashes such as `#/`, `#/auth`, `#/profile`, `#/lab`, `#/archive/*`, and `#/gallery`. Keep those routes stable unless the user explicitly asks for a routing change. The frontend uses `AuthProvider` and `ProfileProvider`, then calls the Worker API. The Worker validates Supabase access tokens and performs database writes with server-side credentials; do not move those credentials into frontend code. Vite uses the base path `/seiya-digital-journal/`, so public URLs should use `import.meta.env.BASE_URL` where appropriate.

## Build, Test & Development Commands

```powershell
npm ci
npm run dev
npm test
npm run lint
npm run build
npm run preview
cd worker; npm ci; npm run typecheck
```

- `npm ci` installs root dependencies from `package-lock.json`.
- `npm run dev` starts the Vite development server.
- `npm test` runs the Node built-in test runner against `src/**/*.test.ts`.
- `npm run lint` runs Oxlint.
- `npm run build` runs the TypeScript build check and Vite production build.
- `npm run preview` previews the production build locally.
- `cd worker; npm ci; npm run typecheck` validates the Worker project.

Deployment, publish, migration, database write, commit, push, release, and tag operations require explicit user authorization. The GitHub Pages workflow in `.github/workflows/deploy.yml` runs on pushes to `main`; do not trigger it implicitly.

## Coding Style & Naming Conventions

Follow the existing code style: two-space indentation, single quotes, and no semicolons. React components use `PascalCase`; functions and variables use `camelCase`. Keep TypeScript strictness intact, avoid unused code, and preserve the current dark theme, reduced-motion behavior, touch support, and hash routes. Prefer colocated plain CSS and the dependencies already in the repo.

## Testing & Verification

Tests live beside the code as `*.test.ts` files under `src/` and use Node's built-in `node:test` and `node:assert/strict`. There are 19 test files at the time of this guide. For code changes, run `npm test`, `npm run lint`, and `npm run build`; run the Worker typecheck when Worker code or shared Worker-imported code changes. For UI changes, manually check the relevant hash routes and responsive or reduced-motion behavior. Finish with `git status --short`, `git diff --stat`, and `git diff --check`.

## Commit & Pull Request Guidelines

Recent history uses short Conventional Commit subjects such as `feat:`, `fix:`, `perf:`, `refactor:`, `docs:`, and `chore:`. Keep each change focused on one purpose. PR or change notes should describe the behavior change and the verification performed. Include screenshots when a UI change needs visual review. Do not include `dist/`, `node_modules/`, logs, caches, temporary files, raw source-image folders, or unrelated changes.

## Security & Configuration

Never read, print, commit, or copy values from `.env`, `.env.local`, `.dev.vars`, or other local environment files. Do not expose `SUPABASE_SERVICE_ROLE_KEY` or any other server-side secret to the client. Do not commit secrets, tokens, passwords, private keys, database connection strings, logs, caches, or generated artifacts. Before changing authentication, permissions, database schema or data, production configuration, signing, or billing, explain the risk and obtain authorization.

## Agent-Specific Instructions

Before editing, read the relevant files and state a brief plan. Make the smallest reviewable change, preserve unrelated user work, and reuse existing helpers and dependencies. Do not invent commands, routes, APIs, or deployment steps. Do not install dependencies, run auto-fixes, or format the whole repository without permission. Stop and explain the risk when requirements or repository state are unclear. Report failed or skipped checks honestly. Commit, push, deploy, publish, release, tag, and database operations always require explicit authorization.

## Pre-Commit Checklist

- Check `git status --short`.
- Check `git diff --stat`.
- Check `git diff --check`.
- Confirm only the intended files changed.
- Confirm no secrets, debug logs, caches, or generated artifacts were added.
- Confirm required tests and checks ran, or clearly state what was skipped.
- Confirm commit or push only after explicit user authorization.
