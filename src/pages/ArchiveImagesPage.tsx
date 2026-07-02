import { ArrowLeft } from 'lucide-react'

import { visualArchiveItems } from '../data/visualArchive'
import { GalleryCard } from '../components/sections/GalleryCard'
import { FlowingMenu } from '../components/effects/react-bits/FlowingMenu'
import { ScrollReveal } from '../components/motion/ScrollReveal'
import '../components/effects/react-bits/FlowingMenu.css'
import './ArchiveImagesPage.css'

const base = import.meta.env.BASE_URL

const featuredItems = visualArchiveItems.filter(i => i.featured)
const editorialItems = visualArchiveItems.filter(i => i.category === 'editorial')
const memoryItems = visualArchiveItems.filter(i => i.category === 'memory')
const cities = [...new Set(visualArchiveItems.map(i => i.city).filter(Boolean))]

const flowingMenuItems = [
  { link: '#archive-images-featured', text: 'Featured', image: `${base}${featuredItems[0]?.image.slice(1) ?? ''}` },
  { link: '#archive-images-editorial', text: 'Editorial', image: `${base}${editorialItems[0]?.image.slice(1) ?? ''}` },
  { link: '#archive-images-memory', text: 'Memory', image: `${base}${memoryItems[0]?.image.slice(1) ?? ''}` },
  { link: '#archive-images-city', text: 'City', image: `${base}${memoryItems.find(i => i.city)?.image.slice(1) ?? ''}` },
]

export function ArchiveImagesPage() {
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

      <ScrollReveal className="archive-images__section" amount={0.08}>
        <h2 className="archive-images__section-title" id="archive-images-featured">Featured — {featuredItems.length}</h2>
        <p className="archive-images__section-desc">
          The images that stand out — selected for mood, composition, or meaning.
        </p>
        <div className="archive-images__grid">
          {featuredItems.map((item) => (
            <div key={item.id} className="archive-images__item">
              <GalleryCard item={item} />
            </div>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal className="archive-images__section" amount={0.08}>
        <h2 className="archive-images__section-title" id="archive-images-editorial">Editorial — {editorialItems.length}</h2>
        <p className="archive-images__section-desc">
          Constructed visuals — illustration, graphic, abstract. Not documentation, but expression.
        </p>
        <div className="archive-images__grid">
          {editorialItems.map((item) => (
            <div key={item.id} className="archive-images__item">
              <GalleryCard item={item} />
            </div>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal className="archive-images__section" amount={0.08}>
        <h2 className="archive-images__section-title" id="archive-images-memory">Memory — {memoryItems.length}</h2>
        <p className="archive-images__section-desc">
          Cities and places — Chongqing, Chengdu, Wuhan. What I saw while becoming.
        </p>
        <div className="archive-images__grid">
          {memoryItems.map((item) => (
            <div key={item.id} className="archive-images__item">
              <GalleryCard item={item} />
            </div>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal className="archive-images__section" amount={0.08}>
        <h2 className="archive-images__section-title" id="archive-images-city">City / Places — {cities.length}</h2>
        <p className="archive-images__section-desc">
          Grouped by city — each place leaves a different kind of mark.
        </p>
        {cities.map((city) => {
          const cityItems = visualArchiveItems.filter(i => i.city === city)
          return (
            <div key={city} className="archive-images__city-group">
              <h3 className="archive-images__city-name">{city} — {cityItems.length}</h3>
              <div className="archive-images__grid">
                {cityItems.map((item) => (
                  <div key={item.id} className="archive-images__item">
                    <GalleryCard item={item} />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </ScrollReveal>

      <div className="archive-images__footnote">
        <p>
          New images are added occasionally. This vault will grow as the archive expands.
        </p>
      </div>
    </main>
  )
}
