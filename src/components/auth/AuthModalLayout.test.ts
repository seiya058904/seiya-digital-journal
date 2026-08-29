import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const componentDir = resolve(import.meta.dirname)
const modalStyles = readFileSync(resolve(componentDir, 'AuthModal.css'), 'utf8')
const modalComponent = readFileSync(resolve(componentDir, 'AuthModal.tsx'), 'utf8')

test('auth modal bounds long content without imposing viewport height on short content', () => {
  assert.match(modalStyles, /\.auth-modal__panel\s*\{[\s\S]*?max-height:\s*calc\(100svh - 2rem\);[\s\S]*?max-height:\s*calc\(100dvh - 2rem\);/)
  assert.match(modalStyles, /\.auth-modal__content\s*\{[\s\S]*?overflow-y:\s*auto;/)
  assert.match(modalStyles, /\.auth-modal \.auth-page--modal\s*\{[\s\S]*?min-height:\s*0;[\s\S]*?display:\s*block;[\s\S]*?padding:\s*0;/)
  assert.doesNotMatch(modalStyles, /\.auth-modal__panel\s*\{[^}]*min-height:/)
  assert.doesNotMatch(modalStyles, /padding-top:\s*max\(1rem,\s*10svh\)/)
})

test('auth modal restores document and body scroll locking after close', () => {
  assert.match(modalComponent, /const previousRootOverflow = document\.documentElement\.style\.overflow/)
  assert.match(modalComponent, /document\.documentElement\.style\.overflow = 'hidden'/)
  assert.match(modalComponent, /document\.documentElement\.style\.overflow = previousRootOverflow/)
})
