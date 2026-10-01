import assert from 'node:assert/strict'
let comments = 0
const user = { id: '00000000-0000-4000-8000-000000000018', aud: 'authenticated', role: 'authenticated', email: 'synthetic@example.invalid', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' }
globalThis.fetch = async (url, init) => {
  if (String(url).includes('/api/comments')) {
    comments++
    assert.equal(new Headers(init.headers).get('Authorization'), 'Bearer synthetic-access')
    assert.equal(JSON.parse(init.body).body, 'Synthetic regression comment')
    return Response.json({ ok: true, data: { id: 'synthetic-comment' } })
  }
  return Response.json({ access_token: 'synthetic-access', refresh_token: 'synthetic-refresh', token_type: 'bearer', expires_in: 3600, user })
}
const { getSupabaseClient, setRememberedAuthSession } = await import('../../src/lib/supabase.ts')
const { createComment } = await import('../../src/lib/api.ts')
const client = getSupabaseClient()
try {
  await client.auth.initialize()
  setRememberedAuthSession(false)
  assert.equal((await client.auth.signInWithPassword({ email: user.email, password: 'synthetic-password' })).error, null)
  assert.equal((await createComment({ targetType: 'archive', targetId: 'stepper', body: 'Synthetic regression comment' })).ok, true)
  assert.equal(comments, 1)
} finally { await client.auth.stopAutoRefresh() }
console.log('PASS real client factory, adapter, SDK and comment API send the current temporary identity')
