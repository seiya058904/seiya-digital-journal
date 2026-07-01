# Seiya — Digital Identity & Personal Growth

A dark, editorial personal homepage built as a digital identity and growth journal. It uses React, TypeScript, Framer Motion, and local artwork—no online fonts or remote images.

## Install and run

`npm` is the tool that downloads this project's code libraries and runs its commands.

```powershell
npm install
npm run dev
```

Open the address printed in the terminal, usually [http://localhost:5173/](http://localhost:5173/).

## Checks and production build

```powershell
npm test
npm run lint
npm run build
```

The production-ready files are created in `dist/`.

## Change personal text

All editable content is grouped in `src/data/`:

- `profile.ts`: brand, Hero, About, Interests, and Journey
- `thoughts.ts`: featured quote and short journal entries
- `gallery.ts`: image paths, titles, captions, and Chinese notes
- `links.ts`: navigation, email, GitHub, and external portfolio links

The email, GitHub, and portfolio links currently use `#`. Replace each `href` in `src/data/links.ts` and change `placeholder` to `false`.

## Replace the Hero portrait

Replace `src/assets/profile-placeholder.svg` with your image, or put a new image in the same folder and update the import in `src/components/sections/Hero.tsx`.

For best results:

- use a portrait image close to a `4:5` ratio;
- keep the subject near the center;
- use WebP when possible to reduce loading time;
- keep the `width`, `height`, and `alt` text in `Hero.tsx` accurate.

## Replace Gallery images

The six abstract artworks are stored in `public/gallery/`:

```text
aurora.webp
horizon.webp
motion.webp
reflection.webp
geometry.webp
future.webp
```

Replace any file with a new WebP using the same filename. The layout and animation will continue to work without code changes. If you use a different filename, update the matching `image` value in `src/data/gallery.ts`.

## Design and motion

Colors, typography, spacing, borders, and motion timing are defined in `src/styles/tokens.css`. The first version is dark-only, but components use these variables so a future light theme can be added by changing tokens.

Reusable motion and visual effects live in:

- `src/components/motion/`: text and scroll reveals
- `src/components/effects/`: aurora, cursor glow, tilt, and gradient borders

This separation allows individual effects to be replaced later—including with copied React Bits components—without rewriting page sections.

## Deploy to GitHub Pages

This repository does not include an automatic deployment workflow because no GitHub repository address is configured yet.

1. Create a GitHub repository and push the project when you are ready.
2. Replace `REPOSITORY-NAME` below with that repository's name.
3. Build with the correct GitHub Pages base path:

```powershell
npm run build -- --base=/REPOSITORY-NAME/
```

4. Publish the generated `dist/` folder through GitHub Pages or a Pages deployment workflow.

If the site is deployed at a custom domain or the root of `username.github.io`, use the normal `npm run build` command instead.

## Current placeholder content

- Hero portrait: abstract gradient silhouette
- Gallery: six generated editorial abstract artworks
- Email, GitHub, and external portfolio URLs: `#`
- Text: editable introductory content based only on the approved brief
