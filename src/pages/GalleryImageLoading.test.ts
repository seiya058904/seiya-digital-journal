import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

test('gallery trail uses thumbnails and defers image decoding', () => {
  const galleryPage = readFileSync(resolve(import.meta.dirname, 'GalleryPage.tsx'), 'utf8')
  const imageTrail = readFileSync(resolve(import.meta.dirname, '../components/effects/react-bits/ImageTrail.tsx'), 'utf8')

  assert.match(galleryPage, /\.map\(itemThumbSrc\)/)
  assert.match(imageTrail, /loading="lazy"/)
  assert.match(imageTrail, /decoding="async"/)
})
