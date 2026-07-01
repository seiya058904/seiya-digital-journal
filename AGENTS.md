# Repository Guidelines

## Project Structure & Module Organization

This is a Vite-powered React 19 and TypeScript personal journal. Application code lives in `src/`:

- `components/sections/` assembles page sections; `components/ui/` holds shared interface pieces.
- `components/motion/` and `components/effects/` contain reusable Framer Motion and visual effects.
- `pages/` contains the home page and Motion Lab; `data/` is the source of truth for editable content.
- `styles/tokens.css` defines design variables, while `styles/global.css` provides site-wide rules.
- `assets/` stores imported files; `public/gallery/` stores gallery images served as public assets.

Tests sit beside related code as `*.test.ts`. Production output goes to `dist/`; do not commit it.

## Build, Test, and Development Commands

Run `npm install` once to install dependencies.

- `npm run dev` starts the local Vite development server.
- `npm test` runs all TypeScript tests with Node's built-in test runner.
- `npm run lint` checks React and TypeScript code with Oxlint.
- `npm run build` type-checks the project and creates `dist/`.
- `npm run preview` serves the production build locally for final inspection.

Before submitting changes, run `npm test`, `npm run lint`, and `npm run build`.

## Coding Style & Naming Conventions

Match the existing style: two-space indentation, single quotes, and no semicolons. Use `PascalCase` for React components and component files, `camelCase` for functions and data, and descriptive CSS class names. Keep content in `src/data/`, not embedded in section components. Reuse design tokens instead of hardcoding colors, spacing, or motion timing. Public asset URLs must include `import.meta.env.BASE_URL` because the site deploys under `/seiya-digital-journal/`.

## Testing Guidelines

Use `node:test` with `node:assert/strict`. Name tests `*.test.ts` and place them near the module under test. Add a focused regression test for changed data rules or non-trivial logic. There is no numeric coverage target; prioritize behavior that could break silently. Run one file with:

```powershell
node --experimental-strip-types --test src/data/content.test.ts
```

## Commit & Pull Request Guidelines

History follows Conventional Commit prefixes such as `feat:`, `fix:`, `refactor:`, `docs:`, and `chore:`. Keep each commit focused and use an imperative summary. Pull requests should explain the user-visible change, list verification commands, link any relevant issue, and include before/after screenshots for visual changes. Preserve reduced-motion support and verify both the home page and `#/motion-lab`.
