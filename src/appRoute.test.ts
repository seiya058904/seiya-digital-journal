import assert from 'node:assert/strict'
import test from 'node:test'

import { getNoteIdFromHash, resolvePageFromHash } from './appRoute.ts'

test('resolvePageFromHash normalizes supported hash routes', () => {
  const cases = [
    ['#/', 'home'],
    ['#/auth', 'auth'],
    ['#/auth/', 'auth'],
    ['#/profile', 'profile'],
    ['#/profile/', 'profile'],
    ['#/gallery///', 'gallery'],
    ['#/archive/', 'archive'],
    ['#/archive/projects/', 'archive-projects'],
    ['#/archive/images/featured/', 'archive-images'],
    ['#/archive/notes/', 'archive-notes'],
    ['#/archive/notes/learning/', 'archive-notes-category'],
    ['#/archive/notes/learning-as-system/', 'archive-note-detail'],
    ['#/lab/', 'lab'],
    ['#/motion-lab/', 'lab'],
    ['#/not-a-route/', 'home'],
  ] as const

  for (const [hash, page] of cases) {
    assert.equal(resolvePageFromHash(hash), page, hash)
  }
})

test('resolvePageFromHash preserves the legacy collections redirect target', () => {
  assert.equal(resolvePageFromHash('#/archive/collections/'), 'archive-images')
})

test('getNoteIdFromHash keeps a valid note id when the route has a trailing slash', () => {
  assert.equal(getNoteIdFromHash('#/archive/notes/learning-as-system/'), 'learning-as-system')
})
