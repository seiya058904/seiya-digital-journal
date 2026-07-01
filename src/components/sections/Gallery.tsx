import { useState } from 'react'
import { visualArchiveItems, type VisualArchiveItem } from '../../data/visualArchive'
import { BounceCards } from '../effects/react-bits/BounceCards'
import { ScrollReveal } from '../motion/ScrollReveal'
import { Chapter } from '../ui/Chapter'
import { GalleryCard } from './GalleryCard'

const base = import.meta.env.BASE_URL

type FilterKey = 'all' | 'editorial' | 'memory' | 'Chongqing' | 'Chengdu' | 'Wuhan'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'editorial', label: 'Editorial' },
  { key: 'memory', label: 'Memory' },
  { key: 'Chongqing', label: 'Chongqing' },
  { key: 'Chengdu', label: 'Chengdu' },
  { key: 'Wuhan', label: 'Wuhan' },
]

function matchesFilter(item: VisualArchiveItem, filter: FilterKey): boolean {
  switch (filter) {
    case 'all':
      return true
    case 'editorial':
      return item.category === 'editorial'
    case 'memory':
      return item.category === 'memory'
    default:
      return item.city === filter
  }
}

function sortItems(items: VisualArchiveItem[]): VisualArchiveItem[] {
  return [...items].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1
    return 0
  })
}

function sizeClass(item: VisualArchiveItem): string {
  if (item.featured && item.aspect === 'landscape') return 'gallery-item--hero'
  if (item.aspect === 'landscape') return 'gallery-item--wide'
  if (item.featured) return 'gallery-item--large'
  return 'gallery-item--standard'
}

/** Pick 4 featured items for the BounceCards preview */
const bounceItems = visualArchiveItems.filter((item) => item.featured).slice(0, 4)
const bounceImages = bounceItems.map((item) => `${base}${item.image.slice(1)}`)

export function Gallery() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all')

  const filtered = sortItems(
    visualArchiveItems.filter((item) => matchesFilter(item, activeFilter)),
  )

  return (
    <section id="gallery" className="section section--gallery">
      <Chapter number="04" title="Visual Archive" />
      <ScrollReveal className="gallery-heading">
        <p>VISUAL ARCHIVE</p>
        <h2>Fragments of learning, cities, and inner weather.</h2>
      </ScrollReveal>

      {/* BounceCards — Selected fragments preview */}
      <ScrollReveal className="gallery-bounce-wrapper" delay={0.08}>
        <span className="gallery-bounce-label">Selected fragments</span>
        <BounceCards
          className="gallery-bounce"
          images={bounceImages}
          containerWidth={480}
          containerHeight={280}
          animationDelay={0.3}
          animationStagger={0.05}
          transformStyles={[
            'rotate(12deg) translate(-140px)',
            'rotate(6deg) translate(-70px)',
            'rotate(-4deg)',
            'rotate(-12deg) translate(70px)',
          ]}
          enableHover
        />
      </ScrollReveal>

      <p className="gallery-subtitle">
        A curated archive of editorial visuals and memory fragments — not a photo
        album, but a record of what I notice while becoming.
      </p>
      <p className="gallery-subtitle gallery-subtitle--cn">
        不是相册，而是一些被留下来的片刻。
      </p>

      <nav className="gallery-filters" role="tablist" aria-label="Filter archive">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeFilter === key}
            className={`gallery-filter ${activeFilter === key ? 'gallery-filter--active' : ''}`}
            onClick={() => setActiveFilter(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      {filtered.length === 0 && (
        <p className="gallery-empty">No images for this category yet.</p>
      )}

      <div className="gallery-grid">
        {filtered.map((item, index) => (
          <ScrollReveal
            key={item.id}
            className={`gallery-item ${sizeClass(item)} gallery-item--${item.aspect}`}
            delay={(index % 4) * 0.06}
            amount={0.08}
          >
            <div className="gallery-card">
              <GalleryCard item={item} />
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
