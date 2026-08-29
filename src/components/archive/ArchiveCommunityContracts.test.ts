import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const componentDir = resolve(import.meta.dirname)
const likeButton = readFileSync(resolve(componentDir, 'ArchiveLikeButton.tsx'), 'utf8')
const likeStyles = readFileSync(resolve(componentDir, 'ArchiveLikeButton.css'), 'utf8')
const archivePage = readFileSync(resolve(componentDir, '../../pages/ArchivePage.tsx'), 'utf8')

test('archive community copy does not present sample comments as visitor submissions', () => {
  assert.match(archivePage, /Example notes for the community section\./)
  assert.doesNotMatch(archivePage, /Notes left by visitors through the journal stepper above\./)
  assert.doesNotMatch(archivePage, /aria-label="Visitor comments section"/)
})

test('archive like button uses action semantics instead of pressed toggle semantics', () => {
  assert.doesNotMatch(likeButton, /aria-pressed=/)
})

test('archive like label distinguishes an unknown count from a known count', () => {
  assert.match(likeButton, /count === null \? 'Add a Like to the Archive' : `Add a Like to the Archive — \$\{count\} likes`/)
  assert.doesNotMatch(likeButton, /count \?\? 0/)
})

test('archive like count slots settle without animation for reduced-motion users', () => {
  assert.match(likeStyles, /\.archive-like__count-value--entering\s*\{[^}]*animation:\s*none;[^}]*transform:\s*translateY\(0\)/s)
  assert.match(likeStyles, /\.archive-like__count-value--leaving\s*\{[^}]*animation:\s*none;[^}]*visibility:\s*hidden/s)
})
