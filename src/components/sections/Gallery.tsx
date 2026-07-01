import { galleryItems } from '../../data/gallery'
import { GlareHover } from '../effects/cards/GlareHover'
import { ScrollReveal } from '../motion/ScrollReveal'
import { Chapter } from '../ui/Chapter'

const base = import.meta.env.BASE_URL

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
            <GlareHover
              className="gallery-card"
              glareColor="rgba(255, 255, 255, 0.12)"
            >
              <figure>
                <div className="gallery-card__image">
                  <img
                    src={`${base}${item.image.slice(1)}`}
                    alt={`${item.theme}: abstract editorial artwork for Seiya's visual journal`}
                    width={item.shape === 'portrait' ? 1122 : item.shape === 'square' ? 1254 : 1536}
                    height={item.shape === 'portrait' ? 1402 : item.shape === 'square' ? 1254 : 1024}
                    loading="lazy"
                    decoding="async"
                  />
                  <span>{item.note}</span>
                </div>
                <figcaption>
                  <div>
                    <span>{item.theme}</span>
                    <h3>{item.title}</h3>
                  </div>
                  <p>{item.caption}</p>
                </figcaption>
              </figure>
            </GlareHover>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
