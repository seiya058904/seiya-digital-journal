import { BorderGlow } from '../effects/react-bits/BorderGlow'
import { GlareHover } from '../effects/react-bits/GlareHover'
import { archiveImageSrc } from '../../data/visualArchive'

type GalleryCardItem = {
  image: string
  title: string
  caption: string
  note: string
  aspect: 'portrait' | 'landscape' | 'square'
  alt?: string
  /** legacy — maps to VisualArchiveItem.id as display label */
  theme?: string
  /** visual archive — used as display label when theme is absent */
  id?: string
}

type GalleryCardProps = {
  item: GalleryCardItem
}

export function GalleryCard({ item }: GalleryCardProps) {
  const label = item.theme ?? item.id ?? ''
  const aspect = item.aspect
  const altText = item.alt ?? `${label}: visual archive image`

  const image = (
    <GlareHover
      className="gallery-card__image"
      width="100%"
      height="auto"
      background="var(--color-surface)"
      borderColor="transparent"
      borderRadius="var(--radius-lg)"
      glareColor="#ffffff"
      glareOpacity={0.16}
      glareAngle={-35}
      transitionDuration={750}
    >
      <img
        src={archiveImageSrc(item.image)}
        alt={altText}
        width={aspect === 'portrait' ? 1122 : aspect === 'square' ? 1254 : 1536}
        height={aspect === 'portrait' ? 1402 : aspect === 'square' ? 1254 : 1024}
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
          <span>{label}</span>
          <h3>{item.title}</h3>
        </div>
        <p>{item.caption}</p>
      </figcaption>
    </figure>
  )
}
