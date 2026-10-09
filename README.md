<h1 align="center">✦ Seiya — Digital Growth Journal</h1>

<p align="center">
  <strong>A record of making, learning, and becoming.</strong>
</p>

<p align="center">
  A dark editorial space for ideas, images, writing, and the projects behind them.<br>
  Not just a portfolio of finished things—a living archive of the journey.
</p>

<p align="center">
  <a href="https://seiya058904.github.io/seiya-digital-journal/"><strong>🌐 Enter the Journal</strong></a>
  &nbsp;·&nbsp;
  <a href="#the-three-vaults">🗃️ The Archive</a>
  &nbsp;·&nbsp;
  <a href="#beyond-the-archive">✨ Explore</a>
  &nbsp;·&nbsp;
  <a href="#visitor-interactions">💬 Leave a Thought</a>
  &nbsp;·&nbsp;
  <a href="#run-locally">⚙️ Development</a>
</p>

<p align="center">
  <sub>THREE ARCHIVE VAULTS &nbsp;·&nbsp; PERSONAL WRITING &nbsp;·&nbsp; VISUAL EXPLORATION &nbsp;·&nbsp; MOTION LAB</sub>
</p>

<p align="center">
  <img width="740" alt="Seiya Digital Growth Journal — original project artwork" src="https://github.com/user-attachments/assets/a4ef3c33-0630-4b84-9cb0-4dd551daaf99" />
</p>

---

> **A portfolio shows what was made. A journal remembers how it came to be.**
>
> Seiya is a personal digital journal about technology, language, creativity, and growth. The site connects finished work with fragments of learning and reflection, using motion and visual storytelling to give the archive its own atmosphere.

<a id="the-three-vaults"></a>
## 🗃️ The Three Vaults

