# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Identity

This is NOT a developer portfolio. It is a personal digital journal focused on identity, growth, thoughts, interests, and visual storytelling.

**Positioning:** Digital Identity + Personal Growth Magazine

The page should feel like a premium personal magazine — Apple-like, dark editorial, cinematic, motion-rich but restrained. It should help visitors understand who Seiya is as a person, not mainly what projects he has built.

Do not turn this back into a project portfolio, SaaS landing page, dashboard, or generic resume.

## Before Any Change

Always check current state first:

```powershell
git status --short
git branch --show-current
git log -5 --oneline
```

If the user has uncommitted modifications:
- Do NOT reset, restore, stash, or overwrite them
- Check and protect first
- Then proceed with your task

## Commands

```powershell
npm install          # install dependencies
npm run dev          # start dev server at http://localhost:5173/
npm run lint         # run oxlint (no config file needed)
npm run build        # tsc -b && vite build (outputs to dist/)
npm test             # node --experimental-strip-types --test src/**/*.test.ts
npm run preview      # preview production build locally
```

Worker typecheck:
```powershell
npx tsc -p worker/tsconfig.json --noEmit
```

Trailing whitespace check:
```powershell
git diff --check
```

Always run `npm run lint` and `npm run build` before committing. The lint has zero tolerance — no warnings allowed.

## Architecture

### Tech Stack

**Frontend:**
- React 19 (no StrictMode — intentional to avoid double-firing Supabase auth effects)
- TypeScript 6 (`erasableSyntaxOnly: true` — no enums/namespaces; `verbatimModuleSyntax: true` — explicit `import type` required)
- Vite 8 (Rolldown bundler)
- Framer Motion (primary animation runtime, `reducedMotion="user"` at top level)
- GSAP (for a few React Bits ports, loaded lazily)
- Three.js (GridScan, Silk backgrounds)
- `@supabase/supabase-js` (auth client)
- `lucide-react` (icons)

**Backend:**
- Cloudflare Worker (`worker/src/index.ts`)
- Supabase Auth (authentication)
- Supabase PostgreSQL (database via PostgREST)

**Shared validation (critical pattern):**
The Worker directly imports frontend validation logic from `src/lib/`. This ensures client and server enforce identical rules:
- `src/lib/interactions.ts` — target validation, comment body validation
- `src/lib/profile.ts` — display name validation, avatar key validation, Content-Range parser
- `src/worker/cors.ts` — CORS origin parsing

The Worker's `tsconfig.json` explicitly includes these frontend files via relative paths. Any changes to these shared files must pass **both** frontend and Worker type-checking.

**Deployment:**
- GitHub Pages (frontend, via GitHub Actions)
- Cloudflare Worker (API backend)

### Directory Structure

