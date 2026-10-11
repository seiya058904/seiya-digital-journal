import assert from 'node:assert/strict'
import React from 'react'
import { create, act } from 'react-test-renderer'
import { ProfileProvider, useProfile } from '../../src/profile/ProfileContext.tsx'

// Real ProfileProvider and a real useProfile consumer; only the auth identity
// and the profile HTTP transport are controlled by this isolated harness.
globalThis.IS_REACT_ACT_ENVIRONMENT = true

let auth = { isAuthenticated: true, session: { access_token: 'token-u1' }, user: { id: 'user-u1' } }
globalThis.__profileHarnessAuth = () => auth

const profileOf = (name, avatarKey = 'avatar-01') => ({
  profile: { displayName: name, avatarKey, email: 'u@example.com', memberSince: '2026-01-01T00:00:00Z' },
  stats: { comments: 3, likes: 5 },
})

const deferred = () => {
  let resolve, reject
  const promise = new Promise((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

// Every transport call is captured so the test can settle requests in any order.
let pendingGets = []
let pendingPatches = []
const takeGets = () => pendingGets.splice(0)
const takePatches = () => pendingPatches.splice(0)
globalThis.__profileHarnessApi = () => ({
  getProfileMe: () => {
    const d = deferred()
    pendingGets.push(d)
    return d.promise
  },
  updateProfileMe: () => {
    const d = deferred()
    pendingPatches.push(d)
    return d.promise
  },
})

let tree, rerender
function Probe() {
  const value = useProfile()
  globalThis.__latest = value
  return null
}
function Root() {
  const [, force] = React.useReducer(x => x + 1, 0)
  rerender = () => force()
  return React.createElement(ProfileProvider, null, React.createElement(Probe))
}

const latest = () => globalThis.__latest
const snap = () => ({
  name: latest().profile?.displayName ?? null,
  avatar: latest().profile?.avatarKey ?? null,
  loading: latest().loading,
  error: latest().error,
})

const mount = async () => { await act(async () => { tree = create(React.createElement(Root)) }) }
const unmount = async () => { await act(async () => tree.unmount()) }
const switchIdentity = async (userId, token) => {
  await act(async () => {
    auth = { isAuthenticated: true, session: { access_token: token }, user: { id: userId } }
    rerender()
  })
}
// Dispatch a save without awaiting it (the transport stays pending until the
// test settles the captured deferred).
const save = input => {
  let promise
  act(() => { promise = latest().updateProfile(input) })
  return promise
}
// Resolve a captured transport deferred inside act, flushing the resulting
// state updates. Never awaited promises must not be awaited inside act.
const settle = async (d, outcome) => { await act(async () => { d.resolve(outcome) }) }

// ---------- Scenario 1: GET begins before PATCH, GET settles first ----------
{
  await mount()
  const [get1] = takeGets()
  const patch1 = save({ displayName: 'New Name', avatarKey: 'avatar-02' })
  await settle(get1, { ok: true, data: profileOf('Old Name') })
  assert.equal(snap().name, 'Old Name', 'scenario 1: mid-flight old read is visible before the save lands')
  const [patch1Api] = takePatches()
  assert.ok(patch1Api, 'scenario 1: one save in flight')
  await settle(patch1Api, { ok: true, data: profileOf('New Name', 'avatar-02') })
  const result = await patch1
  assert.equal(result.ok, true, 'scenario 1: update succeeds')
  assert.equal(snap().name, 'New Name', 'scenario 1: final profile is the saved profile')
  assert.equal(snap().avatar, 'avatar-02', 'scenario 1: final avatar is the saved avatar')
  assert.equal(snap().loading, false, 'scenario 1: loading settles false')
  assert.equal(snap().error, null, 'scenario 1: no error overwrite')
  // A genuinely new read afterwards still applies (reads are not locked out).
  await act(async () => { latest().refresh() })
  const [get2] = takeGets()
  assert.ok(get2, 'scenario 1: refresh starts exactly one read')
  await settle(get2, { ok: true, data: profileOf('Refreshed Name') })
  assert.equal(snap().name, 'Refreshed Name', 'scenario 1: a new read after the save applies its latest result')
  assert.equal(snap().loading, false)
  await unmount()
}

// ---------- Scenario 2 (core hole): PATCH begins, token-refresh GET begins, PATCH settles first ----------
{
  await mount()
  takeGets()
  const patch1 = save({ displayName: 'New Name', avatarKey: 'avatar-02' })
  // Token refresh while PATCH is pending: a new read starts and has already
  // consumed the pre-save snapshot (it read before the write happened).
  await switchIdentity('user-u1', 'token-u1-refreshed')
  const [staleGet] = takeGets()
  assert.ok(staleGet, 'scenario 2: token refresh starts one new read')
  // PATCH succeeds first
  const [patch1Api] = takePatches()
  assert.ok(patch1Api, 'scenario 2: one save in flight')
  await settle(patch1Api, { ok: true, data: profileOf('New Name', 'avatar-02') })
  const result = await patch1
  assert.equal(result.ok, true, 'scenario 2: update succeeds')
  assert.equal(snap().name, 'New Name', 'scenario 2: saved profile visible right after success')
  // The stale read then completes with the pre-save snapshot
  await settle(staleGet, { ok: true, data: profileOf('Old Name') })
  assert.equal(snap().name, 'New Name', 'scenario 2: stale pre-save GET must not clobber the saved profile')
  assert.equal(snap().avatar, 'avatar-02', 'scenario 2: avatar stays the saved avatar')
  assert.equal(snap().loading, false, 'scenario 2: loading ends false after the stale read bails')
  assert.equal(snap().error, null, 'scenario 2: no error was set by the stale read')
  await unmount()
}

// ---------- Scenario 3: GET begins before PATCH, PATCH settles first ----------
{
  await mount()
  const [get1] = takeGets()
  const patch1 = save({ displayName: 'New Name', avatarKey: 'avatar-02' })
  const [patch1Api] = takePatches()
  assert.ok(patch1Api, 'scenario 3: one save in flight')
  await settle(patch1Api, { ok: true, data: profileOf('New Name', 'avatar-02') })
  const result = await patch1
  assert.equal(result.ok, true, 'scenario 3: update succeeds')
  await settle(get1, { ok: true, data: profileOf('Old Name') })
  assert.equal(snap().name, 'New Name', 'scenario 3: pre-save GET completing after a successful save must not win')
  assert.equal(snap().loading, false, 'scenario 3: loading settles false')
  assert.equal(snap().error, null, 'scenario 3: no error left behind')
  await unmount()
}

// ---------- Scenario 4: PATCH fails while a GET is in flight ----------
{
  await mount()
  takeGets()
  const patch1 = save({ displayName: 'New Name', avatarKey: 'avatar-02' })
  await switchIdentity('user-u1', 'token-u1-v3')
  const [staleGet] = takeGets()
  assert.ok(staleGet, 'scenario 4: token refresh starts one new read')
  // PATCH fails
  const [patch1Api] = takePatches()
  await settle(patch1Api, { ok: false, error: { code: 'NETWORK_ERROR', message: 'Unable to reach the backend right now.' } })
  const result = await patch1
  assert.equal(result.ok, false, 'scenario 4: failed update reports failure')
  assert.match(result.message, /Unable to reach the backend/, 'scenario 4: failure message is surfaced')
  // The still-current read settles with the last trusted snapshot
  await settle(staleGet, { ok: true, data: profileOf('Old Name') })
  assert.equal(snap().name, 'Old Name', 'scenario 4: last trusted read is kept after a failed save')
  assert.equal(snap().loading, false, 'scenario 4: loading settles false via the read')
  assert.equal(snap().error, null, 'scenario 4: read error stays clear')
  await unmount()
}

// ---------- Scenario 5: account switch while U1 requests are in flight ----------
{
  await mount()
  const [getU1] = takeGets()
  const patchU1 = save({ displayName: 'U1 Renamed', avatarKey: 'avatar-09' })
  // Switch to U2: mount effect clears state and starts a fresh read for U2
  await switchIdentity('user-u2', 'token-u2')
  const [getU2] = takeGets()
  assert.ok(getU2, 'scenario 5: U2 switch starts a fresh read')
  // U1's PATCH resolves late — the operation is interrupted, U2 state untouched
  const [patchU1Api] = takePatches()
  await settle(patchU1Api, { ok: true, data: profileOf('U1 Renamed', 'avatar-09') })
  const result = await patchU1
  assert.equal(result.ok, false, 'scenario 5: U1 late save is reported as interrupted')
  assert.equal(snap().name, null, 'scenario 5: U1 late save does not write U2 profile')
  assert.equal(snap().loading, true, 'scenario 5: U1 save does not settle U2 loading')
  // U1's read settles late — still ignored
  await settle(getU1, { ok: true, data: profileOf('U1 Old') })
  assert.equal(snap().name, null, 'scenario 5: U1 late read does not write U2 profile')
  assert.equal(snap().loading, true, 'scenario 5: U1 read does not settle U2 loading')
  // U2's own read completes
  await settle(getU2, { ok: true, data: profileOf('U2 Profile', 'avatar-05') })
  assert.equal(snap().name, 'U2 Profile', 'scenario 5: U2 read applies')
  assert.equal(snap().avatar, 'avatar-05')
  assert.equal(snap().loading, false, 'scenario 5: U2 loading settles')
  await unmount()
}

// ---------- Scenario 6: unmount discards late completions ----------
{
  await mount()
  const [get1] = takeGets()
  save({ displayName: 'New Name', avatarKey: 'avatar-02' })
  const snapshotBefore = snap()
  await unmount()
  await settle(get1, { ok: true, data: profileOf('Old Name') })
  const [patch1Api] = takePatches()
  await settle(patch1Api, { ok: true, data: profileOf('New Name', 'avatar-02') })
  assert.deepEqual(snap(), snapshotBefore, 'scenario 6: late completions after unmount write nothing')
}

// ---------- Scenario 7: a newer save wins over an older save ----------
{
  await mount()
  takeGets()
  save({ displayName: 'First Save', avatarKey: 'avatar-03' })
  save({ displayName: 'Second Save', avatarKey: 'avatar-04' })
  const patches = takePatches()
  assert.equal(patches.length, 2, 'scenario 7: two saves in flight')
  // older save completes last
  await settle(patches[0], { ok: true, data: profileOf('First Save', 'avatar-03') })
  assert.equal(snap().name, null, 'scenario 7: older save is discarded while newer is pending')
  await settle(patches[1], { ok: true, data: profileOf('Second Save', 'avatar-04') })
  assert.equal(snap().name, 'Second Save', 'scenario 7: newer save wins over the older save')
  assert.equal(snap().avatar, 'avatar-04')
  await unmount()
}

console.log('PASS: profile read/save ownership scenarios')
