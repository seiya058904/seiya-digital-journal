export type AuthOperationGate = {
  begin: () => number
  revokeAll: () => void
  isCurrent: (operation: number) => boolean
}

/**
 * Ownership tokens for async auth operations (JR-03).
 *
 * Every submit begins an operation; every view switch (and unmount) revokes
 * all operations started before it. A settled operation may only touch the
 * form while its token is still current, so a late callback from a form the
 * user already left can never update the new view — even when the user
 * switched A→B→A and the view name matches again. Revoking only blocks stale
 * UI updates; it does not cancel any server-side signup, email, or password
 * action that was already sent.
 */
export function createAuthOperationGate(): AuthOperationGate {
  let generation = 0
  return {
    begin: () => {
      generation += 1
      return generation
    },
    revokeAll: () => {
      generation += 1
    },
    isCurrent: (operation: number) => generation === operation,
  }
}
