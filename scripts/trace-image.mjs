/**
 * Trace an image ID through the codebase — finds its metadata,
 * then locates every page/component where it would be rendered.
 *
 * Usage: node scripts/trace-image.mjs <image-id>
 * Example: node scripts/trace-image.mjs illustration-004
 *
 * This script does NOT parse JSX logic — it uses the item's properties
 * (category, featured, city) to determine which filter-based lists
 * it belongs to, then reports all known rendering sites.
 */

import { readFileSync } from 'fs'

const targetId = process.argv[2]
if (!targetId) {
  console.error('Usage: node scripts/trace-image.mjs <image-id>')
  console.error('Example: node scripts/trace-image.mjs illustration-004')
  process.exit(1)
}

// ── 1. Read the data file ──────────────────────────────────────
const dataPath = new URL('../src/data/visualArchive.ts', import.meta.url)
const dataContent = readFileSync(dataPath, 'utf-8')

// Find the item entry — crude but reliable for our structure
const idMatch = dataContent.match(
  new RegExp(`id:\\s*'${targetId.replace(/'/g, "\\'")}'[\\s\\S]*?^\\]`, 'm')
)
if (!idMatch) {
  const idExists = dataContent.includes(`id: '${targetId}'`)
  if (!idExists) {
    console.error(`❌ Image ID "${targetId}" not found in src/data/visualArchive.ts`)
    process.exit(1)
  }
  console.error(`❌ Found id: '${targetId}' but couldn't parse the full entry block.`)
  process.exit(1)
}

const rawEntry = idMatch[0]

// Extract key fields
const get = (key) => {
  const m = rawEntry.match(new RegExp(`${key}:\\s*('[^']*'|[^,\\n]+)`))
  return m ? m[1].replace(/^'(.*)'$/, '$1').trim() : '?'
}

// Special handling for `city: null` and `featured: false`
let city = get('city')
if (city === 'null') city = null

const featured = rawEntry.includes('featured: true')
const category = get('category')
const aspect = get('aspect')
const title = get('title')

console.log(`\n📸  Tracing: ${targetId} — "${title}"`)
console.log(`   Category: ${category}   |   Featured: ${featured}   |   City: ${city}   |   Aspect: ${aspect}`)
console.log('')

// ── 2. Determine which filter-based lists include this item ────

const lists = []

// featured
if (featured) {
  lists.push({ list: 'featuredItems', desc: 'Any Featured-filtered view' })
}

// category-based
const categoryLists = {
  editorial: 'editorialItems',
  memory: 'memoryItems',
  illustration: null,  // no dedicated illustration list
  art: null,
  design: null,
}
if (categoryLists[category]) {
  lists.push({ list: categoryLists[category], desc: `Category = ${category}` })
}

// city-based
if (city) {
  lists.push({ list: `cityItems (city=${city})`, desc: `City = ${city}` })
}

// ── 3. Find all rendering sites ────────────────────────────────

console.log('📍  Rendering Sites:\n')

const sites = []

// Helper: scan file for a pattern-based description
function addSite(file, reason, lineHint) {
  sites.push({ file, reason, lineHint })
}

// Gallery.tsx (homepage) — only if in CURATED_IDS
const galleryPath = new URL('../src/components/sections/Gallery.tsx', import.meta.url)
const galleryContent = readFileSync(galleryPath, 'utf-8')
const curatedIdsBlock = galleryContent.match(/CURATED_IDS\s*=\s*\[([^\]]*)\]/)
if (curatedIdsBlock) {
  if (curatedIdsBlock[1].includes(targetId)) {
    addSite('src/components/sections/Gallery.tsx', 'Homepage Gallery — in CURATED_IDS (15 curated)', 'line ~10-26')
  } else {
    addSite('src/components/sections/Gallery.tsx', `Homepage Gallery — NOT in CURATED_IDS, skipped`, '—')
  }
}
// bounceImages (featured top 4)
if (featured) {
  addSite('src/components/sections/Gallery.tsx', 'BounceCards — only if among first 4 featured items', 'line ~40')
}