```
src/
  auth/              — AuthContext (Supabase Auth session management)
  profile/           — ProfileContext (profile state management)
                     — profileState.ts (mutation race guard)
  lib/               — Utility modules:
                         api.ts (API helper base)
                         authRoutes.ts (auth redirect, return target)
                         authFlow.ts (auth flow orchestration)
                         authForm.ts (auth form state)
                         commentSuccess.ts (comment success handling)
                         env.ts (public env reading)
                         interactions.ts (comment/like validation)
                         profile.ts (shared validation, constants)
                         profileApi.ts (frontend profile API client)
                         site.ts (site-level helpers)
                         supabase.ts (Supabase client factory)
                         *.test.ts (co-located tests for each module)
  components/
    sections/        — Hero, About, Interests, Gallery, GalleryCard, Thoughts, Journey, Contact
    ui/              — Header, AccountMenu, Chapter, ActionLink (stable reusable UI atoms)
    profile/         — ProfileHero, ActivityStats, EditProfileSurface, focusTrap
    motion/          — ScrollReveal, TextReveal (Framer Motion wrappers)
    effects/
      react-bits/    — ported React Bits components (GlareHover, BorderGlow, Stack,
                       TiltedCard, ProfileCard, PillNav, GridScan, BounceCards,
                       ImageTrail, MagicBento, ScrambledText, SplitText,
                       AnimatedContent, CountUp, OrbitImages, DesktopGridScan,
                       CardNav, FlowingMenu, DesktopLanyard, Folder, GlassIcons,
                       Lanyard, Silk, Stepper)
      text/          — custom animated text (GradientText, ShinyText, RotatingText)
      ArchiveBackground.tsx, AuroraBackground.tsx, CardTilt.tsx,
      CursorGlow.tsx, GradientBorder.tsx, MultiStepLoader.tsx
    lab/             — EffectCard, HeavyEffectGate, ReactBitsDemo (Motion Lab UI)
  pages/             — HomePage, MotionLabPage, ArchivePage, ArchiveImagesPage,
                       ArchiveNotesPage, ArchiveNoteDetailPage, ArchiveProjectsPage,
                       ArchiveNotesCategoryPage, GalleryPage, AuthPage, ProfilePage
  data/              — profile.ts, thoughts.ts, links.ts, effects.ts, visualArchive.ts,
                       notes.ts, projects.ts, profileAvatars.ts
  styles/            — tokens.css (design tokens), global.css (all page CSS),
                       hero-background.css (animated background effect)
  assets/            — brand-icon.webp, avatar-seiya.webp, profile-placeholder.svg,
                       profile-avatars/, lanyard/
worker/
  src/index.ts       — Cloudflare Worker entry (all API endpoints)
  wrangler.jsonc     — Worker config (name: seiya-digital-journal-api)
  package.json
supabase/
  migrations/        — SQL migration files
.github/
  workflows/
    deploy.yml       — GitHub Pages deployment workflow
report/              — session completion reports (Markdown, dated filenames)
docs/
  visual-archive-entry-spec.md — format spec for writing/reviewing archive image entries
public/
  gallery/           — WebP images used by Motion Lab demos
  visual-archive/    — editorial + memory photos (with thumbs/ for previews)
  orbit/             — 6 WebP images for the OrbitImages component
  favicon.svg
```

### Component Hierarchy

**Pages** route between `HomePage`, `MotionLabPage`, `AuthPage`, `ProfilePage`, and Archive pages. Routing is hash-based (`#/`, `#/auth`, `#/profile`, `#/lab`, etc.), handled by a simple `hashchange` listener in `App.tsx` — no React Router library.

**Sections** compose layout and content only. They call animation wrappers from `motion/` and `effects/`. Section order: Hero → About → Current Stack → Signals → Interests → Visual Archive → Thoughts → Journey → Contact. Each section is a `<section id="...">` linked from the nav.

**Data files** are the single source of truth. Edit `src/data/profile.ts` for personal text, `visualArchive.ts` for archive items, `thoughts.ts` for journal entries, `links.ts` for social links. Never hardcode content in components.

**Design tokens** in `src/styles/tokens.css` define all colors, borders, shadows, radii, typography, and motion durations via CSS custom properties. Components use these variables, never hardcoded values.

**Layout CSS** lives in `src/styles/global.css`. Individual pages and components also have co-located CSS files (e.g. `ProfilePage.css`, `AuthPage.css`, `GalleryPage.css`). The global file is ~1984 lines with responsive breakpoints at 1080px, 820px, and 560px. There is no CSS module or CSS-in-JS system.

## Routing

No React Router. `App.tsx` uses a `hashchange` listener to parse the URL hash and select the active page.

Current routes:
- `#/` or `#home` — Home page
- `#/auth` — Authentication page
- `#/profile` — Personal Space (protected route — redirects to `#/auth` if not logged in)
- `#/lab` or `#/motion-lab` — Motion Lab
- `#/archive` — Archive main page
- `#/archive/images` — Image Vault
- `#/archive/notes` — Notes Vault
- `#/archive/notes/:id` — Note detail (any segment after `notes/` that is not a known category)
- `#/archive/projects` — Project Vault
- `#/gallery` — Gallery
- `#/archive/collections` — Redirects to `#/archive/images`

When adding or changing routes, also check navigation and legacy URL compatibility.

## Auth

**AuthProvider** (`src/auth/AuthContext.tsx`):
- Wraps the entire app in `main.tsx` (nested: `AuthProvider` → `ProfileProvider` → `App`)
- Uses `@supabase/supabase-js` for session management
- Exposes: `loading`, `session`, `user`, `isAuthenticated`, `isConfigured`, `signUp`, `signIn`, `signOut`
- `signUp` stores `display_name` in `user.user_metadata` (one-time bootstrap value only)
- Auth return target managed via `sessionStorage` (`src/lib/authRoutes.ts`)

