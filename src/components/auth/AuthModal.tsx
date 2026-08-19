import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { createPortal } from 'react-dom'

import { getWrappedFocusTarget } from '../profile/focusTrap'
import { AuthPage } from '../../pages/AuthPage'
import './AuthModal.css'

type AuthModalProps = {
  open: boolean
  onClose: () => void
}

export function AuthModal({ open, onClose }: AuthModalProps) {
  const reduceMotion = useReducedMotion() ?? false
  const panelRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return

    previousFocusRef.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusFirstControl = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('input, button')?.focus()
    }, 0)

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleEscape)
    return () => {
      window.clearTimeout(focusFirstControl)
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = previousOverflow
      previousFocusRef.current?.focus()
    }
  }, [onClose, open])

  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return
    const panel = panelRef.current
    if (!panel) return

    const focusableElements = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => element.getAttribute('aria-hidden') !== 'true' && element.tabIndex >= 0)
    if (!focusableElements.length) return

    const activeIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
    const targetIndex = getWrappedFocusTarget({
      activeIndex,
      focusableCount: focusableElements.length,
      shiftKey: event.shiftKey,
    })
    if (targetIndex === null) return

    event.preventDefault()
    focusableElements[targetIndex]?.focus()
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="auth-modal"
          data-lenis-prevent
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          <motion.div
            ref={panelRef}
            className="auth-modal__panel"
            initial={reduceMotion ? false : { opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.985 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Sign in or create an account"
            onKeyDown={handlePanelKeyDown}
          >
            <button
              type="button"
              className="auth-modal__close"
              onClick={onClose}
              aria-label="Close sign in dialog"
            >
              <X aria-hidden="true" size={18} />
            </button>
            <AuthPage variant="modal" onAuthenticated={onClose} onBack={onClose} />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
