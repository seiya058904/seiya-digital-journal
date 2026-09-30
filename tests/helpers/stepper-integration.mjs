import assert from 'node:assert/strict'
import React from 'react'
import { create, act } from 'react-test-renderer'
import { JournalStepperDemo } from '../../src/components/effects/react-bits/JournalStepperDemo.tsx'

// Real parent/child components and lifecycle helper; only motion hosts, auth,
// network transport, storage and clock are controlled by this isolated harness.
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const values = new Map(), timers = new Map()
let timerId = 0, posts = 0, result = { ok: true }
globalThis.sessionStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
globalThis.setTimeout = function (fn, ms) {
  assert.ok(this === undefined || this === globalThis, "Window timers reject an arbitrary receiver")
  timers.set(++timerId, { fn, ms }); return timerId
}
globalThis.clearTimeout = function (id) {
  assert.ok(this === undefined || this === globalThis, "Window timers reject an arbitrary receiver")
  timers.delete(id)
}
globalThis.__createComment = async () => { posts++; return result }
let tree
const mount = async () => { await act(() => { tree = create(React.createElement(JournalStepperDemo)) }) }
const unmount = async () => { await act(() => tree.unmount()) }
const buttons = text => tree.root.findAllByType('button').filter(node => node.props.children === text)
const click = async text => { await act(async () => { await buttons(text)[0].props.onClick() }) }
const thought = async value => { await act(() => tree.root.findByType('input').props.onChange({ target: { value } })) }
const reachLast = async () => { await click('Continue'); await click('Continue'); await thought('Synthetic regression thought'); await click('Continue') }
const tick = async ms => { await act(() => { for (const [id, timer] of [...timers]) if (timer.ms <= ms) { timers.delete(id); timer.fn() } }) }

await mount()
await reachLast()
await click('Complete')
assert.equal(posts, 1)
assert.equal(values.get('archive-stepper-step'), '1')
assert.ok(tree.root.findAllByType('p').some(node => node.props.children === 'Comment published.'))
await tick(1800)
assert.equal(buttons('Continue').length, 0)
await tick(2020)
assert.equal(buttons('Continue').length, 1)
assert.equal(values.get('archive-stepper-step'), '1')
await unmount()
await mount()
assert.equal(buttons('Continue').length, 1)
await unmount()

values.set('archive-stepper-step', '5')
await mount()
assert.equal(buttons('Continue').length, 1, 'legacy completion restores first input step')
await reachLast()
result = { ok: false, error: { message: 'Synthetic failure' } }
await click('Complete')
assert.equal(buttons('Complete').length, 1)
assert.equal(values.get('archive-stepper-step'), '4')
assert.equal(JSON.parse(values.get('archive-stepper-thought')), 'Synthetic regression thought')
result = { ok: true }
await click('Complete')
await unmount()
assert.equal(timers.size, 0, 'unmount cancels success timers')
await mount()
assert.equal(buttons('Continue').length, 1, 'leaving during feedback restores first step')
await reachLast()
await click('Complete')
await act(() => tree.root.findAllByType('button').find(node => node.props['aria-label'] === 'Go to step 1').props.onClick())
assert.equal(timers.size, 0, 'manual navigation cancels old reset')
await unmount()

values.set('archive-stepper-step', '1')
await mount()
await reachLast()
let resolve
result = new Promise(done => { resolve = done })
let pending
const before = posts
await act(() => {
  const complete = buttons('Complete')[0].props.onClick
  pending = complete()
  complete()
})
assert.equal(posts, before + 1, 'same-turn duplicate click submits once')
assert.ok(tree.root.findAllByType('button').filter(node => node.props['aria-label']).every(node => node.props.disabled))
await unmount()
await act(async () => { resolve({ ok: true }); await pending })
assert.equal(timers.size, 0, 'late completion does not schedule work after unmount')
assert.equal(values.get('archive-stepper-step'), '4')
console.log('PASS: success, reset, remount, legacy 5, failure/retry, feedback leave, manual navigation, duplicate submission and late unmount')
