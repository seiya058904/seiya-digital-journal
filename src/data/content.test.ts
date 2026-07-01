import assert from 'node:assert/strict'
import test from 'node:test'

import { effects } from './effects.ts'
import { galleryItems } from './gallery.ts'
import { navigation, socialLinks } from './links.ts'
import { profile } from './profile.ts'
import { thoughts } from './thoughts.ts'

test('the journal content keeps the approved identity and chapter order', () => {
  assert.equal(profile.brand, 'Seiya')
  assert.deepEqual(
    navigation.map(({ label }) => label),
    ['Home', 'About', 'Interests', 'Gallery', 'Thoughts', 'Journey', 'Contact'],
  )
  assert.equal(navigation.some(({ label }) => label === 'Projects'), false)
})

test('gallery resources keep stable, replaceable filenames', () => {
  assert.deepEqual(
    galleryItems.map(({ image }) => image),
    [
      '/gallery/aurora.webp',
      '/gallery/horizon.webp',
      '/gallery/motion.webp',
      '/gallery/reflection.webp',
      '/gallery/geometry.webp',
      '/gallery/future.webp',
    ],
  )
  assert.equal(new Set(galleryItems.map(({ theme }) => theme)).size, 6)
})

test('thoughts and placeholder links are explicit', () => {
  assert.equal(thoughts.featured.quote, 'Curiosity drives everything.')
  assert.equal(socialLinks.every(({ placeholder }) => placeholder), true)
  assert.equal(socialLinks.every(({ href }) => href === '#'), true)
})

test('Motion Lab distinguishes real React Bits demos from metadata', () => {
  assert.deepEqual(
    effects
      .filter(({ integrationStatus }) => integrationStatus === 'real-demo')
      .map(({ name }) => name),
    ['BorderGlow', 'GlareHover', 'TiltedCard', 'Stack'],
  )
  assert.equal(
    effects
      .filter(({ integrationStatus }) => integrationStatus === 'real-demo')
      .every(({ sourceFile }) => sourceFile.startsWith('React bits/')),
    true,
  )
  assert.equal(
    effects.find(({ name }) => name === 'GlareHover')?.homepageUsage,
    true,
  )
})
