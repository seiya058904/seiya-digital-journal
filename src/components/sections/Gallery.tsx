import { galleryItems } from '../../data/gallery'
import { BorderGlow } from '../effects/react-bits/BorderGlow'
import { GlareHover } from '../effects/react-bits/GlareHover'
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
        {galleryItems.map((item, index) => {
          const image = (
            <GlareHover
              className="gallery-card__image"
              width="100%"
              height="100%"
              background="var(--color-surface)"
              borderColor="transparent"
              borderRadius="var(--radius-lg)"
              glareColor="#ffffff"
              glareOpacity={0.22}
              glareAngle={-35}
              transitionDuration={750}
            >
              <img
                src={`${base}${item.image.slice(1)}`}
                alt={`${item.theme}: abstract editorial artwork for Seiya's visual journal`}
                width={item.shape === 'portrait' ? 1122 : item.shape === 'square' ? 1254 : 1536}
                height={item.shape === 'portrait' ? 1402 : item.shape === 'square' ? 1254 : 1024}
                loading="lazy"
                decoding="async"
              />
              <span>{item.note}</span>
            </GlareHover>
          )

          return (
            <ScrollReveal
              key={item.theme}
              className={`gallery-item gallery-item--${item.shape}`}
              delay={(index % 3) * 0.08}
              amount={0.12}
            >
              <div className="gallery-card">
                <figure>
                  {index === 0 ? (
                    <BorderGlow
                      className="gallery-card__glow"
                      backgroundColor="var(--color-bg-deep)"
                      borderRadius={32}
                      glowRadius={28}
                      glowIntensity={0.72}
                      fillOpacity={0.25}
                    >
                      {image}
                    </BorderGlow>
                  ) : image}
                  <figcaption>
                    <div>
                      <span>{item.theme}</span>
                      <h3>{item.title}</h3>
                    </div>
                    <p>{item.caption}</p>
                  </figcaption>
                </figure>
              </div>
            </ScrollReveal>
          )
        })}
      </div>
    </section>
  )
}