**Protected routes:** `#/profile` is protected — if user is not authenticated, `ProfilePage` redirects to `#/auth` and saves the return target.

**Critical invariant — Canonical identity source:**
- `profiles.display_name` in Supabase is the **runtime canonical** identity source
- `user.user_metadata.display_name` is **only** used for:
  - Signup bootstrap (new user first profile creation)
  - Old-user lazy bootstrap fallback
- Do NOT re-introduce Header runtime identity dependency on `user.user_metadata`

## Profile / Personal Space

**ProfileProvider** (`src/profile/ProfileContext.tsx`):
- Global state management for profile data
- Exposes: `profile`, `stats`, `loading`, `error`, `refresh`, `updateProfile`
- Stats include real `comments` count and `likes` count from database

**ProfilePage** (`src/pages/ProfilePage.tsx`):
- Protected route (`#/profile`)
- Shows: ProfileHero, ActivityStats, EditProfileSurface
- Back button: `history.back()` with `#/` fallback when `history.length` is insufficient (simple history behavior, not a same-origin security guard)
- Member since: formatted from `user.created_at`

**Profile API:**
- `GET /api/profile/me` (authenticated) — returns profile + stats
- `PATCH /api/profile/me` (authenticated) — updates `display_name` and `avatar_key`

**Avatar system:**
- Keys: `avatar-01` through `avatar-09`
- Default new profile avatar: `avatar-01` (set during lazy bootstrap)
- Avatar definitions in `src/data/profileAvatars.ts`

### Header Avatar State Invariant

The Header must distinguish three profile loading states:

| State | Header displays |
|-------|----------------|
| **Profile unresolved (loading)** | Neutral placeholder skeleton (NOT avatar-01) |
| **Profile loaded** | Real saved avatar from database |
| **Profile error** | Neutral placeholder (NOT permanent skeleton, NOT avatar-01 fallback) |

**Hotfix `d749261`** fixed the Header's profile API error state handling — API errors no longer masquerade as loading forever.

**Important:** Do NOT reintroduce `accountProfile?.avatarKey ?? DEFAULT_PROFILE_AVATAR_KEY` as a Header runtime fallback. When profile is unresolved, show the neutral placeholder.

### ProfileProvider Race Protection

`ProfileContext.tsx` uses three ref-based guards for mutation safety:
- `requestIdRef` — fetch request ID; stale responses are rejected
- `updateRequestIdRef` — update request ID; stale mutations are rejected
- `activeUserIdRef` — user ID; user switching invalidates in-flight operations
- `mountedRef` — component mount state

The `shouldApplyProfileMutation()` function in `profileState.ts` enforces all guards atomically. **Do not break these protections** when modifying ProfileContext.

### Lazy Bootstrap Concurrency

The Worker's `getOrCreateProfile` implements duplicate-safe / idempotent profile creation:
1. SELECT existing profile
2. If missing → conflict-safe INSERT (using `on_conflict=user_id` + `resolution=ignore-duplicates`)
3. Re-SELECT to return the canonical row

**Do NOT** change this to a simpler `SELECT → INSERT → return` pattern — that is race-prone.

### Comment Identity Consistency

- `profiles.display_name` is the canonical runtime identity source
- New comments: Worker uses `profile.display_name` as `author_name`
- Historical comments: `profiles_sync_comment_author_name` trigger syncs on profile update
- **Do NOT** change to use `user.user_metadata.display_name`

### Account Menu Semantics

- Desktop: account chip with popover
  - Uses `aria-expanded` and `aria-controls`
  - This is **NOT** an ARIA `role="menu"` pattern
  - Do NOT add `role="menu"` / `role="menuitem"` unless implementing full menu keyboard pattern
- Mobile: account summary with Profile / Sign out buttons

### Avatar Picker Semantics

- Uses `role="group"` with `aria-pressed` on each avatar option
- **NOT** `role="listbox"` / `aria-selected`
- Do NOT change to listbox unless implementing full listbox pattern

