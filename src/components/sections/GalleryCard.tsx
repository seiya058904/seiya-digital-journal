import { BorderGlow } from '../effects/react-bits/BorderGlow'
import { GlareHover } from '../effects/react-bits/GlareHover'
import type { GalleryItem } from '../../data/gallery'

const base = import.meta.env.BASE_URL

type GalleryCardProps = {
  item: GalleryItem
}

export function GalleryCard({ item }: GalleryCardProps) {
  const image = (
    <GlareHover
      className="gallery-card__image"
      width="100%"
      height="100%"
      background="var(--color-surface)"
      borderColor="transparent"
      borderRadius="var(--radius-lg)"
      glareColor="#ffffff"
      glareOpacity={0.16}
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
    <figure>
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
      <figcaption>
        <div>
          <span>{item.theme}</span>
          <h3>{item.title}</h3>
        </div>
        <p>{item.caption}</p>
      </figcaption>
    </figure>
  )
}
