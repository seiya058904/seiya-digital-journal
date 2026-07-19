import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
import test from 'node:test'

import {
  getArchiveCardImageSources,
  visualArchiveItems,
} from './visualArchive.ts'

const PUBLIC_DIR = resolve(import.meta.dirname, '../../public')
const ROOT_DIR = resolve(import.meta.dirname, '../..')

test('all item ids are unique', () => {
  const seen = new Map<string, number>()
  const dupes: string[] = []
  visualArchiveItems.forEach((item, i) => {
    if (seen.has(item.id)) {
      dupes.push(`"${item.id}" (indices ${seen.get(item.id)!} and ${i})`)
    } else {
      seen.set(item.id, i)
    }
  })
  assert.deepEqual(dupes, [], `Duplicate ids: ${dupes.join(', ')}`)
})

test('all full image paths are unique', () => {
  const seen = new Map<string, string>()
  const dupes: string[] = []
  for (const item of visualArchiveItems) {
    if (seen.has(item.image)) {
      dupes.push(`"${item.image}" used by "${seen.get(item.image)}" and "${item.id}"`)
    } else {
      seen.set(item.image, item.id)
    }
  }
  assert.deepEqual(dupes, [], `Duplicate image paths: ${dupes.join(', ')}`)
})

test('all thumb paths are unique', () => {
  const seen = new Map<string, string>()
  const dupes: string[] = []
  for (const item of visualArchiveItems) {
    if (seen.has(item.thumb)) {
      dupes.push(`"${item.thumb}" used by "${seen.get(item.thumb)}" and "${item.id}"`)
    } else {
      seen.set(item.thumb, item.id)
    }
  }
  assert.deepEqual(dupes, [], `Duplicate thumb paths: ${dupes.join(', ')}`)
})

test('every full image file exists on disk', () => {
  const missing = visualArchiveItems
    .filter(item => !existsSync(resolve(PUBLIC_DIR, item.image.replace(/^\//, ''))))
    .map(item => `"${item.id}" → ${item.image}`)
  assert.deepEqual(missing, [], `Missing full image files: ${missing.join(', ')}`)
})

test('every thumb file exists on disk', () => {
  const missing = visualArchiveItems
    .filter(item => !existsSync(resolve(PUBLIC_DIR, item.thumb.replace(/^\//, ''))))
    .map(item => `"${item.id}" → ${item.thumb}`)
  assert.deepEqual(missing, [], `Missing thumb files: ${missing.join(', ')}`)
})

test('full image filename matches item id', () => {
  const mismatches = visualArchiveItems
    .filter(item => basename(item.image) !== `${item.id}.webp`)
    .map(item => `"${item.id}" → basename "${basename(item.image)}"`)
  assert.deepEqual(mismatches, [], `Full image basename mismatches: ${mismatches.join(', ')}`)
})

test('thumb filename matches item id', () => {
  const mismatches = visualArchiveItems
    .filter(item => basename(item.thumb) !== `${item.id}-thumb.webp`)
    .map(item => `"${item.id}" → basename "${basename(item.thumb)}"`)
  assert.deepEqual(mismatches, [], `Thumb basename mismatches: ${mismatches.join(', ')}`)
})

test('only memory items may carry a city', () => {
  const violations = visualArchiveItems
    .filter(item => item.city !== null && item.category !== 'memory')
    .map(item => `"${item.id}": category="${item.category}", city="${item.city}"`)
  assert.deepEqual(violations, [], `Non-memory items with a city: ${violations.join(', ')}`)
})

test('category matches image directory structure', () => {
  const violations = visualArchiveItems
    .filter(item => {
      const dir = item.image.replace(/^\/visual-archive\//, '').split('/')[0]
      if (item.category === 'memory') return dir !== 'memory'
      return dir !== item.category
    })
    .map(item => `"${item.id}": category="${item.category}", path="${item.image}"`)
  assert.deepEqual(violations, [], `Category/path mismatches: ${violations.join(', ')}`)
})

test('archive grid cards offer thumbs at 1x and full images at 2x', () => {
  const item = visualArchiveItems[0]
  assert.deepEqual(getArchiveCardImageSources(item), {
    src: `/visual-archive/thumbs/${item.id}-thumb.webp`,
    srcSet: `/visual-archive/thumbs/${item.id}-thumb.webp 1x, /visual-archive/editorial/${item.id}.webp 2x`,
  })
})

test('gallery keeps confirmed lower-focused crops out of the standard crop group', () => {
  const css = readFileSync(resolve(ROOT_DIR, 'src/pages/GalleryPage.css'), 'utf8')
  const standardShiftGroup = css.slice(
    css.indexOf('/* Per-image display adjustments */'),
    css.indexOf('/* Per-image: stronger shift */'),
  )
  const strongShiftGroup = css.slice(
    css.indexOf('/* Per-image: stronger shift */'),
    css.indexOf('.gallery-masonry-item--editorial-025'),
  )

  for (const id of [
    'editorial-003',
    'editorial-014',
    'editorial-021',
    'editorial-022',
    'editorial-023',
    'editorial-042',
    'illustration-010',
    'illustration-033',
  ]) {
    assert.equal(standardShiftGroup.includes(id), false, `${id} still uses the standard crop`)
    assert.equal(strongShiftGroup.includes(id), true, `${id} is missing the strong lower crop`)
  }
  assert.match(strongShiftGroup, /object-position: center 64%/)
})

test('Claude instructions reference the image rules', () => {
  const claude = readFileSync(resolve(ROOT_DIR, 'CLAUDE.md'), 'utf8')
  assert.equal(claude.includes('visual-archive-entry-spec.md'), false)
  assert.equal(claude.includes('image-rules.md'), true)
})
