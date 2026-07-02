import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'

import { visualArchiveItems } from '../data/visualArchive'
import type { VisualArchiveCity } from '../data/visualArchive'
import { GalleryCard } from '../components/sections/GalleryCard'
import { FlowingMenu } from '../components/effects/react-bits/FlowingMenu'
import { ScrollReveal } from '../components/motion/ScrollReveal'
import '../components/effects/react-bits/FlowingMenu.css'
import './ArchiveImagesPage.css'

const base = import.meta.env.BASE_URL

const featuredItems = visualArchiveItems.filter(i => i.featured)
const editorialItems = visualArchiveItems.filter(i => i.category === 'editorial')
const memoryItems = visualArchiveItems.filter(i => i.category === 'memory')
const cityItems = visualArchiveItems.filter(i => i.city !== null)
const cities: VisualArchiveCity[] = [...new Set(visualArchiveItems.map(i => i.city).filter(Boolean))] as VisualArchiveCity[]

const flowingMenuItems = [
  { link: '#/archive/images/featured', text: 'Featured', image: `${base}${featuredItems[0]?.image.slice(1) ?? ''}` },
  { link: '#/archive/images/editorial', text: 'Editorial', image: `${base}${editorialItems[0]?.image.slice(1) ?? ''}` },
  { link: '#/archive/images/memory', text: 'Memory', image: `${base}${memoryItems[0]?.image.slice(1) ?? ''}` },
  { link: '#/archive/images/city', text: 'City', image: `${base}${cityItems[0]?.image.slice(1) ?? ''}` },
]

const PREVIEW_COUNT = 4

type ImageCategory = 'featured' | 'editorial' | 'memory' | 'city'

function getCategoryFromHash(hash: string): ImageCategory | null {
  if (hash === '#/archive/images/featured') return 'featured'
  if (hash === '#/archive/images/editorial') return 'editorial'
  if (hash === '#/archive/images/memory') return 'memory'
  if (hash === '#/archive/images/city') return 'city'
  return null
}

function CategoryTitle({ category }: { category: ImageCategory }) {
  const labels: Record<ImageCategory, { title: string; desc: string }> = {
    featured: {
      title: `Featured — ${featuredItems.length}`,
      desc: 'The images that stand out — selected for mood, composition, or meaning.',
    },
    editorial: {
      title: `Editorial — ${editorialItems.length}`,
      desc: 'Constructed visuals — illustration, graphic, abstract. Not documentation, but expression.',
    },
    memory: {
      title: `Memory — ${memoryItems.length}`,
      desc: 'Cities and places — Chongqing, Chengdu, Wuhan. What I saw while becoming.',
    },
    city: {
      title: `City / Places — ${cities.length}`,
      desc: 'Grouped by city — each place leaves a different kind of mark.',
    },
  }
  const { title, desc } = labels[category]
  return (
    <>
      <h2 className="archive-images__section-title">{title}</h2>
      <p className="archive-images__section-desc">{desc}</p>
    </>
  )
}

/* ── Category sub-page ──────────────────────────────── */

