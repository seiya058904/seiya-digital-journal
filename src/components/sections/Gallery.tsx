import { galleryItems } from '../../data/gallery'
import { CardTilt } from '../effects/CardTilt'
import { ScrollReveal } from '../motion/ScrollReveal'
import { Chapter } from '../ui/Chapter'

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
            <CardTilt className="gallery-card" intensity={3}>
              <figure>
                <div className="gallery-card__image">
                  <img
                    src={item.image}
                    alt={`${item.theme}: abstract editorial artwork for Sia's visual journal`}
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
            </CardTilt>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
