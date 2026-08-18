import { useMemo, useReducer, type PropsWithChildren } from 'react'

import { authModalReducer, initialAuthModalState } from './authModal'
import { authModalContext } from './authModalStore'

export function AuthModalProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(authModalReducer, initialAuthModalState)
  const value = useMemo(() => ({
    isOpen: state.isOpen,
    openAuthModal: () => dispatch({ type: 'open' }),
    closeAuthModal: () => dispatch({ type: 'close' }),
  }), [state.isOpen])

  return <authModalContext.Provider value={value}>{children}</authModalContext.Provider>
}
