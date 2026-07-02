import { ArrowLeft } from 'lucide-react'

import { visualArchiveItems, itemImageSrc } from '../data/visualArchive'
import { ScrollReveal } from '../components/motion/ScrollReveal'
import './GalleryPage.css'

const featuredItems = visualArchiveItems.filter(i => i.featured).slice(0, 5)

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
              <div
                key={item.id}
                className={`gallery-hero-item gallery-hero-item--${i === 0 ? 'large' : i < 3 ? 'medium' : 'small'}`}
              >
                <img
                  src={itemImageSrc(item)}
                  alt={item.alt}
                  loading={i < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                />
                <div className="gallery-hero-item__overlay">
                  <span className="gallery-hero-item__id">{item.id}</span>
                  <h3>{item.title}</h3>
                  <p>{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ScrollReveal className="gallery-page__all-section" amount={0}>
        <h2 className="gallery-page__section-title">All images</h2>
        <div className="gallery-masonry">
          {visualArchiveItems.map((item) => (
            <div key={item.id} className={`gallery-masonry-item gallery-masonry-item--${item.aspect}`}>
              <img
                src={itemImageSrc(item)}
                alt={item.alt}
                loading="lazy"
                decoding="async"
              />
              <div className="gallery-masonry-item__info">
                <span>{item.note}</span>
                <h3>{item.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </main>
  )
}
