import { useEffect, useRef, useState } from 'react'

import { fetchLikeCount, likeTarget } from '../../lib/api'
import { ARCHIVE_STEPPER_TARGET } from '../../lib/interactions'
import './ArchiveLikeButton.css'

export function ArchiveLikeButton() {
  const [count, setCount] = useState<number | null>(null)
  const [liked, setLiked] = useState(false)
  const [pending, setPending] = useState(false)
  const [heartAnimationKey, setHeartAnimationKey] = useState(0)
  const [activeSlot, setActiveSlot] = useState<0 | 1>(0)
  const [slotValues, setSlotValues] = useState<[number | null, number | null]>([null, null])
  const [hasAnimated, setHasAnimated] = useState(false)
  const [liveMessage, setLiveMessage] = useState('')
  const pendingRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    fetchLikeCount(ARCHIVE_STEPPER_TARGET).then((result) => {
      if (!cancelled && result.ok) {
        setCount(result.data)
        setSlotValues([result.data, null])
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const setAnimatedCount = (value: number) => {
    const nextSlot: 0 | 1 = activeSlot === 0 ? 1 : 0
    setCount(value)
    setSlotValues(current => {
      const next = [...current] as [number | null, number | null]
      next[nextSlot] = value
      return next
    })
    setActiveSlot(nextSlot)
    setHasAnimated(true)
  }

  const handleClick = async () => {
    // Guard against rapid repeated clicks corrupting optimistic state.
    if (pendingRef.current) return

    pendingRef.current = true
    setPending(true)
    setLiked(true)
    setHeartAnimationKey(key => key + 1)

    const result = await likeTarget(ARCHIVE_STEPPER_TARGET)

    if (result.ok) {
      setAnimatedCount(result.data.count)
      setLiveMessage(`Liked the archive. ${result.data.count} total likes.`)
    } else {
      setLiked(false)
      setLiveMessage('The like could not be saved. Please try again.')
    }

    pendingRef.current = false
    setPending(false)
  }

  return (
    <button
      type="button"
      className={`archive-like${liked ? ' archive-like--active' : ''}`}
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={`Like Archive — ${count ?? 0} likes`}
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
        <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
      </svg>
      <span className="archive-like__text" aria-hidden="true">Likes</span>
      <span className="archive-like__divider" aria-hidden="true" />
      <span className="archive-like__count" aria-hidden="true">
        <span className={`archive-like__count-value ${hasAnimated ? (activeSlot === 0 ? 'archive-like__count-value--entering' : 'archive-like__count-value--leaving') : (activeSlot === 0 ? 'archive-like__count-value--active' : 'archive-like__count-value--below')}`}>
          {slotValues[0] ?? '–'}
        </span>
        <span className={`archive-like__count-value ${hasAnimated ? (activeSlot === 1 ? 'archive-like__count-value--entering' : 'archive-like__count-value--leaving') : (activeSlot === 1 ? 'archive-like__count-value--active' : 'archive-like__count-value--below')}`}>
          {slotValues[1] ?? '–'}
        </span>
      </span>
      <span className="archive-like__live" role="status">{liveMessage}</span>
    </button>
  )
}
