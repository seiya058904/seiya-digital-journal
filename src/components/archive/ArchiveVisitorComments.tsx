import { useCallback, useEffect, useState } from 'react'

import { listComments, type CommentRecord } from '../../lib/api'
import { ARCHIVE_STEPPER_TARGET } from '../../lib/interactions'
import './ArchiveVisitorComments.css'

const INITIAL_VISIBLE = 3
const LOAD_STEP = 3
const FETCH_LIMIT = 50

type LoadState = 'loading' | 'error' | 'ready'

function formatDate(isoDate: string): string | null {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function ArchiveVisitorComments() {
  const [state, setState] = useState<LoadState>('loading')
  const [comments, setComments] = useState<CommentRecord[]>([])
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState('loading')

    listComments(ARCHIVE_STEPPER_TARGET, FETCH_LIMIT).then((result) => {
      if (cancelled) return
      if (result.ok) {
        setComments(result.data)
        setVisibleCount(INITIAL_VISIBLE)
        setState('ready')
      } else {
        setComments([])
        setState('error')
      }
    })

    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const loadMore = useCallback(() => {
    setVisibleCount(current => Math.min(current + LOAD_STEP, comments.length))
  }, [comments.length])

  const hasComments = state === 'ready' && comments.length > 0
  const hasMore = visibleCount < comments.length

  return (
    <div className="archive-comments">
      {state === 'loading' ? (
        <p className="archive-comments__status" role="status">Loading comments…</p>
      ) : null}

      {state === 'error' ? (
        <p className="archive-comments__status" role="status">
          Comments could not be loaded right now.{' '}
          <button
            type="button"
            className="archive-comments__retry"
            onClick={() => setReloadKey(key => key + 1)}
          >
            Try again
          </button>
        </p>
      ) : null}

      {state === 'ready' && comments.length === 0 ? (
        <p className="archive-comments__status">
          No comments yet. The journal stepper above is the place to leave one.
        </p>
      ) : null}

      {hasComments ? (
        <>
          <div className="archive-comments__grid">
            {comments.slice(0, visibleCount).map((comment, index) => {
              const formattedDate = formatDate(comment.createdAt)
              return (
                <article
                  key={comment.id}
                  className={`archive-comments__card${index === 1 ? ' archive-comments__card--featured' : ''}`}
                >
                  <span className="archive-comments__quote" aria-hidden="true">”</span>
                  <p className="archive-comments__body">{comment.body}</p>
                  <footer className="archive-comments__meta">
                    <span className="archive-comments__author">{comment.authorName}</span>
                    {formattedDate ? (
                      <time className="archive-comments__date" dateTime={comment.createdAt}>
                        {formattedDate}
                      </time>
                    ) : null}
                  </footer>
                </article>
              )
            })}
          </div>

          {hasMore ? (
            <button
              type="button"
              className="archive-comments__more"
              onClick={loadMore}
              aria-label="Show more comments"
            >
              <span className="archive-comments__more-front" aria-hidden="true">See More</span>
              <span className="archive-comments__more-behind" aria-hidden="true">See More</span>
              <span className="archive-comments__more-glow" aria-hidden="true" />
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
