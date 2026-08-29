import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const pageDir = resolve(import.meta.dirname)
const profilePage = readFileSync(resolve(pageDir, 'ProfilePage.tsx'), 'utf8')
const profileStyles = readFileSync(resolve(pageDir, 'ProfilePage.css'), 'utf8')

test('profile rendering no longer depends on activity statistics', () => {
  assert.doesNotMatch(profilePage, /ActivityStats|profile-loading__stats|\bstats\b/)
  assert.doesNotMatch(profileStyles, /profile-stats|profile-loading__stats/)
})
