# Audit Follow-up Fix Report

## A. Repository State

- Branch: `fix/audit-followup-small-safe-fixes`
- HEAD before: `62c76fc3b6ed4266a1a3b5117ba41a1fd57d9d05`
- origin/main: `62c76fc3b6ed4266a1a3b5117ba41a1fd57d9d05`
- Ahead / behind before work: `0 / 0`
- Working tree before work: only the prior requested `AUDIT-REPORT-2026-07.md` was untracked; it was preserved and not included in this repair scope.

## B. Files Changed

- `src/components/sections/GalleryCard.tsx`: production card images now use the existing thumb as the 1x source and full image as the 2x source.
- `src/data/visualArchive.ts`: added the small source-selection helper reused by GalleryCard.
- `src/pages/GalleryPage.css`: moved `editorial-023` and `illustration-033` from the `-8%` group to the `-14%` group.
- `src/components/effects/react-bits/Stack.tsx`: uses the tested click-enablement condition without changing mobile drag behavior.
- `src/components/effects/react-bits/stackState.ts`: contains the isolated click condition.
- `src/components/effects/react-bits/stackState.test.ts`: covers desktop behavior and mobile `mobileClickOnly` behavior.
- `src/data/visualArchiveIntegrity.test.ts`: covers card image sources, confirmed strong shifts, and the CLAUDE path invariant.
- `CLAUDE.md`: replaced the two stale Visual Archive spec paths.
- `AUDIT-FIX-REPORT-2026-07.md`: this report.

No package file, lockfile, Worker source, migration, Supabase file, or image binary was changed.

## C. Fixes Completed

### 1. Thumbnail usage

Measured thumbnail widths range from 260px to 560px, with a median near 331px. Existing grid cards are commonly about 280–430 CSS px, so forcing thumbs at high DPR would risk visible blur.

The conservative fix uses:

- thumb as the `1x` candidate;
- the existing full image as the `2x` candidate;
- unchanged `width`, `height`, aspect ratio, object-fit, crop selectors, hover transform, lazy loading, and async decoding.

This makes production GalleryCard markup genuinely reference thumbnails while retaining the previous full-image path for high-DPR displays. No modal, image library, CDN, regenerated asset, or complex responsive image system was added.

### 2. Image shift consistency

The two confirmed drifted entries now match Image Vault:

- `editorial-023`: `translateY(-14%)`
- `illustration-033`: `translateY(-14%)`

Their hover states retain the existing `scale(1.025)` behavior.

`editorial-004` and `illustration-004` were inspected but not changed. `editorial-004` already has a global URL-based zoom rule. There was not enough evidence that `illustration-004` requires the same Gallery treatment, so the possible design difference was preserved.

### 3. Mobile Stack interaction

- Desktop behavior is unchanged: `sendToBackOnClick` and the existing `mobileClickOnly` desktop behavior still enable click.
- Mobile drag remains disabled.
- Mobile click is enabled when `mobileClickOnly` is true.
- The homepage Stack remains wrapped by `DesktopOnly` and its props were not changed.

### 4. CLAUDE path

Both references to the deleted `docs/visual-archive-entry-spec.md` were replaced with `docs/visual-archive-entry-spec-optimized.md`. The old reference count is now zero; no duplicate or restored document was created.

## D. Intentionally Not Fixed

The following known findings were intentionally left unchanged, as required:

- Comment rate-limit race
- Avatar DB constraint
- Wrangler dev dependency vulnerabilities

No Worker rate-limit architecture, Cloudflare binding, RPC, advisory lock, migration, database rule, or dependency version was changed. These are deliberate scope exclusions, not omissions.

## E. Validation

- `npm ci`: passed; root audit reported 0 vulnerabilities
- `npm test`: passed, 84/84
- `npm run lint`: passed
- `npm run build`: passed
- `worker/npm ci`: passed; existing dev-only audit warnings unchanged
- `worker/npm run typecheck`: passed
- Targeted red-green tests: 14/14 passed after reproducing all four pre-fix failures
- `git diff --check`: passed
- Old CLAUDE path references: 0
- New dependencies: none
- Migrations: none
- Worker rate-limit changes: none
- Image binary changes: none
- Browser visual inspection was not performed by request; user will manually verify the page.

## F. Manual Checks Needed

1. On a 4K display at 100% scaling, confirm 1x thumbnail candidates remain acceptably sharp. High-DPR scaling should select the full 2x candidate.
2. In Gallery, confirm `editorial-023` and `illustration-033` match the Image Vault crop and keep their hover zoom.
3. On a phone-sized viewport, open Motion Lab → Stack and confirm tapping advances a card while drag remains disabled.
