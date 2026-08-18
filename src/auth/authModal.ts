export type AuthModalState = {
  isOpen: boolean
}

export type AuthModalAction =
  | { type: 'open' }
  | { type: 'close' }

export const initialAuthModalState: AuthModalState = { isOpen: false }

export function authModalReducer(state: AuthModalState, action: AuthModalAction): AuthModalState {
  return action.type === 'open'
    ? { ...state, isOpen: true }
    : { ...state, isOpen: false }
}
