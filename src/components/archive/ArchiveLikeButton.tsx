import { useEffect, useRef, useState } from 'react'

import { fetchLikeCount, likeTarget } from '../../lib/api'
import { ARCHIVE_STEPPER_TARGET } from '../../lib/interactions'
import {
  applyInitialCountRead,
  applyLikeFailure,
  applyLikeSuccess,
  beginLike,
  createInitialLikeButtonModel,
  deriveAriaLabel,
  slotClassName,
} from './likeButtonState'
import './ArchiveLikeButton.css'

export function ArchiveLikeButton() {
  const [model, setModel] = useState(createInitialLikeButtonModel)
  const [pending, setPending] = useState(false)
  const [heartAnimationKey, setHeartAnimationKey] = useState(0)
  const pendingRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    fetchLikeCount(ARCHIVE_STEPPER_TARGET).then((result) => {
      // JR-04: the read result goes through the shared model, so a read that
      // settles after an accepted like is invalidated there instead of
      // clobbering the count, the animation slots or the aria label.
      if (!cancelled && result.ok) {
        setModel(current => applyInitialCountRead(current, result.data))
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const handleClick = async () => {
    // Guard against rapid repeated clicks corrupting optimistic state.
    if (pendingRef.current) return

    pendingRef.current = true
    setPending(true)
    setModel(beginLike)
    setHeartAnimationKey(key => key + 1)

    const result = await likeTarget(ARCHIVE_STEPPER_TARGET)

    if (result.ok) {
      setModel(current => applyLikeSuccess(current, result.data.count))
    } else {
      // A failed POST leaves hasAcceptedLike false, so a still-pending
      // trusted read can still populate the button — no permanent unknown.
      setModel(current => applyLikeFailure(current, 'The like could not be saved. Please try again.'))
    }

    pendingRef.current = false
    setPending(false)
  }

  return (
    <button
      type="button"
      className={`archive-like${model.liked ? ' archive-like--active' : ''}`}
      onClick={handleClick}
      aria-label={deriveAriaLabel(model)}
      disabled={pending}
    >
      <svg
        key={heartAnimationKey}
        className="archive-like__icon"
        fillRule="nonzero"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.18 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
      </svg>
      <span className="archive-like__text" aria-hidden="true">Likes</span>
      <span className="archive-like__divider" aria-hidden="true" />
      <span className="archive-like__count" aria-hidden="true">
        <span className={`archive-like__count-value ${slotClassName(model, 0)}`}>
          {model.slotValues[0] ?? '–'}
        </span>
        <span className={`archive-like__count-value ${slotClassName(model, 1)}`}>
          {model.slotValues[1] ?? '–'}
        </span>
      </span>
      <span className="archive-like__live" role="status">{model.liveMessage}</span>
    </button>
  )
}
