import assert from 'node:assert/strict'
import test from 'node:test'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { observeSession } from './observeSession.ts'

const session = (id: string) => ({ access_token: `token-${id}`, user: { id, email: `${id}@example.invalid` } }) as Session
const flush = () => new Promise(resolve => setTimeout(resolve, 10))

test('broadcast notifications use local SDK identity and never call SDK while notifying', async () => {
  let notifying = false
  let current: Session | null = session('a')
  let callback: (event: string, session: Session | null) => void = () => {}
  let unsubscribed = false
  const published: [Session | null, boolean][] = []
  const auth = {
    onAuthStateChange(fn: typeof callback) { callback = fn; return { data: { subscription: { unsubscribe() { unsubscribed = true } } } } },
    async getSession() { assert.equal(notifying, false); return { data: { session: current }, error: null } },
  } as unknown as SupabaseClient['auth']
  const stop = observeSession(auth, (value, recovery) => published.push([value, recovery]))
  await flush()
  for (const event of ['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED', 'PASSWORD_RECOVERY', 'SIGNED_OUT']) {
    notifying = true
    callback(event, event === 'SIGNED_OUT' ? null : session('b'))
    notifying = false
    await flush()
    assert.deepEqual(published.at(-1), [current, false])
  }
  callback('PASSWORD_RECOVERY', current)
  await flush()
  assert.deepEqual(published.at(-1), [current, true])
  current = session('b') // A remembered tab reads the new shared session.
  callback('SIGNED_IN', current)
  await flush()
  assert.deepEqual(published.at(-1), [current, false])
  current = null
  callback('SIGNED_OUT', null)
  await flush()
  assert.deepEqual(published.at(-1), [null, false])
  callback('SIGNED_IN', session('a'))
  const count = published.length
  stop()
  await flush()
  assert.equal(published.length, count)
  assert.ok(unsubscribed)
})

test('a stale read cannot overwrite a newer event or publish after unmount', async () => {
  let callback: () => void = () => {}
  const reads: ((value: unknown) => void)[] = []
  const published: (Session | null)[] = []
  const auth = {
    onAuthStateChange(fn: typeof callback) { callback = fn; return { data: { subscription: { unsubscribe() {} } } } },
    getSession() { return new Promise(resolve => reads.push(resolve)) },
  } as unknown as SupabaseClient['auth']
  const stop = observeSession(auth, value => published.push(value))
  await flush()
  callback()
  await flush()
  reads[1]({ data: { session: session('b') } })
  reads[0]({ data: { session: session('a') } })
  await flush()
  assert.deepEqual(published, [session('b')])
  callback()
  await flush()
  stop()
  reads[2]({ data: { session: null } })
  await flush()
  assert.deepEqual(published, [session('b')])
})
