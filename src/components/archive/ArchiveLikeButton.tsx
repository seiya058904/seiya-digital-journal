import { useEffect, useRef, useState } from 'react'

import { fetchLikeCount, likeTarget } from '../../lib/api'
import { ARCHIVE_STEPPER_TARGET } from '../../lib/interactions'
import './ArchiveLikeButton.css'

const COUNT_SWAP_MS = 600

export function ArchiveLikeButton() {
  const [count, setCount] = useState<number | null>(null)
  const [liked, setLiked] = useState(false)
  const [pending, setPending] = useState(false)
  const [swapFrom, setSwapFrom] = useState<number | null>(null)
  const [liveMessage, setLiveMessage] = useState('')
  const swapTimerRef = useRef<number | null>(null)
  const pendingRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    fetchLikeCount(ARCHIVE_STEPPER_TARGET).then((result) => {
      if (!cancelled && result.ok) setCount(result.data)
    })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => () => {
    if (swapTimerRef.current !== null) window.clearTimeout(swapTimerRef.current)
  }, [])

  const animateCountSwap = (from: number, to: number) => {
    setSwapFrom(from)
    setCount(to)
    if (swapTimerRef.current !== null) window.clearTimeout(swapTimerRef.current)
    swapTimerRef.current = window.setTimeout(() => {
      setSwapFrom(null)
      swapTimerRef.current = null
    }, COUNT_SWAP_MS)
  }

  const handleClick = async () => {
    // Guard against rapid repeated clicks corrupting optimistic state.
    if (pendingRef.current) return

    if (count === null) return

    const previousCount = count
    const nextCount = previousCount + 1

    pendingRef.current = true
    setPending(true)
    setLiked(true)
    animateCountSwap(previousCount, nextCount)

    const result = await likeTarget(ARCHIVE_STEPPER_TARGET)

    if (result.ok) {
      animateCountSwap(nextCount, result.data.count)
      setLiveMessage(`Liked the archive. ${result.data.count} total likes.`)
    } else {
      // Roll the optimistic state back to server truth.
      setLiked(false)
      animateCountSwap(nextCount, previousCount)
      setLiveMessage('The like could not be saved. Please try again.')
    }

    pendingRef.current = false
    setPending(false)
  }

  const isSwapping = swapFrom !== null

  return (
    <button
      type="button"
      className={`archive-like${liked ? ' archive-like--active' : ''}`}
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={`Like Archive — ${count ?? 0} likes`}
      disabled={pending || count === null}
    >
      <svg
        className="archive-like__icon"
        fillRule="nonzero"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
      </svg>
      <span className="archive-like__text" aria-hidden="true">Likes</span>
      <span className="archive-like__count" aria-hidden="true">
        <span
          key={count ?? 'unknown'}
          className={`archive-like__count-value${isSwapping ? ' archive-like__count-value--in' : ''}`}
        >
          {count ?? '–'}
        </span>
        {swapFrom !== null ? (
          <span key={`${swapFrom}-out`} className="archive-like__count-value archive-like__count-value--out">
            {swapFrom}
          </span>
        ) : null}
      </span>
      <span className="archive-like__live" role="status">{liveMessage}</span>
    </button>
  )
}
