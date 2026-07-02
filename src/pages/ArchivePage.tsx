import { ArrowLeft } from 'lucide-react'

import { visualArchiveItems } from '../data/visualArchive'
import { ScrollReveal } from '../components/motion/ScrollReveal'
import { Folder } from '../components/effects/react-bits/Folder'
import '../components/effects/react-bits/Folder.css'
import './ArchivePage.css'

const editorialCount = visualArchiveItems.filter(i => i.category === 'editorial').length
const memoryCount = visualArchiveItems.filter(i => i.category === 'memory').length
const cities = [...new Set(visualArchiveItems.map(i => i.city).filter(Boolean))]
const cityCount = cities.length

const vaults = [
  {
    label: 'Image Vault',
    href: '#/archive/images',
    color: '#56e4ff',
  },
  {
    label: 'Notes Vault',
    href: '#/archive/notes',
    color: '#8c75ff',
  },
  {
    label: 'Project Vault',
    href: '#/archive/projects',
    color: '#f2b976',
  },
]

export function ArchivePage() {
  return (
    <main className="archive-page">
      <div className="archive-page__header">
        <a href="#/" className="archive-page__back">
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
          <span>Back to Journal</span>
        </a>
        <h1 className="archive-page__title">The Archive</h1>
        <p className="archive-page__subtitle">
          Three vaults — images, notes, and projects.
          A place for everything that deserves more room than a homepage section.
        </p>
      </div>

      <div className="archive-page__stats">
        <div className="archive-stat">
          <span className="archive-stat__value">{visualArchiveItems.length}</span>
          <span className="archive-stat__label">Images</span>
        </div>
        <div className="archive-stat">
          <span className="archive-stat__value">{editorialCount}</span>
          <span className="archive-stat__label">Editorial</span>
        </div>
        <div className="archive-stat">
          <span className="archive-stat__value">{memoryCount}</span>
          <span className="archive-stat__label">Memory</span>
        </div>
        <div className="archive-stat">
          <span className="archive-stat__value">{cityCount}</span>
          <span className="archive-stat__label">Cities</span>
        </div>
      </div>

      <ScrollReveal className="archive-page__nav-section">
        <h2 className="archive-page__section-title">Browse the archive</h2>
        <div className="archive-page__vault-grid">
          {vaults.map((vault) => (
            <a key={vault.label} href={vault.href} className="archive-page__vault-card">
              <div className="archive-page__vault-folder">
                <Folder color={vault.color} size={2.2} />
              </div>
              <span className="archive-page__vault-label">{vault.label}</span>
            </a>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal className="archive-page__vision">
        <h2 className="archive-page__section-title">What this becomes</h2>
        <div className="archive-vision-card">
          <p>
            The Archive is designed to grow. Today it holds {visualArchiveItems.length} images
            across {cityCount} cities. The Notes Vault and Project Vault will fill in over time —
            each vault grows at its own pace.
          </p>
          <p className="archive-vision-card__cn">
            档案馆会长大。现在有 {visualArchiveItems.length} 张图，
            以后笔记和项目也会慢慢填满。
          </p>
        </div>
      </ScrollReveal>
    </main>
  )
}