function ImageCategoryView({ category, onBack }: { category: ImageCategory; onBack: () => void }) {
  const items = useMemo(() => {
    switch (category) {
      case 'featured': return featuredItems
      case 'editorial': return editorialItems
      case 'memory': return memoryItems
      case 'city': return cityItems
    }
  }, [category])

  return (
    <main className="archive-images">
      <div className="archive-images__header">
        <a
          href="#/archive/images"
          className="archive-images__back"
          onClick={(e) => { e.preventDefault(); onBack() }}
        >
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
          <span>Back to Image Vault</span>
        </a>
        <h1 className="archive-images__title">Image Vault</h1>
        <p className="archive-images__subtitle">
          A larger visual archive beyond the homepage selection —
          {visualArchiveItems.length} images across editorial and memory categories.
        </p>
      </div>

      <ScrollReveal className="archive-images__section" amount={0.08}>
        <CategoryTitle category={category} />
        <div className="archive-images__grid">
          {items.map((item) => (
            <div key={item.id} className="archive-images__item">
              <GalleryCard item={item} />
            </div>
          ))}
        </div>
      </ScrollReveal>

      {category === 'city' && (
        <ScrollReveal className="archive-images__section" amount={0.08}>
          <div className="archive-images__city-groups">
            {cities.map((city) => {
              const cityItemsFiltered = visualArchiveItems.filter(i => i.city === city)
              return (
                <div key={city} className="archive-images__city-group">
                  <h3 className="archive-images__city-name">{city} — {cityItemsFiltered.length}</h3>
                  <div className="archive-images__grid">
                    {cityItemsFiltered.map((item) => (
                      <div key={item.id} className="archive-images__item">
                        <GalleryCard item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollReveal>
      )}
    </main>
  )
}

/* ── Overview (no sub-category) ─────────────────────── */

function ImageVaultOverview() {
  return (
    <main className="archive-images">
      <div className="archive-images__header">
        <a href="#/archive" className="archive-images__back">
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
          <span>Back to Archive</span>
        </a>
        <h1 className="archive-images__title">Image Vault</h1>
        <p className="archive-images__subtitle">
          A larger visual archive beyond the homepage selection —
          {visualArchiveItems.length} images across editorial and memory categories.
        </p>
      </div>

      <div className="archive-images__flowing">
        <FlowingMenu
          items={flowingMenuItems}
          speed={18}
          textColor="var(--color-text)"
          bgColor="var(--color-surface)"
          marqueeBgColor="var(--color-gold)"
          marqueeTextColor="var(--color-bg-deep)"
          borderColor="var(--color-border)"
        />
      </div>

      <div className="archive-images__previews">
        {/* Featured preview */}
        <ScrollReveal className="archive-images__section" amount={0.08}>
          <h2 className="archive-images__section-title">Featured — {featuredItems.length}</h2>
          <p className="archive-images__section-desc">
            The images that stand out — selected for mood, composition, or meaning.
          </p>
          <div className="archive-images__grid">
            {featuredItems.slice(0, PREVIEW_COUNT).map((item) => (
              <div key={item.id} className="archive-images__item">
                <GalleryCard item={item} />
              </div>
            ))}
          </div>
          {featuredItems.length > PREVIEW_COUNT && (
            <a href="#/archive/images/featured" className="archive-images__view-all">
              View all featured →
            </a>
          )}
        </ScrollReveal>

        {/* Editorial preview */}
        <ScrollReveal className="archive-images__section" amount={0.08}>
          <h2 className="archive-images__section-title">Editorial — {editorialItems.length}</h2>
          <p className="archive-images__section-desc">
            Constructed visuals — illustration, graphic, abstract. Expression, not documentation.
          </p>
          <div className="archive-images__grid">
            {editorialItems.slice(0, PREVIEW_COUNT).map((item) => (
              <div key={item.id} className="archive-images__item">
                <GalleryCard item={item} />
              </div>
            ))}
          </div>
          {editorialItems.length > PREVIEW_COUNT && (
            <a href="#/archive/images/editorial" className="archive-images__view-all">
              View all editorial →
            </a>
          )}
        </ScrollReveal>

        {/* Memory preview */}
        <ScrollReveal className="archive-images__section" amount={0.08}>
          <h2 className="archive-images__section-title">Memory — {memoryItems.length}</h2>
          <p className="archive-images__section-desc">
            Cities and places — what I saw while becoming.
          </p>
          <div className="archive-images__grid">
            {memoryItems.slice(0, PREVIEW_COUNT).map((item) => (
              <div key={item.id} className="archive-images__item">
                <GalleryCard item={item} />
              </div>
            ))}
          </div>
          {memoryItems.length > PREVIEW_COUNT && (
            <a href="#/archive/images/memory" className="archive-images__view-all">
              View all memory →
            </a>
          )}
        </ScrollReveal>

        {/* City preview */}
        <ScrollReveal className="archive-images__section" amount={0.08}>
          <h2 className="archive-images__section-title">City / Places — {cities.length}</h2>
          <p className="archive-images__section-desc">
            Grouped by city — each place leaves a different kind of mark.
          </p>
          <div className="archive-images__grid">
            {cityItems.slice(0, PREVIEW_COUNT).map((item) => (
              <div key={item.id} className="archive-images__item">
                <GalleryCard item={item} />
              </div>
            ))}
          </div>
          {cityItems.length > PREVIEW_COUNT && (
            <a href="#/archive/images/city" className="archive-images__view-all">
              View all cities →
            </a>
          )}
        </ScrollReveal>
      </div>

      <div className="archive-images__footnote">
        <p>
          New images are added occasionally. This vault will grow as the archive expands.
        </p>
      </div>
    </main>
  )
}

/* ── Main component ─────────────────────────────────── */

export function ArchiveImagesPage() {
  const [category, setCategory] = useState<ImageCategory | null>(() => getCategoryFromHash(window.location.hash))

  useEffect(() => {
    const onHashChange = () => {
      setCategory(getCategoryFromHash(window.location.hash))
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  if (category) {
    return (
      <ImageCategoryView
        category={category}
        onBack={() => { window.location.hash = '#/archive/images' }}
      />
    )
  }

  return <ImageVaultOverview />
}
