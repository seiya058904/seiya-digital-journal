import { ArrowLeft } from 'lucide-react'

import { visualArchiveItems, itemImageSrc } from '../data/visualArchive'
import { ImageTrail } from '../components/effects/react-bits/ImageTrail'
import { GalleryCard } from '../components/sections/GalleryCard'
import { ScrollReveal } from '../components/motion/ScrollReveal'
import { DesktopOnly } from '../components/ui/DesktopOnly'
import './GalleryPage.css'

const featuredItems = visualArchiveItems.filter(i => i.featured).slice(0, 5)
const trailImages = visualArchiveItems
  .filter(item => item.category !== 'memory')
  .filter((_, index) => index % 9 === 0)
  .slice(0, 8)
  .map(itemImageSrc)

export function GalleryPage() {
  return (
    <main className="gallery-page">
      <div className="gallery-page__header">
        <a href="#/archive/images" className="gallery-page__back">
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
          <span>Back to Image Vault</span>
        </a>
        <h1 className="gallery-page__title">Gallery</h1>
        <p className="gallery-page__subtitle">
          A visual overview — selected fragments from the archive,
          arranged for slow browsing.
        </p>
      </div>

      {featuredItems.length > 0 && (
        <div className="gallery-page__hero-section">
          <h2 className="gallery-page__section-title">Selected</h2>
          <div className="gallery-hero-grid">
            {featuredItems.map((item, i) => (
              <ScrollReveal
                key={item.id}
                className={`gallery-hero-item gallery-hero-item--${item.id}`}
                delay={(i % 3) * 0.06}
                amount={0.12}
              >
                <GalleryCard item={item} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      )}

      <DesktopOnly>
        <ScrollReveal className="gallery-page__trail" amount={0.12}>
          <ImageTrail items={trailImages} threshold={70} />
        </ScrollReveal>
      </DesktopOnly>

      <section className="gallery-page__all-section">
        <h2 className="gallery-page__section-title">
          All images — {visualArchiveItems.length}
        </h2>
        <div className="gallery-masonry">
          {visualArchiveItems.map((item, i) => (
            <ScrollReveal
              key={item.id}
              className={`gallery-masonry-item gallery-masonry-item--${item.aspect} gallery-masonry-item--${item.id}`}
              delay={(i % 3) * 0.05}
              amount={0.08}
            >
              <GalleryCard item={item} />
            </ScrollReveal>
          ))}
        </div>
      </section>
    </main>
  )
}
