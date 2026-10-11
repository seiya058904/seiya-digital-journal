import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { act, create } from 'react-test-renderer'
import { fetchLikeCount, likeTarget } from '../../src/lib/api.ts'
import { ArchiveLikeButton } from '../../src/components/archive/ArchiveLikeButton.tsx'

globalThis.IS_REACT_ACT_ENVIRONMENT = true
const target = { targetType: 'fixture', targetId: 'body-failure' }
const response = (payload, ok = true) => ({ ok, json: async () => payload })
const invalid = [
  ['body rejection', () => ({ ok: true, json: async () => { throw new Error('interrupted body') } })],
  ['null envelope', () => response(null)],
  ['missing envelope', () => response({})],
  ['missing data', () => response({ ok: true })],
  ['null data', () => response({ ok: true, data: null })],
  ['missing count', () => response({ ok: true, data: {} })],
  ['string count', () => response({ ok: true, data: { count: '11' } })],
  ['negative count', () => response({ ok: true, data: { count: -1 } })],
  ['fractional count', () => response({ ok: true, data: { count: 1.5 } })],
  ['unsafe count', () => response({ ok: true, data: { count: Number.MAX_SAFE_INTEGER + 1 } })],
]
for (const [name, build] of invalid) {
  test(`API rejects ${name} without throwing or accepting unknown data`, async () => {
    globalThis.fetch = async () => build()
    for (const request of [() => likeTarget(target), () => fetchLikeCount(target)]) {
      const result = await request()
      assert.equal(result?.ok, false)
      assert.equal(result.error.code, 'INVALID_RESPONSE')
    }
  })
}
test('valid zero and smaller counts retain the API contract', async () => {
  for (const count of [0, 9]) {
    globalThis.fetch = async () => response({ ok: true, data: { count } })
    assert.deepEqual(await likeTarget(target), { ok: true, data: { count } })
    assert.deepEqual(await fetchLikeCount(target), { ok: true, data: count })
  }
})
test('HTTP and network errors remain failed results', async () => {
  globalThis.fetch = async () => response({ ok: false, error: { code: 'RATE_LIMITED', message: 'Later' } }, false)
  assert.equal((await likeTarget(target)).error.code, 'RATE_LIMITED')
  globalThis.fetch = async () => { throw new Error('offline') }
  assert.equal((await likeTarget(target)).error.code, 'NETWORK_ERROR')
})
test('body failure releases pending, keeps one in-flight POST and permits explicit retry', async () => {
  let releaseBody, posts = 0, tree
  const body = new Promise((_, reject) => { releaseBody = reject })
  globalThis.fetch = async (_, init) => {
    if (init?.method !== 'POST') return response({ ok: true, data: { count: 10 } })
    posts++
    return posts === 1 ? { ok: true, json: () => body } : response({ ok: true, data: { count: 11 } })
  }
  try {
    await act(async () => { tree = create(React.createElement(ArchiveLikeButton)) })
    const button = () => tree.root.findByType('button')
    let first, duplicate, failure
    await act(async () => {
      first = button().props.onClick().catch(error => { failure = error })
      duplicate = button().props.onClick()
    })
    assert.equal(posts, 1)
    assert.equal(button().props.disabled, true)
    await act(async () => { releaseBody(new Error('response body disconnected')); await first; await duplicate })
    assert.equal(failure, undefined, 'failed response is handled by the component')
    assert.equal(button().props.disabled, false, 'pending is released')
    assert.match(tree.root.findByProps({ role: 'status' }).props.children, /could not be saved/)
    assert.equal(posts, 1, 'there is no automatic resubmission after ambiguous failure')
    await act(async () => { await button().props.onClick() })
    assert.equal(posts, 2)
    assert.equal(button().props.disabled, false)
    assert.match(button().props['aria-label'], /11 likes/)
  } finally {
    if (tree) await act(async () => tree.unmount())
  }
})
test('a response after unmount cannot change a newly mounted button', async () => {
  let releaseBody, firstTree, secondTree, firstClick, posts = 0
  const body = new Promise(resolve => { releaseBody = resolve })
  globalThis.fetch = async (_, init) => {
    if (init?.method !== 'POST') return response({ ok: true, data: { count: 3 } })
    posts++
    return { ok: true, json: () => body }
  }
  try {
    await act(async () => { firstTree = create(React.createElement(ArchiveLikeButton)) })
    await act(async () => { firstClick = firstTree.root.findByType('button').props.onClick() })
    await act(async () => firstTree.unmount())
    firstTree = null
    await act(async () => { secondTree = create(React.createElement(ArchiveLikeButton)) })
    await act(async () => { releaseBody({ ok: true, data: { count: 999 } }); await firstClick })
    assert.match(secondTree.root.findByType('button').props['aria-label'], /3 likes/)
    assert.equal(secondTree.root.findByType('button').props.disabled, false)
    assert.equal(posts, 1)
  } finally {
    if (firstTree) await act(async () => firstTree.unmount())
    if (secondTree) await act(async () => secondTree.unmount())
  }
})
