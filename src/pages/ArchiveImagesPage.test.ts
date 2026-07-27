import assert from 'node:assert/strict'
import test from 'node:test'

import { getArchiveImageCategoryFromHash } from './archiveImageRoute.ts'

test('archive image categories tolerate trailing slashes', () => {
  assert.equal(getArchiveImageCategoryFromHash('#/archive/images/featured/'), 'featured')
  assert.equal(getArchiveImageCategoryFromHash('#/archive/images/editorial///'), 'editorial')
})
