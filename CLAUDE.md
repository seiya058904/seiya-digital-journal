# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Identity

This is NOT a developer portfolio. It is a personal digital journal focused on identity, growth, thoughts, interests, and visual storytelling.

**Positioning:** Digital Identity + Personal Growth Magazine

The page should feel like a premium personal magazine — Apple-like, dark editorial, cinematic, motion-rich but restrained. It should help visitors understand who Seiya is as a person, not mainly what projects he has built.

Do not turn this back into a project portfolio, SaaS landing page, dashboard, or generic resume.

## Commands

```powershell
npm install          # install dependencies
npm run dev          # start dev server at http://localhost:5173/
npm run lint         # run oxlint (no config file needed)
npm run build        # tsc -b && vite build (outputs to dist/)
npm test             # node --experimental-strip-types --test src/**/*.test.ts
npm run preview      # preview production build locally
```

Always run `npm run lint` and `npm run build` before committing. The lint has zero tolerance — no warnings allowed.

## Architecture

```
React bits/          — raw source TXT files for all 19 React Bits effects (read-only reference)
src/
  components/
    sections/        — Hero, About, Interests, Gallery, Thoughts, Journey, Contact
    ui/              — Header, Chapter, ActionLink (stable reusable UI atoms)
    motion/          — ScrollReveal, TextReveal (Framer Motion wrappers)
    effects/
      react-bits/    — ported React Bits components (GlareHover, BorderGlow, Stack,
                       TiltedCard, ProfileCard, PillNav, GridScan, BounceCards,
                       ImageTrail, MagicBento, ScrambledText, SplitText,
                       AnimatedContent, CountUp, OrbitImages, DesktopGridScan,
                       CardNav, FlowingMenu)
      text/          — custom animated text (GradientText, ShinyText, RotatingText)
      cards/         — (removed, all migrated to react-bits/)
      AuroraBackground.tsx, CardTilt.tsx, GradientBorder.tsx
    lab/             — EffectCard, HeavyEffectGate, ReactBitsDemo (Motion Lab UI)
  pages/             — HomePage, MotionLabPage, ArchivePage, ArchiveImagesPage,
                       ArchiveNotesPage, ArchiveCollectionsPage, GalleryPage
  data/              — profile.ts, gallery.ts, thoughts.ts, links.ts, effects.ts
  styles/            — tokens.css (design tokens), global.css (all page CSS),
                       hero-background.css (animated background effect)
  assets/            — profile-placeholder.svg
public/
  gallery/           — 6 WebP artworks (aurora, horizon, motion, reflection, geometry, future)
  visual-archive/    — editorial + memory photos (with thumbs/ for previews)
  orbit/             — 6 WebP images for the OrbitImages component
  favicon.svg
report/              — session completion reports (Markdown, dated filenames)
```

### Component Hierarchy

**Pages** route between `HomePage` (main journal), `MotionLabPage` (experimental effects showcase), and Archive pages (`ArchivePage`, `ArchiveImagesPage`, `ArchiveNotesPage`, `ArchiveCollectionsPage`, `GalleryPage`). Routing is hash-based (`#/motion-lab`, `#/archive`, `#/archive/images`, etc.), handled by a simple `hashchange` listener in `App.tsx` — no router library.

**Sections** compose layout and content only. They call animation wrappers from `motion/` and `effects/`. Section order: Hero → About → Current Stack → Signals → Interests → Visual Archive → Thoughts → Journey → Contact. Each section is a `<section id="...">` linked from the nav.

**Data files** are the single source of truth. Edit `src/data/profile.ts` for personal text, `gallery.ts` for gallery items, `thoughts.ts` for journal entries, `links.ts` for social links. Never hardcode content in components.

**Design tokens** in `src/styles/tokens.css` define all colors, borders, shadows, radii, typography, and motion durations via CSS custom properties. Components use these variables, never hardcoded values.

**All page CSS** lives in `src/styles/global.css` — there is no component-level CSS module system. The file is large (~1270 lines) with responsive breakpoints at 1080px, 820px, and 560px.

### Animation System

- `motion/` wrappers (ScrollReveal, TextReveal) — scroll-triggered entrance animations via Framer Motion
- `effects/text/` — custom animated text components
- `effects/react-bits/` — ported components from React Bits, each matching a source file in `React bits/{N}.txt`
- `effects/CardTilt.tsx` — standalone spring-physics tilt (not from React Bits)
- `OrbitImages` — elliptical orbit animation used in the Signals section of the homepage
- `DesktopGridScan` — Three.js grid scan background rendered in App.tsx (home page only)
- ScrollReveal uses `viewport: { once: false }` — animations replay on scroll revisit