### Sign-Out Flow

When signing out from the protected `#/profile` route:
1. Navigate away from protected route (`window.location.hash = preSignOutRoute`)
2. Clear auth return target (`clearAuthReturnTarget()`)
3. Call `signOut()`

**Invariants:**
- Sign-out correctness is guaranteed by the route guard, NOT by `await requestAnimationFrame(...)`
- Do NOT re-introduce `await requestAnimationFrame(...)` as a sign-out correctness dependency
- Legitimate `requestAnimationFrame` uses for scroll/focus timing in other contexts are fine — don't remove those

## Animation System

- `motion/` wrappers (ScrollReveal, TextReveal) — scroll-triggered entrance animations via Framer Motion
- `effects/text/` — custom animated text components
- `effects/react-bits/` — ported components from React Bits, each matching a source file in `React bits/{N}.txt`
- `effects/CardTilt.tsx` — standalone spring-physics tilt (not from React Bits)
- `OrbitImages` — elliptical orbit animation used in the Signals section of the homepage
- `DesktopGridScan` — Three.js grid scan background rendered in App.tsx (home page only)
- ScrollReveal uses `viewport: { once: false }` — animations replay on scroll revisit

## Motion Lab

The Motion Lab (`#/motion-lab`) showcases interactive effects. Each effect has metadata in `src/data/effects.ts` including `integrationStatus` (`real-demo` | `metadata-only`) and `homepageUsage` (boolean). The `ReactBitsDemo` component dispatches by `effectId` to render the appropriate demo. Heavy effects (GSAP, Three.js) that aren't always visible use `HeavyEffectGate` for lazy loading.

## React Bits Integration Pattern

Each effect has a named source file in `React bits/{N}.txt` (local only — the directory is gitignored). The pipeline:
1. Source file → `src/components/effects/react-bits/{Name}.tsx` + `{Name}.css`
2. Metadata entry → `src/data/effects.ts`
3. Demo renderer → `src/components/lab/ReactBitsDemo.tsx` (add a `case`)
4. Demo CSS → `src/components/lab/ReactBitsDemo.css`
5. If used on homepage → wire into the appropriate section component

The first step (creating the component) is the only non-trivial one: convert the raw JSX/CSS to TypeScript, strip device-orientation/privacy APIs, adjust imports.

## Content Priority

Projects must not become a main section (exception: `#/archive/projects` as a vault entry in the Archive is deliberate — the Project Vault exists as a personal record, not a portfolio). Technical work only appears as a small external link near the end (in Contact).

Do not add fake achievements, work experience, photos, contact info, metrics, testimonials, or SaaS-style numbers. Unknown links stay as `#` placeholders until real URLs are provided.

### Notes Vault Content Guidelines

The Archive Notes section follows specific length-based formatting rules for optimal reading experience:

- **Short notes (150–500 words)**: Use chapter card layout
- **Medium notes (500–1200 words)**: Can use chapter cards with a mini table of contents
- **Long notes (1200+ words)**: Switch to article reading layout - avoid wrapping each paragraph in large cards

When adding new notes to `src/data/notes.ts`:
1. Keep notes focused on identity, growth, thoughts, interests, and visual storytelling
2. Match the existing glass tile UI pattern for folder display
3. Use appropriate layout based on word count
4. Ensure consistency with existing note metadata structure

### Glass Tile UI Styling

For glass tile components in the Archive Notes:

- **Label positioning**: Set `left: 60%` with `transform: translateX(-50%)` for perfect center alignment
- **Hover effect**: Labels should float up from the centered position with smooth animation
- **Glass effect**: Maintain the 3D rotation and blur effects from GlassIcons.css
- **Color gradients**: Use the predefined gradient mapping (blue, purple, orange) for different categories

### Adding Images to Visual Archive

When adding new images to the Visual Archive, **always use the `adding-visual-archive-images` skill** (`C:\Users\admin\.claude\skills\adding-visual-archive-images\SKILL.md`).

**Workflow:** User provides folder → User renames files to Chinese → User writes data entries → Agent reviews entries for format correctness → Agent converts to WebP, places files, generates thumbnails → Agent updates `visualArchive.ts` → Lint + Build.

