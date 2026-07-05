import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { createPortal } from 'react-dom'

import { PROFILE_AVATAR_OPTIONS } from '../../data/profileAvatars'
import { getWrappedFocusTarget } from './focusTrap'

type SaveTone = 'idle' | 'saving' | 'saved'

type EditProfileSurfaceProps = {
  open: boolean
  displayName: string
  avatarKey: string
  saveTone: SaveTone
  error: string | null
  onClose: () => void
  onSubmit: (input: { displayName: string, avatarKey: string }) => void
}

const easeOut = [0.22, 1, 0.36, 1] as const

export function EditProfileSurface({
  open,
  displayName,
  avatarKey,
  saveTone,
  error,
  onClose,
  onSubmit,
}: EditProfileSurfaceProps) {
  const reduceMotion = useReducedMotion() ?? false
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  const [draftName, setDraftName] = useState(displayName)
  const [draftAvatarKey, setDraftAvatarKey] = useState(avatarKey)

  useEffect(() => {
    if (!open) return
    setDraftName(displayName)
    setDraftAvatarKey(avatarKey)
  }, [avatarKey, displayName, open])

  useEffect(() => {
    if (!open) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && saveTone !== 'saving') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose, open, saveTone])

  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab') return

    const panel = panelRef.current
    if (!panel) return

    const focusableElements = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => {
      if (element.getAttribute('aria-hidden') === 'true') return false
      if (element.tabIndex < 0) return false
      return !(element instanceof HTMLInputElement && element.type === 'hidden')
    })

    if (focusableElements.length === 0) return

    const activeIndex = focusableElements.indexOf(document.activeElement as HTMLElement)
    if (activeIndex === -1) {
      event.preventDefault()
      const fallbackIndex = event.shiftKey ? focusableElements.length - 1 : 0
      focusableElements[fallbackIndex]?.focus()
      return
    }

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
          className="profile-edit-surface"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          <button
            type="button"
            className="profile-edit-surface__backdrop"
            aria-label="Close profile editor"
            onClick={() => {
              if (saveTone !== 'saving') onClose()
            }}
          />

          <motion.div
            ref={panelRef}
            className="profile-edit-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onKeyDown={handlePanelKeyDown}
            initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 14, scale: 0.985 }}
            transition={{ duration: reduceMotion ? 0 : 0.24, ease: easeOut }}
          >
            <div className="profile-edit-panel__header">
              <div>
                <p className="profile-kicker">Edit profile</p>
                <h2 id={titleId} className="profile-edit-panel__title">Personal Space</h2>
              </div>
              <button
                type="button"
                className="profile-edit-panel__close"
                onClick={onClose}
                disabled={saveTone === 'saving'}
                aria-label="Close profile editor"
              >
                <X aria-hidden="true" size={16} />
              </button>
            </div>

            <label className="profile-edit-field" htmlFor="profile-display-name">
              <span>Display name</span>
              <input
                id="profile-display-name"
                autoFocus
                value={draftName}
                maxLength={80}
                onChange={(event) => setDraftName(event.target.value)}
              />
            </label>

            <div className="profile-edit-field">
              <span>Choose avatar</span>
              <div className="profile-avatar-picker" role="group" aria-label="Choose avatar">
                {PROFILE_AVATAR_OPTIONS.map((avatar) => {
                  const selected = avatar.key === draftAvatarKey
                  return (
                    <button
                      key={avatar.key}
                      type="button"
                      className={`profile-avatar-option ${selected ? 'is-selected' : ''}`}
                      onClick={() => setDraftAvatarKey(avatar.key)}
                      aria-pressed={selected}
                    >
                      <img src={avatar.src} alt={avatar.label} />
                      <span className="profile-avatar-option__check" aria-hidden="true">
                        <Check size={14} />
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="profile-edit-feedback" aria-live="polite">
              {error ? <p className="profile-edit-feedback__error">{error}</p> : null}
            </div>

            <div className="profile-edit-actions">
              <button
                type="button"
                className="profile-edit-actions__secondary"
                onClick={onClose}
                disabled={saveTone === 'saving'}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`profile-edit-actions__primary ${saveTone === 'saved' ? 'is-saved' : ''}`}
                onClick={() => onSubmit({ displayName: draftName, avatarKey: draftAvatarKey })}
                disabled={saveTone === 'saving'}
              >
                <span className="profile-edit-actions__primary-label">
                  <AnimatePresence mode="wait" initial={false}>
                    {saveTone === 'saved' ? (
                      <motion.span
                        key="saved"
                        className="profile-edit-actions__primary-state"
                        initial={reduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reduceMotion ? undefined : { opacity: 0 }}
                      >
                        <Check size={14} aria-hidden="true" />
                        Saved
                      </motion.span>
                    ) : saveTone === 'saving' ? (
                      <motion.span
                        key="saving"
                        className="profile-edit-actions__primary-state"
                        initial={reduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reduceMotion ? undefined : { opacity: 0 }}
                      >
                        Saving...
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        className="profile-edit-actions__primary-state"
                        initial={reduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reduceMotion ? undefined : { opacity: 0 }}
                      >
                        Save changes
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
