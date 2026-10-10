import assert from 'node:assert/strict'
import React from 'react'
import { create, act } from 'react-test-renderer'
import { AuthPage } from '../../src/pages/AuthPage.tsx'

// Real AuthPage; only the auth SDK boundary is controlled by this isolated
// harness. Global SDK/session state is NOT touched: the harness replaces the
// entire useAuth boundary, so no real Supabase client exists in this process.
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const unhandled = []
process.on('unhandledRejection', (error) => { unhandled.push(error) })

const deferred = () => {
  let resolve, reject
  const promise = new Promise((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

let pendingSignUps = []
let pendingSignIns = []
let pendingResets = []
let pendingUpdates = []
const takeSignUps = () => pendingSignUps.splice(0)
const takeSignIns = () => pendingSignIns.splice(0)

globalThis.__authPageHarnessAuth = () => ({
  backendMessage: null,
  clearPasswordRecovery: () => {},
  isAuthenticated: false,
  isConfigured: true,
  isPasswordRecovery: false,
  loading: false,
  resetPasswordForEmail: () => { const d = deferred(); pendingResets.push(d); return d.promise },
  signIn: () => { const d = deferred(); pendingSignIns.push(d); return d.promise },
  signUp: () => { const d = deferred(); pendingSignUps.push(d); return d.promise },
  updatePassword: () => { const d = deferred(); pendingUpdates.push(d); return d.promise },
})

let tree
const mount = async () => { await act(async () => { tree = create(React.createElement(AuthPage)) }) }
const unmount = async () => { await act(async () => tree.unmount()) }

const inputs = () => tree.root.findAllByType('input')
const inputsByType = type => inputs().filter(node => node.props.type === type)
const typeInto = async (type, value, index = 0) => { await act(() => inputsByType(type)[index].props.onChange({ target: { value } })) }
const inputValue = (type, index = 0) => inputsByType(type)[index].props.value

const buttons = () => tree.root.findAllByType('button')
const switchButton = () => buttons().find(node => node.props.className === 'auth-switch-button')
const clickButton = async button => { await act(async () => { button.props.onClick() }) }

const submit = async () => {
  await act(async () => { tree.root.findByType('form').props.onSubmit({ preventDefault: () => {} }) })
}
const title = () => tree.root.findAllByType('h1').map(node => node.props.children).join('')
const feedback = () => {
  const node = tree.root.findAllByType('p').find(node => typeof node.props.className === 'string' && node.props.className.includes('auth-feedback'))
  return node ? node.props.children : null
}
const isBusy = () => tree.root.findByType('form').props['aria-busy']

// ---------- Scenario 1 (core): signup pending → switch to sign in → late signup success ----------
{
  await mount()
  await clickButton(switchButton()) // signin → signup
  await typeInto('text', 'Old Display')
  await typeInto('email', 'signup@example.invalid')
  await typeInto('password', 'signup-password-1')
  await typeInto('password', 'signup-password-1', 1) // confirm password
  await submit()
  assert.equal(isBusy(), true, 'scenario 1: signup shows submitting state')
  // user switches to sign in while the signup request is pending
  await clickButton(switchButton())
  assert.equal(title(), 'Welcome back', 'scenario 1: switched to the sign-in view')
  assert.equal(isBusy(), false, 'scenario 1: switchView clears the old submitting state')
  await typeInto('email', 'signin@example.invalid')
  await typeInto('password', 'signin-password-2')
  // the stale signup resolves with email confirmation required
  const [signup] = takeSignUps()
  assert.equal(pendingSignUps.length, 0)
  await act(async () => { signup.resolve({ ok: true, requiresEmailConfirmation: true, message: 'Check your email to confirm your account.' }) })
  assert.equal(title(), 'Welcome back', 'scenario 1: stale signup success must NOT switch to check-email')
  assert.equal(inputValue('email'), 'signin@example.invalid', 'scenario 1: new email untouched')
  assert.equal(inputValue('password'), 'signin-password-2', 'scenario 1: new password NOT cleared')
  assert.equal(feedback(), null, 'scenario 1: no stale success/feedback shown')
  await unmount()
}

// ---------- Scenario 2: signup pending → switch → late signup failure ----------
{
  await mount()
  await clickButton(switchButton())
  await typeInto('text', 'Old Display')
  await typeInto('email', 'signup@example.invalid')
  await typeInto('password', 'signup-password-1')
  await typeInto('password', 'signup-password-1', 1) // confirm password
  await submit()
  await clickButton(switchButton())
  await typeInto('email', 'signin@example.invalid')
  await typeInto('password', 'signin-password-2')
  const [signup] = takeSignUps()
  await act(async () => { signup.resolve({ ok: false, message: 'Unable to create account right now. Please try again.' }) })
  assert.equal(title(), 'Welcome back', 'scenario 2: still on the sign-in view')
  assert.equal(inputValue('email'), 'signin@example.invalid', 'scenario 2: new email untouched')
  assert.equal(inputValue('password'), 'signin-password-2', 'scenario 2: new password intact')
  assert.equal(feedback(), null, 'scenario 2: stale signup error must NOT appear on the new view')
  await unmount()
}

// ---------- Scenario 3: signup pending → switch → late signup throws ----------
{
  await mount()
  await clickButton(switchButton())
  await typeInto('text', 'Old Display')
  await typeInto('email', 'signup@example.invalid')
  await typeInto('password', 'signup-password-1')
  await typeInto('password', 'signup-password-1', 1) // confirm password
  await submit()
  await clickButton(switchButton())
  await typeInto('email', 'signin@example.invalid')
  await typeInto('password', 'signin-password-2')
  const [signup] = takeSignUps()
  await act(async () => { signup.reject(new Error('synthetic sdk crash')) })
  assert.equal(title(), 'Welcome back', 'scenario 3: still on the sign-in view')
  assert.equal(inputValue('email'), 'signin@example.invalid', 'scenario 3: new email untouched')
  assert.equal(inputValue('password'), 'signin-password-2', 'scenario 3: new password intact')
  assert.equal(feedback(), null, 'scenario 3: no stale error from the crashed operation')
  assert.equal(isBusy(), false, 'scenario 3: form is not stuck busy on the new view')
  assert.equal(unhandled.length, 0, 'scenario 3: thrown SDK errors are handled, not unhandled rejections')
  await unmount()
}

// ---------- Scenario 4: new sign-in in flight while the old signup settles ----------
{
  await mount()
  await clickButton(switchButton())
  await typeInto('text', 'Old Display')
  await typeInto('email', 'signup@example.invalid')
  await typeInto('password', 'signup-password-1')
  await typeInto('password', 'signup-password-1', 1) // confirm password
  await submit()
  await clickButton(switchButton())
  await typeInto('email', 'signin@example.invalid')
  await typeInto('password', 'signin-password-2')
  await submit()
  assert.equal(isBusy(), true, 'scenario 4: new sign-in is submitting')
  // stale signup settles while the new sign-in is still pending
  const [signup] = takeSignUps()
  await act(async () => { signup.resolve({ ok: true, requiresEmailConfirmation: true }) })
  assert.equal(isBusy(), true, 'scenario 4: stale signup finally must NOT unlock the new sign-in')
  assert.equal(title(), 'Welcome back', 'scenario 4: view stays on sign-in')
  // new sign-in completes and regains control
  const [signin] = takeSignIns()
  await act(async () => { signin.resolve({ ok: true, message: 'Signed in.' }) })
  assert.equal(isBusy(), false, 'scenario 4: new sign-in settles its own submitting state')
  await unmount()
}

// ---------- Scenario 5: A→B→A while the original signup is pending ----------
{
  await mount()
  await clickButton(switchButton()) // signin → signup
  await typeInto('text', 'Old Display')
  await typeInto('email', 'signup@example.invalid')
  await typeInto('password', 'signup-password-1')
  await typeInto('password', 'signup-password-1', 1) // confirm password
  await submit()
  await clickButton(switchButton()) // signup → signin
  await clickButton(switchButton()) // signin → signup (same view name again)
  await typeInto('text', 'New Display')
  await typeInto('email', 'new@example.invalid')
  await typeInto('password', 'new-password-3')
  await typeInto('password', 'new-password-3', 1) // confirm password
  const [signup] = takeSignUps()
  await act(async () => { signup.resolve({ ok: true, requiresEmailConfirmation: true }) })
  assert.equal(title(), 'Create your account', 'scenario 5: stays on the (new) signup view')
  assert.equal(inputValue('text'), 'New Display', 'scenario 5: new display name untouched')
  assert.equal(inputValue('email'), 'new@example.invalid', 'scenario 5: new email untouched')
  assert.equal(inputValue('password'), 'new-password-3', 'scenario 5: new password intact')
  assert.equal(feedback(), null, 'scenario 5: no stale feedback')
  await unmount()
}

// ---------- Scenario 6: no-switch contracts unchanged ----------
{
  await mount()
  // sign-in failure clears the password and shows the error (existing contract)
  await typeInto('email', 'signin@example.invalid')
  await typeInto('password', 'signin-password-2')
  await submit()
  const [signin] = takeSignIns()
  await act(async () => { signin.resolve({ ok: false, message: 'Unable to sign in with those credentials.' }) })
  assert.equal(title(), 'Welcome back')
  assert.equal(feedback(), 'Unable to sign in with those credentials.', 'scenario 6: sign-in error still shown')
  assert.equal(inputValue('password'), '', 'scenario 6: sign-in failure still clears the password')
  // signup success with confirmation still shows check-email (existing contract)
  await clickButton(switchButton())
  await typeInto('text', 'Display')
  await typeInto('email', 'signup2@example.invalid')
  await typeInto('password', 'password-4')
  await typeInto('password', 'password-4', 1) // confirm password
  await submit()
  const [signup] = takeSignUps()
  await act(async () => { signup.resolve({ ok: true, requiresEmailConfirmation: true, message: 'Check your email to confirm your account.' }) })
  assert.equal(title(), 'Check your email', 'scenario 6: signup confirmation still routes to check-email')
  await unmount()
}

assert.equal(unhandled.length, 0, 'no unhandled rejections across all scenarios')
console.log('PASS: auth view/operation ownership scenarios')