The agent does NOT read images. User handles identification and entry writing; agent handles file conversion, placement, review, and code updates.

**Entry format spec:** `docs/visual-archive-entry-spec.md` — the format document given to other AIs for writing/reviewing archive entries. Covers all field rules, naming conventions, and the quality checklist.

## Critical: Asset Paths and GitHub Pages Base

Deployed at: `https://seiya058904.github.io/seiya-digital-journal/`

Vite config has `base: '/seiya-digital-journal/'`. Do not remove or change this.

**Fixed bug:** Hardcoded paths like `/gallery/aurora.webp` in data files 404 on the deployed site because the browser resolves them to the domain root, not the repo subpath.

**Fix:** When building public asset URLs in JS/TS, use `import.meta.env.BASE_URL`:

```ts
const base = import.meta.env.BASE_URL
const src = `${base}gallery/aurora.webp`  // → /seiya-digital-journal/gallery/aurora.webp
```

Vite rewrites paths in `index.html` and ES module imports automatically, but does NOT rewrite hardcoded strings in data files.

## Motion Principles

- Framer Motion is the primary animation runtime
- GSAP is used only for a few React Bits ports (AnimatedContent, ScrambledText, SplitText, MagicBento etc.) — loaded lazily via HeavyEffectGate where possible
- Three.js is used for GridScan and Silk (archive background)
- Animate only `transform` and `opacity` — never layout properties or large-area filters
- Respect `prefers-reduced-motion`: disable tilt, parallax, and continuous animation
- Touch devices should not depend on hover effects
- Gallery images need fixed aspect ratios, lazy loading, and stable dimensions

## Worker

**Name:** `seiya-digital-journal-api`
**Production URL:** `https://seiya-digital-journal-api.seiya-api.workers.dev`
**Source:** `worker/src/index.ts`
**Config:** `worker/wrangler.jsonc`

### Endpoints (verified against `worker/src/index.ts`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/health` | No | Health check |
| `GET` | `/api/comments` | No | List comments (query: `targetType`, `targetId`, `limit`) |
| `POST` | `/api/comments` | Yes | Create comment |
| `DELETE` | `/api/comments/:id` | Yes | Delete own comment |
| `GET` | `/api/likes/count` | No | Get like count (query: `targetType`, `targetId`) |
| `GET` | `/api/likes/me` | Yes | Check if current user liked (query: `targetType`, `targetId`) |
| `PUT` | `/api/likes` | Yes | Add like |
| `DELETE` | `/api/likes` | Yes | Remove like |
| `GET` | `/api/profile/me` | Yes | Get current user's profile + stats |
| `PATCH` | `/api/profile/me` | Yes | Update display name and avatar key |

**CORS must support** `PATCH` method (for profile updates).

