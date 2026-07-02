import { ArrowLeft, Camera, FolderOpen, PenTool } from 'lucide-react'

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
    desc: 'Visual fragments, editorial images, memory pieces, and city records.',
    href: '#/archive/images',
    icon: Camera,
    count: visualArchiveItems.length,
    countLabel: 'images',
    color: '#56e4ff',
    papers: ['Editorial', 'Memory', 'Cities'],
  },
  {
    label: 'Notes Vault',
    desc: 'Learning notes, thoughts, reflections, and written records.',
    href: '#/archive/notes',
    icon: PenTool,
    count: null,
    countLabel: null,
    color: '#8c75ff',
    papers: ['Learning', 'Thoughts', 'Journal'],
  },
  {
    label: 'Project Vault',
    desc: 'Websites, games, experiments, presentations, and things I build.',
    href: '#/archive/projects',
    icon: FolderOpen,
    count: null,
    countLabel: null,
    color: '#f2b976',
    papers: ['Websites', 'Games', 'Experiments'],
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
          {vaults.map((vault) => {
            const Icon = vault.icon
            return (
              <a key={vault.label} href={vault.href} className="archive-page__vault-card">
                <Folder
                  color={vault.color}
                  size={1.8}
                  items={vault.papers.map((p, i) => (
                    <span key={i} className="archive-folder-paper">{p}</span>
                  ))}
                />
                <div className="archive-page__vault-info">
                  <div className="archive-page__vault-icon">
                    <Icon aria-hidden="true" size={18} strokeWidth={1.4} />
                  </div>
                  <span className="archive-page__vault-label">{vault.label}</span>
                  {vault.count !== null && (
                    <span className="archive-page__vault-count">{vault.count}</span>
                  )}
                </div>
                <p className="archive-page__vault-desc">{vault.desc}</p>
              </a>
            )
          })}
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
