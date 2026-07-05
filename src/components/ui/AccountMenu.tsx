import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown, LogOut, UserRound } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type AccountMenuProps = {
  avatarSrc: string
  displayName: string
  email: string
  onProfile: () => void
  onSignOut: () => void
}

const easeOut = [0.22, 1, 0.36, 1] as const

export function AccountMenu({
  avatarSrc,
  displayName,
  email,
  onProfile,
  onSignOut,
}: AccountMenuProps) {
  const reduceMotion = useReducedMotion() ?? false
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    function handlePointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleHashChange() {
      setOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('hashchange', handleHashChange)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [open])

  return (
    <div className="account-menu" ref={rootRef}>
      <button
        type="button"
        className={`account-menu__chip ${open ? 'is-open' : ''}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <img src={avatarSrc} alt="" className="account-menu__chip-avatar" />
        <span className="account-menu__chip-name">{displayName}</span>
        <ChevronDown aria-hidden="true" size={15} className="account-menu__chip-icon" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="account-menu__panel"
            role="menu"
            initial={reduceMotion ? false : { opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4, scale: 0.985 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: easeOut }}
          >
            <div className="account-menu__summary">
              <img src={avatarSrc} alt="" className="account-menu__summary-avatar" />
              <div>
                <p className="account-menu__summary-name">{displayName}</p>
                <p className="account-menu__summary-email">{email}</p>
              </div>
            </div>

            <button
              type="button"
              className="account-menu__item"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onProfile()
              }}
            >
              <span><UserRound aria-hidden="true" size={15} /> Profile</span>
              <span aria-hidden="true">→</span>
            </button>

            <button
              type="button"
              className="account-menu__item"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onSignOut()
              }}
            >
              <span><LogOut aria-hidden="true" size={15} /> Sign out</span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
