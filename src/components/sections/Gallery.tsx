import { visualArchiveItems } from '../../data/visualArchive'
import { BounceCards } from '../effects/react-bits/BounceCards'
import { ScrollReveal } from '../motion/ScrollReveal'
import { Chapter } from '../ui/Chapter'
import { GalleryCard } from './GalleryCard'

const base = import.meta.env.BASE_URL

/** 15 curated images covering all categories and cities */
const CURATED_IDS = [
  'editorial-005',
  'editorial-012',
  'editorial-014',
  'editorial-020',
  'editorial-021',
  'chongqing-001',
  'chongqing-011',
  'chengdu-002',
  'wuhan-005',
  'kaifeng-001',
  'tianjin-001',
  'emei-001',
  'illustration-003',
  'art-002',
  'design-001',
]

const curated = visualArchiveItems.filter((item) =>
  CURATED_IDS.includes(item.id),
)

/** Pick 4 featured items for the BounceCards preview */
const bounceItems = visualArchiveItems.filter((item) => item.featured).slice(0, 4)
const bounceImages = bounceItems.map((item) => `${base}${item.image.slice(1)}`)

export function Gallery() {
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

      <div className="gallery-grid">
        {curated.map((item, index) => (
          <ScrollReveal
            key={item.id}
            className={`gallery-item gallery-item--${item.id}`}
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
