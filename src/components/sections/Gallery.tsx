import { galleryItems } from '../../data/gallery'
import { ScrollReveal } from '../motion/ScrollReveal'
import { Chapter } from '../ui/Chapter'
import { GalleryCard } from './GalleryCard'

export function Gallery() {
  return (
    <section id="gallery" className="section section--gallery">
      <Chapter number="04" title="Gallery" />
      <ScrollReveal className="gallery-heading">
        <p>A visual journal</p>
        <h2>Fragments of light, kept for later.</h2>
      </ScrollReveal>
      <div className="gallery-grid">
        {galleryItems.map((item, index) => (
          <ScrollReveal
            key={item.theme}
            className={`gallery-item gallery-item--${item.shape}`}
            delay={(index % 3) * 0.08}
            amount={0.12}
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
