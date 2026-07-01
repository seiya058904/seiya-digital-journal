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
npm run lint         # run oxlint
npm run build        # tsc -b && vite build (outputs to dist/)
npm test             # node --experimental-strip-types --test src/**/*.test.ts
npm run preview      # preview production build locally
```

Always run `npm run lint` and `npm run build` before committing.

## Architecture

```
src/
  components/
    sections/    — Hero, About, Interests, Gallery, Thoughts, Journey, Contact
    ui/          — Header, Chapter, ActionLink (stable reusable UI)
    motion/      — ScrollReveal, TextReveal (Framer Motion wrappers)
    effects/     — AuroraBackground, CursorGlow, CardTilt, GradientBorder
  data/          — profile.ts, gallery.ts, thoughts.ts, links.ts
  styles/        — tokens.css (design tokens), global.css
  assets/        — profile-placeholder.svg, other imported images
public/
  gallery/       — 6 WebP artworks (aurora, horizon, motion, reflection, geometry, future)
  favicon.svg
```

**Sections** compose layout and content only. They do not duplicate animation logic — they call wrappers from `motion/` and `effects/`.

**Data files** are the single source of truth for all personal text, gallery items, thoughts, journey entries, and links. Edit data files first when changing content.

**Design tokens** in `src/styles/tokens.css` define all colors, borders, shadows, radii, typography, and motion durations. Components use CSS variables, not hardcoded values. First version is dark-only, but the token system supports a future light theme.

## Content Priority

Section order: Hero → About → Interests → Gallery → Thoughts → Journey → Contact

Projects must not become a main section. Technical work only appears as a small external link near the end (in Contact).

Do not add fake achievements, work experience, photos, contact info, metrics, testimonials, or SaaS-style numbers. Unknown links stay as `#` placeholders until real URLs are provided.

## Critical: Asset Paths and GitHub Pages Base

Deployed at: `https://seiya058904.github.io/seiya-digital-journal/`

Vite config has `base: '/seiya-digital-journal/'`. Do not remove this.

**Bug already encountered:** Hardcoded paths like `/gallery/aurora.webp` in data files work locally but 404 online because the browser resolves them to the domain root, not the repo subpath.

**Fix:** When building public asset URLs in JS/TS, use `import.meta.env.BASE_URL`:

```ts
const base = import.meta.env.BASE_URL
const src = `${base}gallery/aurora.webp`  // → /seiya-digital-journal/gallery/aurora.webp
```

Vite rewrites paths in `index.html` and ES module imports automatically, but it does NOT rewrite arbitrary hardcoded strings in data files. Always consider the subpath when working with asset URLs.

When replacing gallery images, verify paths after `npm run build` by checking `dist/` output.

### Replacing the Hero portrait

Replace `src/assets/profile-placeholder.svg` with a new image (keep the same import path), or put a new image in the same folder and update the import in `src/components/sections/Hero.tsx`. Use a ~4:5 ratio portrait, keep `width`, `height`, and `alt` accurate.

### Replacing Gallery images

Drop new WebP files into `public/gallery/` using the same filenames. The layout and animation continue to work without code changes. If using different filenames, update the matching `image` value in `src/data/gallery.ts`.

## Motion and Effects

Framer Motion is the animation system. React Bits is not installed.

Future React Bits effects should be introduced by replacing wrapper components in `motion/` or `effects/` — not by rewriting section components.

Keep wrapper APIs minimal: `children`, `className`, `delay`, `intensity`.

**Reduced motion:** Respect `prefers-reduced-motion`. Disable tilt, cursor glow, and strong parallax when active. Touch devices should not depend on hover effects.

**Performance:** Animate `transform` and `opacity` only. Avoid continuous animation of layout properties, heavy `box-shadow`, or large-area `filter: blur`. Gallery images need fixed aspect ratios, lazy loading, and stable dimensions.

## Git Workflow

Branch: `codex/react-premium-portfolio-page` (tracks `origin/main`)

```powershell
git status --short
git branch --show-current
```

Commit style: `feat:`, `fix:`, `chore:`, `docs:`, `style:`, `refactor:`

Do not force push, squash, or merge without explicit user approval. Do not commit `dist/`.

After changes, report: changed files, lint result, build result, commit hash, push result, git status, and confirm no force push.

## Deployment

GitHub Actions workflow at `.github/workflows/deploy.yml`:

push to `main` → `npm ci` → `npm run build` → upload `dist/` → deploy to GitHub Pages

Pages source must be set to "GitHub Actions" in repo settings. Do not switch to "Deploy from a branch" without approval.
