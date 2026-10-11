import assert from 'node:assert/strict'
import React from 'react'
import { create, act } from 'react-test-renderer'
import { ArchiveLikeButton } from '../../src/components/archive/ArchiveLikeButton.tsx'

// Real ArchiveLikeButton; only the like HTTP transport is controlled here.
globalThis.IS_REACT_ACT_ENVIRONMENT = true

const deferred = () => {
  let resolve, reject
  const promise = new Promise((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

let pendingGets = []
let pendingPosts = []
const takeGets = () => pendingGets.splice(0)
const takePosts = () => pendingPosts.splice(0)

globalThis.__likeHarnessApi = () => ({
  fetchLikeCount: () => { const d = deferred(); pendingGets.push(d); return d.promise },
  likeTarget: () => { const d = deferred(); pendingPosts.push(d); return d.promise },
})

let tree
const mount = async () => { await act(async () => { tree = create(React.createElement(ArchiveLikeButton)) }) }
const unmount = async () => { await act(async () => tree.unmount()) }
const settle = async (d, outcome) => { await act(async () => { d.resolve(outcome) }) }

const button = () => tree.root.findByType('button')
const aria = () => button().props['aria-label']
const slots = () => tree.root.findAllByType('span')
  .filter(node => typeof node.props.className === 'string' && node.props.className.includes('archive-like__count-value '))
  .map(node => ({ className: node.props.className, value: node.props.children }))
const visibleSlot = () => slots().find(slot => slot.className.includes('--entering') || slot.className.includes('--active'))
const liveMessage = () => {
  const node = tree.root.findAllByType('span').find(node => node.props.className === 'archive-like__live')
  return node ? node.props.children : null
}

// ---------- Scenario 1 (core): G(10) pending → P(11) success → G(10) completes ----------
{
  await mount()
  const [get] = takeGets()
  assert.ok(get, 'scenario 1: mount starts one count read')
  // like while the read is pending
  let likePromise
  await act(async () => { likePromise = button().props.onClick() })
  const [post] = takePosts()
  assert.ok(post, 'scenario 1: like POST in flight')
  await settle(post, { ok: true, data: { count: 11 } })
  await likePromise
  assert.equal(aria(), 'Add a Like to the Archive — 11 likes', 'scenario 1: aria shows the accepted count')
  assert.equal(visibleSlot()?.value, 11, 'scenario 1: visible slot shows the accepted count')
  assert.match(String(liveMessage()), /11 total likes/)
  // the late pre-like read then completes
  await settle(get, { ok: true, data: 10 })
  assert.equal(aria(), 'Add a Like to the Archive — 11 likes', 'scenario 1: aria stays 11 after the late read')
  assert.equal(visibleSlot()?.value, 11, 'scenario 1: visible count stays 11 — no dash regression')
  assert.equal(visibleSlot()?.className.includes('--entering'), true, 'scenario 1: active slot keeps its entering class')
  assert.match(String(liveMessage()), /11 total likes/, 'scenario 1: live message stays 11')
  await unmount()
}

// ---------- Scenario 2: G(10) completes first, then P(11) ----------
{
  await mount()
  const [get] = takeGets()
  await settle(get, { ok: true, data: 10 })
  assert.equal(visibleSlot()?.value, 10)
  assert.equal(aria(), 'Add a Like to the Archive — 10 likes')
  let likePromise
  await act(async () => { likePromise = button().props.onClick() })
  const [post] = takePosts()
  await settle(post, { ok: true, data: { count: 11 } })
  await likePromise
  assert.equal(visibleSlot()?.value, 11)
  assert.equal(aria(), 'Add a Like to the Archive — 11 likes')
  assert.equal(slots().every(slot => slot.value !== null), true, 'scenario 2: no empty visible slot')
  await unmount()
}

// ---------- Scenario 3: G pending → P fails → G completes (trusted recovery) ----------
{
  await mount()
  const [get] = takeGets()
  let likePromise
  await act(async () => { likePromise = button().props.onClick() })
  const [post] = takePosts()
  await settle(post, { ok: false, error: { code: 'INTERNAL_ERROR', message: 'failed' } })
  await likePromise
  assert.equal(aria(), 'Add a Like to the Archive', 'scenario 3: failed like keeps unknown aria before read lands')
  await settle(get, { ok: true, data: 10 })
  assert.equal(visibleSlot()?.value, 10, 'scenario 3: trusted read populates the button after failure')
  assert.equal(aria(), 'Add a Like to the Archive — 10 likes', 'scenario 3: aria reflects the trusted value')
  assert.match(String(liveMessage()), /could not be saved/, 'scenario 3: failure stays visible and retryable')
  assert.equal(button().props.disabled, false, 'scenario 3: button is retryable')
  await unmount()
}

// ---------- Scenario 4: G fails, P succeeds ----------
{
  await mount()
  const [get] = takeGets()
  let likePromise
  await act(async () => { likePromise = button().props.onClick() })
  const [post] = takePosts()
  await settle(post, { ok: true, data: { count: 11 } })
  await likePromise
  await settle(get, { ok: false, error: { code: 'INTERNAL_ERROR', message: 'failed' } })
  assert.equal(visibleSlot()?.value, 11)
  assert.equal(aria(), 'Add a Like to the Archive — 11 likes')
  await unmount()
}

// ---------- Scenario 5: both fail — explicit unknown, no fake numbers ----------
{
  await mount()
  const [get] = takeGets()
  let likePromise
  await act(async () => { likePromise = button().props.onClick() })
  const [post] = takePosts()
  await settle(post, { ok: false, error: { code: 'INTERNAL_ERROR', message: 'failed' } })
  await likePromise
  await settle(get, { ok: false, error: { code: 'INTERNAL_ERROR', message: 'failed' } })
  assert.equal(aria(), 'Add a Like to the Archive', 'scenario 5: unknown state aria')
  assert.equal(slots().some(slot => slot.value === '–'), true, 'scenario 5: dash placeholder, not 0 or NaN')
  await unmount()
}

// ---------- Scenario 6: legitimate smaller server value is accepted ----------
{
  await mount()
  const [get] = takeGets()
  await settle(get, { ok: true, data: 10 })
  let likePromise
  await act(async () => { likePromise = button().props.onClick() })
  const [post] = takePosts()
  await settle(post, { ok: true, data: { count: 9 } })
  await likePromise
  assert.equal(visibleSlot()?.value, 9, 'scenario 6: smaller contract value is displayed, not masked')
  assert.equal(aria(), 'Add a Like to the Archive — 9 likes')
  await unmount()
}

// ---------- Scenario 7: rapid duplicate clicks submit once per allowed click ----------
{
  await mount()
  takeGets()
  let first, second
  await act(async () => {
    first = button().props.onClick()
    second = button().props.onClick() // guarded while pending
  })
  const posts = takePosts()
  assert.equal(posts.length, 1, 'scenario 7: duplicate click while pending submits once')
  await settle(posts[0], { ok: true, data: { count: 12 } })
  await first
  await second
  assert.equal(aria(), 'Add a Like to the Archive — 12 likes')
  // unmount then settle: no crash, no state writes
  await unmount()
  const [get] = takeGets()
  if (get) await settle(get, { ok: true, data: 3 })
}

console.log('PASS: like button read/like ownership scenarios')