### Motion Lab

The Motion Lab (`#/motion-lab`) showcases interactive effects. Each effect has metadata in `src/data/effects.ts` including `integrationStatus` (`real-demo` | `metadata-only`) and `homepageUsage` (boolean). The `ReactBitsDemo` component dispatches by `effectId` to render the appropriate demo. Heavy effects (GSAP, Three.js) that aren't always visible use `HeavyEffectGate` for lazy loading.

### React Bits Integration Pattern

Each effect has a named source file in `React bits/{N}.txt`. The pipeline:
1. Source file → `src/components/effects/react-bits/{Name}.tsx` + `{Name}.css`
2. Metadata entry → `src/data/effects.ts`
3. Demo renderer → `src/components/lab/ReactBitsDemo.tsx` (add a `case`)
4. Demo CSS → `src/components/lab/ReactBitsDemo.css`
5. If used on homepage → wire into the appropriate section component

The first step (creating the component) is the only non-trivial one: convert the raw JSX/CSS to TypeScript, strip device-orientation/privacy APIs, adjust imports.

## Content Priority

Projects must not become a main section. Technical work only appears as a small external link near the end (in Contact).

Do not add fake achievements, work experience, photos, contact info, metrics, testimonials, or SaaS-style numbers. Unknown links stay as `#` placeholders until real URLs are provided.

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

### Replacing the Hero portrait

Replace `src/assets/profile-placeholder.svg` with a new image (keep the same import path), or put a new image in the same folder and update the import in `src/components/sections/Hero.tsx`. Use a ~4:5 ratio portrait, keep `width`, `height`, and `alt` accurate.

### Replacing Gallery images

Drop new WebP files into `public/gallery/` using the same filenames. The layout and animation continue to work without code changes. If using different filenames, update the matching `image` value in `src/data/gallery.ts`.

## Motion Principles

- Framer Motion is the primary animation runtime
- GSAP is used only for a few React Bits ports (AnimatedContent, ScrambledText, SplitText, MagicBento etc.) — loaded lazily via HeavyEffectGate where possible
- Three.js is used for GridScan only
- Animate only `transform` and `opacity` — never layout properties or large-area filters
- Respect `prefers-reduced-motion`: disable tilt, parallax, and continuous animation
- Touch devices should not depend on hover effects
- Gallery images need fixed aspect ratios, lazy loading, and stable dimensions

## Testing

Tests use Node's built-in test runner with `--experimental-strip-types` for TypeScript.

```powershell
npm test                    # run all tests
node --experimental-strip-types --test src/data/content.test.ts  # single file
```

Test files:
- `src/data/content.test.ts` — validates content integrity (brand name, navigation order, gallery filenames, placeholder links)
- `src/components/effects/CardTilt.test.ts` — tests tilt calculation logic

## Git Workflow

Branch: `codex/*` branches off `origin/main`

```powershell
git status --short
git branch --show-current
```

Commit style: `feat:`, `fix:`, `remove:`, `chore:`, `docs:`, `style:`, `refactor:`

Push: `git push origin HEAD:main` (pushes current branch to origin/main)

Do not force push, squash, or merge without explicit user approval. Do not commit `dist/`. Do not use `git add .` — only stage files this PR actually changes.

After changes, report: changed files, lint result, build result, commit hash, push result, git status, and confirm no force push.

Completion reports are saved to `report/{topic}-{yyyy-mm-dd}.md`.

## Deployment

GitHub Actions workflow at `.github/workflows/deploy.yml`:

push to `main` → `npm ci` → `npm run build` → upload `dist/` → deploy to GitHub Pages

Pages source must be set to "GitHub Actions" in repo settings. Do not switch to "Deploy from a branch" without approval.

## Privacy

The following keywords must NEVER appear in source code:
- `face-api`, `getUserMedia`, `modelsPath`, `DeviceOrientationEvent`, `enableWebcam`, `showPreview`
- If a React Bits source file contains them, strip that code during porting.

## Intentionally Skipped Features

- **Lanyard** (3D physics card) — intentionally not integrated
- **CardNav** (card-based navigation) — intentionally not integrated
