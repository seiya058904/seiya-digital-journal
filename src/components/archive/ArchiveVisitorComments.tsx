import { getProfileAvatar } from '../../data/profileAvatars'
import './ArchiveVisitorComments.css'

const FEATURED_COMMENTS = [
  {
    id: 'featured-1',
    authorName: 'G. Alexander',
    body: 'As a digital artist, showcasing my work beautifully is everything. The archive makes each piece feel like it has room to breathe.',
    createdAt: '2026-07-05T00:00:00.000Z',
  },
  {
    id: 'featured-2',
    authorName: 'J. Amander',
    body: 'This journal has a quiet rhythm to it. I could spend a long time moving through the work and noticing the details.',
    createdAt: '2026-07-04T00:00:00.000Z',
  },
  {
    id: 'featured-3',
    authorName: 'A. Levine',
    body: 'A thoughtful balance of atmosphere and clarity. It feels personal without making the archive difficult to explore.',
    createdAt: '2026-07-03T00:00:00.000Z',
  },
] as const

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function ArchiveVisitorComments() {
  return (
    <div className="archive-comments">
      <div className="archive-comments__panel" aria-labelledby="archive-comments-title">
        <div className="archive-comments__grid">
          {FEATURED_COMMENTS.map((comment, index) => {
            const avatar = getProfileAvatar(`avatar-${String(index + 1).padStart(2, '0')}`)
            return (
              <article
                key={comment.id}
                className={`archive-comments__card${index === 1 ? ' archive-comments__card--featured' : ''}`}
              >
                <div className="archive-comments__card-head">
                  <span className="archive-comments__quote" aria-hidden="true">”</span>
                  <img className="archive-comments__avatar" src={avatar.src} alt="" />
                </div>
                <p className="archive-comments__body">{comment.body}</p>
                <footer className="archive-comments__meta">
                  <span className="archive-comments__author">{comment.authorName}</span>
                  <time className="archive-comments__date" dateTime={comment.createdAt}>
                    {formatDate(comment.createdAt)}
                  </time>
                </footer>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
