# Seiya — Digital Growth Journal

**A personal archive built as a living, interactive editorial space.**

Projects, notes, visual experiments and fragments of a digital journey — presented through motion, typography and a carefully layered interface.

**[🌐 Open the live journal](https://seiya058904.github.io/seiya-digital-journal/)** · [Sections](#explore-the-journal) · [Get started](#start-developing) · [Content map](#where-to-edit-content)

<img width="700" alt="Seiya Digital Growth Journal project artwork" src="https://github.com/user-attachments/assets/a4ef3c33-0630-4b84-9cb0-4dd551daaf99" />


## Explore the journal

The site is meant to be *explored*: an editorial home, an archive of writing, a visual collection and a small space for motion experiments.

This is not just a static portfolio. The journal combines personal storytelling with an evolving visual interface, while keeping editable content separate from presentation code.

| Space | What belongs there |
| --- | --- |
| **Home & Profile** | Identity, introduction, journey and interests |
| **Archive** | Notes, short-form writing and learning records |
| **Projects** | Selected work and experiments |
| **Visual Archive** | Images and gallery metadata |
| **Motion Lab** | Motion explorations and interactive effects |
| **Account** | Supabase-based authentication and profile state |

The frontend is delivered as a GitHub Pages application; authenticated API operations use a separate Cloudflare Worker backed by Supabase. The public frontend is not a substitute for the server-side API.

## Architecture and technologies

| Layer | Tools |
| --- | --- |
| Frontend | React 19 · TypeScript · Vite |
| Motion & visual systems | Framer Motion · GSAP · Three.js |
| Authentication | Supabase Auth |
| API | Cloudflare Worker |
| Data | Supabase PostgreSQL |
| Deployment | GitHub Actions → GitHub Pages |

## Start developing

Node.js/npm and the checked-in lockfile are required for local frontend development.

```bash
npm ci
npm run dev
```

Open the local Vite URL (with the project's `/seiya-digital-journal/` base path). Some authenticated features additionally require valid backend configuration; do not put credentials into a public README or client code.

```bash
npm test          # Node built-in test runner
npm run lint      # Oxlint
npm run build     # TypeScript + Vite build
npm run preview   # Preview production output
```

For full browser coverage, use the repository's existing browser test workflow / `npm run test:browser` with the required browser environment.

## Where to edit content

| Location | Responsibility |
| --- | --- |
| [`src/pages/`](src/pages/) | Home, Archive, Profile, Gallery and Motion Lab views |
| [`src/components/`](src/components/) | Shared UI, presentation effects, section components |
| [`src/data/`](src/data/) | Curated copy, notes, projects, images and links |
| [`src/auth/`](src/auth/), [`src/profile/`](src/profile/) | Frontend auth and profile state |
| [`src/styles/`](src/styles/) | Tokens and application styles |
| [`worker/`](worker/) | Server-side Cloudflare Worker API |
| [`supabase/`](supabase/) | Data schema and SQL files |

Most portfolio-facing content is maintained in `src/data/`: `profile.ts`, `notes.ts`, `projects.ts`, `visualArchive.ts`, `links.ts`, `effects.ts` and related datasets. Review the actual module before changing editorial copy.

## Deployment and attribution

The frontend builds to `dist/` and is deployed via GitHub Actions under `/seiya-digital-journal/` when the repository's publishing workflow runs. Worker releases and database changes have separate procedures and must not be inferred from a successful static-site build.

See [`AGENTS.md`](AGENTS.md) for repository-specific invariants and [`PRODUCT.md`](PRODUCT.md) for product boundaries. Third-party libraries and visual materials retain their respective licensing terms; do not infer a blanket redistribution grant from this README.
