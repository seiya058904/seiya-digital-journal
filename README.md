# Seiya — Digital Growth Journal

A dark, editorial personal digital journal. Built with React, TypeScript, Framer Motion, Three.js, and Supabase — deployed to GitHub Pages with a Cloudflare Worker API backend.

<https://seiya058904.github.io/seiya-digital-journal/>

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8 |
| Animation | Framer Motion, GSAP, Three.js |
| Auth | Supabase Auth |
| API | Cloudflare Worker |
| Database | Supabase PostgreSQL |
| Deploy | GitHub Actions → GitHub Pages |

## Quick Start

```powershell
npm install
npm run dev
```

Open [http://localhost:5173/seiya-digital-journal/](http://localhost:5173/seiya-digital-journal/).

## Scripts

```powershell
npm run dev      # Vite dev server
npm test         # Run all tests (Node built-in runner)
npm run lint     # Oxlint (zero warnings)
npm run build    # tsc -b && vite build → dist/
npm run preview  # Preview production build locally
npm ci           # Clean install (for CI)
```

## Project Structure

```
src/
├── pages/          # Route pages (Home, Archive, Auth, Profile, Gallery, Motion Lab)
├── components/
│   ├── sections/   # Home page sections
│   ├── effects/    # Visual effects + React Bits ports
│   ├── ui/         # Shared UI (Header, AccountMenu, etc.)
│   ├── profile/    # Profile editing & activity
│   └── lab/        # Motion Lab demos
├── data/           # Editable content (profile, notes, projects, links, etc.)
├── styles/         # CSS (tokens.css, global.css, co-located component CSS)
├── auth/           # AuthContext & auth utilities
├── profile/        # ProfileProvider & state
└── lib/            # Utility modules (API client, validation, etc.)
worker/src/         # Cloudflare Worker (API endpoints)
supabase/           # SQL migrations
```

## Editable Content

All user-facing text lives in `src/data/`:

| File | Purpose |
|------|---------|
| `profile.ts` | Brand, Hero, About, Interests, Journey sections |
| `thoughts.ts` | Journal quotes and short entries |
| `notes.ts` | Archive notes (learning, thoughts, journal) |
| `projects.ts` | Project vault |
| `visualArchive.ts` | Gallery image metadata |
| `links.ts` | Navigation and social links |
| `effects.ts` | Motion Lab metadata |
| `profileAvatars.ts` | Avatar definitions |

## Deploy

Push to `main` triggers a GitHub Actions workflow that builds and deploys to GitHub Pages. The base path (`/seiya-digital-journal/`) is configured in `vite.config.ts`.
