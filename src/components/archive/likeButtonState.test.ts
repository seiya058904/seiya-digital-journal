import assert from 'node:assert/strict'
import test from 'node:test'

import {
  applyInitialCountRead,
  applyLikeFailure,
  applyLikeSuccess,
  beginLike,
  createInitialLikeButtonModel,
  deriveAriaLabel,
  deriveVisibleValue,
  slotClassName,
} from './likeButtonState.ts'

const G10_PENDING = () => createInitialLikeButtonModel()

// Core JR-04 sequence: G(10) pending → P(11) succeeds → G(10) completes late.
test('late initial read after an accepted like leaves count, slots and label consistent', () => {
  let model = G10_PENDING()
  model = beginLike(model)
  model = applyLikeSuccess(model, 11)
  assert.equal(deriveVisibleValue(model), 11)
  assert.equal(deriveAriaLabel(model), 'Add a Like to the Archive — 11 likes')
  assert.match(model.liveMessage, /11 total likes/)
  assert.ok(model.slotValues[model.activeSlot] !== null, 'active slot is not null')
  // the late pre-like read completes now — it must be ignored entirely
  const after = applyInitialCountRead(model, 10)
  assert.equal(after, model, 'late initial read is a no-op after an accepted like')
  assert.equal(deriveVisibleValue(after), 11)
  assert.equal(deriveAriaLabel(after), 'Add a Like to the Archive — 11 likes')
})

test('initial read completing first, then an accepted like, animates to the new value', () => {
  let model = G10_PENDING()
  model = applyInitialCountRead(model, 10)
  assert.equal(deriveVisibleValue(model), 10)
  assert.equal(model.hasAnimated, false)
  model = beginLike(model)
  model = applyLikeSuccess(model, 11)
  assert.equal(deriveVisibleValue(model), 11)
  assert.equal(model.activeSlot, 1)
  assert.equal(model.slotValues[0], 10)
  assert.equal(model.slotValues[1], 11)
  assert.equal(slotClassName(model, 1), 'archive-like__count-value--entering')
  assert.equal(slotClassName(model, 0), 'archive-like__count-value--leaving')
})

test('a failed POST lets the trusted pending read populate the button', () => {
  let model = G10_PENDING()
  model = beginLike(model)
  model = applyLikeFailure(model, 'The like could not be saved. Please try again.')
  assert.equal(model.liked, false)
  assert.equal(model.hasAcceptedLike, false)
  model = applyInitialCountRead(model, 10)
  assert.equal(deriveVisibleValue(model), 10)
  assert.equal(deriveAriaLabel(model), 'Add a Like to the Archive — 10 likes')
  assert.equal(model.liked, false, 'failed like is not presented as liked')
})

test('read failure with a successful like still shows the accepted value', () => {
  let model = G10_PENDING()
  model = beginLike(model)
  model = applyLikeSuccess(model, 11)
  assert.equal(deriveVisibleValue(model), 11)
  // a failed read never mutates the model (component guards result.ok)
  assert.equal(deriveAriaLabel(model), 'Add a Like to the Archive — 11 likes')
})

test('both failing leaves an explicit unknown state without fake numbers', () => {
  const model = G10_PENDING()
  assert.equal(deriveVisibleValue(model), null)
  assert.equal(deriveAriaLabel(model), 'Add a Like to the Archive')
  assert.equal(model.count, null)
})

test('a legitimate smaller server value is accepted, never masked by Math.max', () => {
  let model = G10_PENDING()
  model = applyInitialCountRead(model, 10)
  model = beginLike(model)
  model = applyLikeSuccess(model, 9)
  assert.equal(deriveVisibleValue(model), 9)
  assert.equal(deriveAriaLabel(model), 'Add a Like to the Archive — 9 likes')
})

test('slot presentation classes stay valid before any animation', () => {
  let model = G10_PENDING()
  assert.equal(slotClassName(model, 0), 'archive-like__count-value--active')
  assert.equal(slotClassName(model, 1), 'archive-like__count-value--below')
  model = applyInitialCountRead(model, 10)
  assert.equal(slotClassName(model, 0), 'archive-like__count-value--active')
  assert.equal(slotClassName(model, 1), 'archive-like__count-value--below')
})
