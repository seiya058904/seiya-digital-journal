import assert from 'node:assert/strict'
import test from 'node:test'

import { effects } from './effects.ts'
import { navigation, socialLinks } from './links.ts'
import { profile } from './profile.ts'
import { thoughts } from './thoughts.ts'
import { visualArchiveItems } from './visualArchive.ts'

test('the journal content keeps the approved identity and chapter order', () => {
  assert.equal(profile.brand, 'Seiya')
  assert.deepEqual(
    navigation.map(({ label }) => label),
    ['Home', 'About', 'Interests', 'Gallery', 'Thoughts', 'Journey', 'Contact'],
  )
  assert.equal(navigation.some(({ label }) => label === 'Projects'), false)
})

test('thoughts and placeholder links are explicit', () => {
  assert.equal(thoughts.featured.quote, 'Curiosity is not a mood. It is a method.')
  assert.ok(socialLinks.length > 0, 'social links are defined')
  assert.ok(
    socialLinks.every(({ href }) => href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')),
    'all social links have valid href schemes',
  )
})

test('Motion Lab distinguishes real React Bits demos from metadata', () => {
  assert.deepEqual(
    effects
      .filter(({ integrationStatus }) => integrationStatus === 'real-demo')
      .map(({ name }) => name)
      .sort(),
    [
      'AnimatedContent', 'BorderGlow', 'BounceCards', 'CardNav', 'CountUp',
      'Folder', 'GlareHover', 'GlassIcons', 'GradientText', 'GridScan',
      'ImageTrail', 'MagicBento', 'MultiStepLoader', 'OrbitImages', 'PillNav',
      'ProfileCard', 'RotatingText', 'ScrambledText', 'ShinyText', 'SplitText',
      'Stack', 'Stepper', 'TiltedCard',
    ],
  )
  assert.equal(
    effects
      .filter(({ integrationStatus }) => integrationStatus === 'real-demo')
      .every(({ sourceFile }) =>
        sourceFile.startsWith('React bits/') ||
        sourceFile === '@aceternity/multi-step-loader'
      ),
    true,
  )
  assert.equal(
    effects.find(({ name }) => name === 'MultiStepLoader')?.sourceFile,
    '@aceternity/multi-step-loader',
  )
  assert.equal(
    effects.find(({ name }) => name === 'Stepper')?.sourceFile,
    'React bits/29.txt',
  )
  assert.equal(
    effects.find(({ name }) => name === 'GlareHover')?.homepageUsage,
    true,
  )
})

test('square archive images keep square aspect metadata', () => {
  const squareIds = [
    'editorial-017',
    'editorial-020',
    'wuhan-003',
    'illustration-013',
    'art-007',
  ]

  assert.deepEqual(
    visualArchiveItems
      .filter(({ id }) => squareIds.includes(id))
      .map(({ id, aspect }) => [id, aspect]),
    squareIds.map((id) => [id, 'square']),
  )
})
