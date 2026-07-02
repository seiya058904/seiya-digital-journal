import { ArrowLeft, Star } from 'lucide-react'

import { visualArchiveItems } from '../data/visualArchive'
import { ScrollReveal } from '../components/motion/ScrollReveal'
import './ArchiveCollectionsPage.css'

const base = import.meta.env.BASE_URL

const featuredItems = visualArchiveItems.filter(i => i.featured)
const editorialItems = visualArchiveItems.filter(i => i.category === 'editorial')
const memoryItems = visualArchiveItems.filter(i => i.category === 'memory')

const cityGroups = [
  { city: 'Chongqing', items: visualArchiveItems.filter(i => i.city === 'Chongqing') },
  { city: 'Chengdu', items: visualArchiveItems.filter(i => i.city === 'Chengdu') },
  { city: 'Wuhan', items: visualArchiveItems.filter(i => i.city === 'Wuhan') },
].filter(g => g.items.length > 0)

export function ArchiveCollectionsPage() {
  return (
    <main className="archive-collections">
      <div className="archive-collections__header">
        <a href="#/archive" className="archive-collections__back">
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
          <span>Back to Archive</span>
        </a>
        <h1 className="archive-collections__title">Collections</h1>
        <p className="archive-collections__subtitle">
          Curated groupings — by mood, by place, by type.
          Not filters, but ways to see the archive differently.
        </p>
      </div>

      <ScrollReveal className="archive-collections__section">
        <h2 className="archive-collections__section-title">
          <Star aria-hidden="true" size={14} strokeWidth={1.5} />
          Featured
        </h2>
        <p className="archive-collections__section-desc">
          The images that stand out — selected for mood, composition, or meaning.
        </p>
        <div className="archive-collections__strip">
          {featuredItems.map((item) => (
            <a key={item.id} href="#/archive/images" className="archive-collections__card">
              <img
                src={`${base}${item.image.slice(1)}`}
                alt={item.alt}
                loading="lazy"
                decoding="async"
              />
              <div className="archive-collections__card-info">
                <span>{item.id}</span>
                <h3>{item.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal className="archive-collections__section">
        <h2 className="archive-collections__section-title">Editorial</h2>
        <p className="archive-collections__section-desc">
          Constructed visuals — illustration, graphic, abstract. Expression, not documentation.
        </p>
        <div className="archive-collections__strip">
          {editorialItems.slice(0, 6).map((item) => (
            <a key={item.id} href="#/archive/images" className="archive-collections__card">
              <img
                src={`${base}${item.image.slice(1)}`}
                alt={item.alt}
                loading="lazy"
                decoding="async"
              />
              <div className="archive-collections__card-info">
                <span>{item.id}</span>
                <h3>{item.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal className="archive-collections__section">
        <h2 className="archive-collections__section-title">Memory</h2>
        <p className="archive-collections__section-desc">
          Cities and places — what I saw while becoming.
        </p>
        <div className="archive-collections__strip">
          {memoryItems.slice(0, 6).map((item) => (
            <a key={item.id} href="#/archive/images" className="archive-collections__card">
              <img
                src={`${base}${item.image.slice(1)}`}
                alt={item.alt}
                loading="lazy"
                decoding="async"
              />
              <div className="archive-collections__card-info">
                <span>{item.city ?? item.id}</span>
                <h3>{item.title}</h3>
              </div>
            </a>
          ))}
        </div>
      </ScrollReveal>

      {cityGroups.map((group) => (
        <ScrollReveal key={group.city} className="archive-collections__section">
          <h2 className="archive-collections__section-title">{group.city}</h2>
          <p className="archive-collections__section-desc">
            {group.items.length} {group.items.length === 1 ? 'image' : 'images'} from {group.city}.
          </p>
          <div className="archive-collections__strip">
            {group.items.map((item) => (
              <a key={item.id} href="#/archive/images" className="archive-collections__card">
                <img
                  src={`${base}${item.image.slice(1)}`}
                  alt={item.alt}
                  loading="lazy"
                  decoding="async"
                />
                <div className="archive-collections__card-info">
                  <span>{item.id}</span>
                  <h3>{item.title}</h3>
                </div>
              </a>
            ))}
          </div>
        </ScrollReveal>
      ))}

      <div className="archive-collections__footnote">
        <p>
          Collections grow as the archive expands. More groupings will appear over time.
        </p>
      </div>
    </main>
  )
}