### Worker Secrets (names only — NEVER record values)

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGINS`

**Service role key must NEVER be exposed to the frontend.** It is only used server-side in the Worker.

**Comment limits:** `DEFAULT_LIMIT = 20`, `MAX_LIMIT = 50` for listing comments.

**Rate limiting:** Comment creation is rate-limited to one comment per 10 seconds per user (`MIN_COMMENT_INTERVAL_MS = 10_000`), enforced by querying the user's most recent comment timestamp.

**Count queries:** Uses `HEAD` requests with `Prefer: count=exact` to get counts via `Content-Range` header without transferring rows. The `extractExactCount()` function in `src/lib/profile.ts` parses this.

**Idempotent inserts:** Both profile creation (`on_conflict=user_id`, `resolution=ignore-duplicates`) and like creation (`on_conflict=user_id,target_type,target_id`) use conflict-safe PostgREST headers.

**DELETE like:** Accepts both JSON body and query parameters — checks `Content-Type` header and falls back to query params.

**CORS:** Uses `Vary: Origin` header. Origin is echoed back rather than using `*` when allowed.

## Supabase

**Linked project ref:** `fgeiygcycxjlqgbczrfs`

**Before any remote write**, re-verify the linked project.

### Migrations (applied)

- `supabase/migrations/20260704224500_create_interactions.sql` — comments and likes tables
- `supabase/migrations/20260705000100_create_profiles.sql` — profiles table with trigger

### Profiles Table (`public.profiles`)

| Column | Type | Constraint |
|--------|------|-----------|
| `user_id` | uuid | PK, FK → `auth.users` |
| `display_name` | text | NOT NULL, 1–80 chars |
| `avatar_key` | text | NOT NULL, regex `^avatar-[0-9]{2}$` |
| `created_at` | timestamptz | NOT NULL |
| `updated_at` | timestamptz | NOT NULL |

- RLS: enabled, anon/authenticated have no direct table access
- Trigger: `profiles_sync_comment_author_name` — syncs `author_name` in comments table when profile `display_name` changes

## Testing

Tests use Node's built-in test runner with `--experimental-strip-types` for TypeScript. 17 test files co-located with source as `*.test.ts`.

```powershell
npm test                    # run all tests (currently 70 tests)
node --experimental-strip-types --test src/data/content.test.ts  # single file
```

**Important:** Test imports must use `.ts` extensions (e.g., `import { ... } from './interactions.ts'`) — `--experimental-strip-types` doesn't resolve extensionless TypeScript imports.

All validation functions return `ValidResult<T> | InvalidResult<Code>` discriminated unions instead of throwing. The Worker converts these to HTTP errors; the frontend uses them for form validation. This pattern is used in `src/lib/interactions.ts`, `src/lib/profile.ts`, and `src/lib/authForm.ts`.

**Linter:** `oxlint` with plugins `react`, `typescript`, `oxc`. Config at `.oxlintrc.json` — only two rules explicitly configured: `react/rules-of-hooks` (error) and `react/only-export-components` (warn, `allowConstantExport: true`).

**CI pipeline** (`.github/workflows/deploy.yml`): `npm ci` → `npm test` → `npm run lint` → Worker `npm ci` + typecheck → Vite build → Deploy to GitHub Pages. Build secrets injected as env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_API_BASE_URL`.

## Git Workflow

### Before Starting

Always check:
```powershell
git status --short
git branch --show-current
git log -5 --oneline
```

### Branch Rules

- Check current branch before any operation
- New features typically use `feature/` or `fix/` branches
- Do not assume branch naming conventions
- **Do NOT** push directly to `main` without explicit user authorization
- **Do NOT** force push, squash, or merge without explicit user approval

### Staging

- **Do NOT** use `git add .` — stage only the files this task actually changes
- Stage by explicit path: `git add src/path/to/file`

### Commit Style

`feat:`, `fix:`, `remove:`, `chore:`, `docs:`, `style:`, `refactor:`

Each commit should be single-purpose with a short, clear summary.

### Restrictions

Unless explicitly authorized by the user, do NOT:
- commit
- push
- merge
- deploy
- publish
- create releases
- operate on databases

## Visual Verification Rules

Claude Code must clearly distinguish between:
- **Automated verification** — commands Claude actually ran (lint, build, test, typecheck)
- **Browser verification** — requires actually opening a browser (Playwright, screenshot, etc.)
- **User manual verification** — user checks pages in their own browser

**Do NOT claim visual verification** unless a browser was actually opened.
**Do NOT impersonate user-performed checks.** If the user checked something, list it separately as "user-verified."

## Completion Report

After changes, report:
- Branch and HEAD
- Exact changed files
- Test results (with actual output)
- Lint result
- Build result
- Worker typecheck result
- `git diff --check` result
- `git status --short`
- Browser checks actually performed vs user-performed checks
- Commit/push/deploy status
- Remaining risks

## Current State (re-verify before remote writes)

Before any remote write, re-verify:
- Git SHAs and branch
- Worker deployment state
- Linked Supabase project ref (`fgeiygcycxjlqgbczrfs`)
- Applied migrations: `20260704224500_create_interactions.sql`, `20260705000100_create_profiles.sql`

**Production manual verification (performed by user, as of PR #6):**
- Login flow
- Avatar switching
- Display name editing
- Back button
- Refresh behavior: neutral/blank placeholder → real saved avatar

## Privacy

The following keywords must NEVER appear in source code:
- `face-api`, `getUserMedia`, `modelsPath`, `DeviceOrientationEvent`, `enableWebcam`, `showPreview`
- If a React Bits source file contains them, strip that code during porting.