The heart of the journal is a public archive: **three distinct spaces** for different kinds of personal work. Browse them independently, or enter through [The Archive](https://seiya058904.github.io/seiya-digital-journal/#/archive).

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🖼️ <a href="https://seiya058904.github.io/seiya-digital-journal/#/archive/images">Image Vault</a></h3>
      <p><sub>EDITORIAL · ILLUSTRATION · MEMORY</sub></p>
      <p>A visual archive of compositions, design studies, personal photographs, and places. Browse featured images, editorial work, memories, and city collections.</p>
      <p><strong><a href="https://seiya058904.github.io/seiya-digital-journal/#/archive/images">Explore the images →</a></strong></p>
    </td>
    <td width="50%" valign="top">
      <h3>📖 <a href="https://seiya058904.github.io/seiya-digital-journal/#/archive/notes">Notes Vault</a></h3>
      <p><sub>LEARNING · THOUGHTS · JOURNAL</sub></p>
      <p>Short essays, learning records, personal reflections, and journal fragments. Writing is grouped by theme so an idea can be followed beyond a single homepage excerpt.</p>
      <p><strong><a href="https://seiya058904.github.io/seiya-digital-journal/#/archive/notes">Read the notes →</a></strong></p>
    </td>
  </tr>
  <tr>
    <td colspan="2" valign="top">
      <h3>🧩 <a href="https://seiya058904.github.io/seiya-digital-journal/#/archive/projects">Project Vault</a></h3>
      <p><sub>WEBSITES · SYSTEMS · GAMES · EXPERIMENTS</sub></p>
      <p>The things built along the way: software tools, interactive websites, games, and visual experiments. Project records connect the work with its context, techniques, and available links rather than treating each project as an isolated thumbnail.</p>
      <p><strong><a href="https://seiya058904.github.io/seiya-digital-journal/#/archive/projects">Browse the projects →</a></strong></p>
    </td>
  </tr>
</table>

<a id="beyond-the-archive"></a>
## ✨ Beyond the Archive

The journal extends beyond its three vaults. Its homepage is a portrait of changing interests; its experiments explore how interfaces can feel as well as function.

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>🌌 A Personal Journey</h3>
      <p><sub>TECHNOLOGY · LANGUAGE · CREATIVITY</sub></p>
      <p>Explore interests in programming, English, design, and making. The homepage brings together an introduction, a personal timeline, image collections, and thoughts in progress.</p>
      <p><strong><a href="https://seiya058904.github.io/seiya-digital-journal/">Visit the homepage →</a></strong></p>
    </td>
    <td width="50%" valign="top">
      <h3>🌀 Motion Lab</h3>
      <p><sub>INTERACTION · ANIMATION · CREATIVE CODING</sub></p>
      <p>A curated collection of motion and UI experiments, including adapted React Bits examples. Some entries are interactive demos; others document experiments or planned integrations.</p>
      <p><strong><a href="https://seiya058904.github.io/seiya-digital-journal/#/lab">Enter Motion Lab →</a></strong></p>
    </td>
  </tr>
</table>

### 🎨 An Editorial Interface

- **Dark, atmospheric design** — layered backgrounds, typography, imagery, and carefully controlled contrast.
- **Motion with a purpose** — reveals, image arrangements, interactive details, and 3D experiments that support the content.
- **Room for the work** — long-form notes, individual project views, and image collections have their own reading spaces.
- **Responsive and considerate** — keyboard navigation, readable states, and support for reduced-motion preferences remain part of the experience.

> **The archive is the point.** Visual effects are there to frame the writing and images—not to make the content harder to reach.

<a id="visitor-interactions"></a>
## 💬 Leave a Thought

Visitors can explore the public journal without signing in. The archive also includes a small, optional community layer.

<p align="center"><code>READ &nbsp;→&nbsp; EXPLORE &nbsp;→&nbsp; REFLECT &nbsp;→&nbsp; LEAVE A NOTE</code></p>

- **❤️ Archive likes** — A simple public counter for the archive, rather than a social ranking system.
- **✍️ Journal stepper** — A guided way to write a short thought and submit it as a comment. Publishing requires sign-in and a configured backend.
- **👤 Personal space** — Supabase-backed authentication and profile settings for the features that need an identity.

> [!NOTE]
> Public reading and authenticated posting are separate. A visitor's comment is submitted through the Cloudflare Worker; server credentials are never part of the static site. The published site is **not** a public editor for the author's archive files.

<a id="how-it-works"></a>
## ⚙️ How It Works

The journal is a **React 19 + TypeScript + Vite** application. **Framer Motion, GSAP, and Three.js** help create the editorial transitions and interactive visual elements. The static frontend and authenticated API are deployed separately.

```text id="sk51mx"
                   GitHub Pages
              React · TypeScript · Vite
                        │
               Reader and browser UI
                        │
                Cloudflare Worker
                        │
                Supabase services
              Auth · Profiles · Comments
                     · Likes
```

The public pages use **hash-based navigation**, keeping deep links compatible with GitHub Pages. Authenticated requests go through the Worker, which validates access and keeps privileged database credentials on the server.

<a id="run-locally"></a>
## 🚀 Run Locally

Use Node.js and the committed lockfile. From the repository root:

```bash id="vyn983"
npm ci
npm run dev
```

Open the local Vite address, including the **`/seiya-digital-journal/`** base path. The archive can be explored locally; features that depend on sign-in, comments, or other API calls need a valid backend configuration.

<details>
<summary><strong>🛠️ Expand tests, project structure, and deployment notes</strong></summary>

### Verify the frontend

```bash id="zy5yba"
npm test           # Node.js / TypeScript regressions
npm run lint       # Oxlint
npm run build      # TypeScript check + Vite production build
npm run preview    # Preview built output
```

Browser regressions use Playwright Chromium and a running local Vite server. The repository's PR workflow starts Vite on `127.0.0.1:4178` before running:

```bash id="18eqid"
npm run test:browser
```

### Repository guide

| Path | Responsibility |
| --- | --- |
| [`src/pages/`](src/pages/) | Home, archive vaults, gallery, profile, and Motion Lab views |
| [`src/components/`](src/components/) | Shared UI, archive interactions, and visual effects |
| [`src/data/`](src/data/) | Authored notes, project records, image metadata, links, and profile copy |
| [`src/auth/`](src/auth/) · [`src/profile/`](src/profile/) | Authentication and client-side profile state |
| [`src/appRoute.ts`](src/appRoute.ts) | Hash-route parsing and navigation compatibility |
| [`public/`](public/) · [`src/assets/`](src/assets/) | Static media, image collections, and imported assets |
| [`worker/`](worker/) | Cloudflare Worker API and independent validation |
| [`supabase/`](supabase/) | Database migrations and schema history |

### Worker checks and deployment

The Worker has its own dependency tree. For an authorized local review:

```bash id="4qqdu6"
cd worker
npm ci
npm run typecheck
npm test
```

The [GitHub Pages workflow](.github/workflows/deploy.yml) builds the frontend and deploys `dist/` after the existing tests and checks. **Worker publishing and Supabase database operations are separate** and are not implied by a successful Pages deployment.

For implementation and maintenance boundaries, read [`AGENTS.md`](AGENTS.md) and [`PRODUCT.md`](PRODUCT.md). Image-specific rules are documented in [`docs/image-rules.md`](docs/image-rules.md).

</details>

## 📜 Content & Rights

This is a personal creative archive, not a general-purpose journaling service or a reusable social-network template. The repository does not declare a project-wide open-source license. Third-party dependencies and visual materials retain their respective licenses and attribution requirements.

---

<p align="center">
  <sub>BUILDING A DIGITAL SELF. LEARNING THROUGH CODE.</sub><br>
  <sub>Seiya · Digital Growth Journal</sub>
</p>