// ArchiveImagesPage.tsx
const imagesPagePath = new URL('../src/pages/ArchiveImagesPage.tsx', import.meta.url)
const imagesPageContent = readFileSync(imagesPagePath, 'utf-8')
if (featured && category === 'editorial') {
  addSite('src/pages/ArchiveImagesPage.tsx', 'Featured overview & Editorial overview (previews)', 'line ~168-224')
  addSite('src/pages/ArchiveImagesPage.tsx', 'Featured category view & Editorial category view', 'line ~72-133')
} else if (featured) {
  addSite('src/pages/ArchiveImagesPage.tsx', 'Featured overview preview (first 4 only)', 'line ~173')
  addSite('src/pages/ArchiveImagesPage.tsx', 'Featured category view (full list)', 'line ~72-133')
} else if (category === 'editorial') {
  addSite('src/pages/ArchiveImagesPage.tsx', 'Editorial overview preview (first 4 only)', 'line ~193')
  addSite('src/pages/ArchiveImagesPage.tsx', 'Editorial category view (full list)', 'line ~72-133')
}
if (city) {
  addSite('src/pages/ArchiveImagesPage.tsx', `City category view (city=${city})`, 'line ~115-125')
}
if (category === 'memory') {
  addSite('src/pages/ArchiveImagesPage.tsx', 'Memory overview preview (first 4 only)', 'line ~213')
  addSite('src/pages/ArchiveImagesPage.tsx', 'Memory category view (full list)', 'line ~72-133')
}

// ArchiveCollectionsPage.tsx
const collectionsPath = new URL('../src/pages/ArchiveCollectionsPage.tsx', import.meta.url)
const collectionsContent = readFileSync(collectionsPath, 'utf-8')
const collectionsCats = ['editorial', 'memory']
if (featured) {
  addSite('src/pages/ArchiveCollectionsPage.tsx', 'Featured section (full list)', 'line ~43')
}
if (collectionsCats.includes(category)) {
  addSite('src/pages/ArchiveCollectionsPage.tsx', `${category} section (first 6 only)`, 'line ~66-89')
}
if (city) {
  addSite('src/pages/ArchiveCollectionsPage.tsx', `City group — ${city} (full list)`, 'line ~14-16')
}

// GalleryPage.tsx
if (featured) {
  addSite('src/pages/GalleryPage.tsx', 'Featured gallery (full list)', 'line ~26')
}

// ArchivePage.tsx — only shows counts, not images
addSite('src/pages/ArchivePage.tsx', 'Count display only — image is NOT rendered here', 'line ~14-15')

// ── 4. Print results ──────────────────────────────────────────

if (sites.length === 0) {
  console.log('   (this image is defined but not rendered in any UI component)')
}

const rendered = sites.filter(s => !s.reason.includes('NOT') && !s.reason.includes('skipped') && !s.reason.includes('Count display'))
const skipped = sites.filter(s => s.reason.includes('NOT') || s.reason.includes('skipped') || s.reason.includes('Count display'))

if (rendered.length > 0) {
  console.log('   ✅ Actually rendered:')
  for (const s of rendered) {
    console.log(`      • ${s.file}`)
    console.log(`        ${s.reason}`)
    console.log(`        ${s.lineHint}`)
    console.log()
  }
}

if (skipped.length > 0) {
  console.log('   ⬜ Checked but not applicable:')
  for (const s of skipped) {
    console.log(`      • ${s.file} — ${s.reason}`)
  }
  console.log()
}

// ── 5. Check for zoom/special CSS ──────────────────────────────

const cssFiles = [
  '../src/pages/ArchiveImagesPage.css',
  '../src/styles/global.css',
]
console.log('🔍  Special CSS:\n')
let foundCSS = false
for (const cssRel of cssFiles) {
  const cssPath = new URL(cssRel, import.meta.url)
  try {
    const css = readFileSync(cssPath, 'utf-8')
    const lines = css.split('\n')
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(targetId)) {
        foundCSS = true
        const nearby = lines.slice(Math.max(0, i - 1), i + 4).join('\n')
        console.log(`   ${cssRel}:${i + 1}`)
        console.log(`   ${nearby}`)
        console.log()
      }
    }
  } catch {
    // skip if file not found
  }
}
if (!foundCSS) {
  console.log('   (no CSS targeting this image ID found)')
}

console.log('─'.repeat(50))
console.log(`Done. ${rendered.length} render locations found.`)
