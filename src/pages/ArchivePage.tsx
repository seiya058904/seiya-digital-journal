import { ArrowLeft } from 'lucide-react'

import { visualArchiveItems } from '../data/visualArchive'
import { ScrollReveal } from '../components/motion/ScrollReveal'
import { Folder } from '../components/effects/react-bits/Folder'
import { BorderGlow } from '../components/effects/react-bits/BorderGlow'
import { CountUp } from '../components/effects/react-bits/CountUp'
import '../components/effects/react-bits/Folder.css'
import '../components/effects/react-bits/BorderGlow.css'
import './ArchivePage.css'

const editorialCount = visualArchiveItems.filter(i => i.category === 'editorial').length
const memoryCount = visualArchiveItems.filter(i => i.category === 'memory').length
const cities = [...new Set(visualArchiveItems.map(i => i.city).filter(Boolean))]
const cityCount = cities.length

/* ── Internal folder hints ────────────────────── */

const imagePapers = [
  <div key="i1" className="folder-hint-photo" />,
  <div key="i2" className="folder-hint-photo" />,
  <div key="i3" className="folder-hint-photo" />,
]

const notesPapers = [
  <div key="n1" className="folder-hint-note" />,
  <div key="n2" className="folder-hint-note" />,
  <div key="n3" className="folder-hint-note" />,
]

const projectPapers = [
  <div key="p1" className="folder-hint-window" />,
  <div key="p2" className="folder-hint-window" />,
  <div key="p3" className="folder-hint-window" />,
]

/* ── Vault definitions ─────────────────────────── */

const vaults = [
  {
    label: 'Image Vault',
    href: '#/archive/images',
    color: '#56e4ff',
    items: imagePapers,
    glowColor: '187 100 67',
    glowColors: ['#56e4ff', '#3b82f6', '#38bdf8'],
  },
  {
    label: 'Notes Vault',
    href: '#/archive/notes',
    color: '#8c75ff',
    items: notesPapers,
    glowColor: '260 100 73',
    glowColors: ['#8c75ff', '#7c3aed', '#a78bfa'],
  },
  {
    label: 'Project Vault',
    href: '#/archive/projects',
    color: '#f2b976',
    items: projectPapers,
    glowColor: '38 90 68',
    glowColors: ['#f2b976', '#f59e0b', '#fbbf24'],
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
          <CountUp to={visualArchiveItems.length} className="archive-stat__value" duration={1.5} />
          <span className="archive-stat__label">Images</span>
        </div>
        <div className="archive-stat">
          <CountUp to={editorialCount} className="archive-stat__value" duration={1.5} />
          <span className="archive-stat__label">Editorial</span>
        </div>
        <div className="archive-stat">
          <CountUp to={memoryCount} className="archive-stat__value" duration={1.5} />
          <span className="archive-stat__label">Memory</span>
        </div>
        <div className="archive-stat">
          <CountUp to={cityCount} className="archive-stat__value" duration={1.5} />
          <span className="archive-stat__label">Cities</span>
        </div>
      </div>

      <ScrollReveal className="archive-page__nav-section">
        <h2 className="archive-page__section-title">Browse the archive</h2>
        <div className="archive-page__vault-grid">
          {vaults.map((vault) => (
            <BorderGlow
              key={vault.label}
              className="archive-page__vault-card"
              glowColor={vault.glowColor}
              backgroundColor="#120F17"
              borderRadius={24}
              glowRadius={28}
              colors={vault.glowColors}
              glowIntensity={0.6}
              coneSpread={10}
              edgeSensitivity={40}
            >
              <a href={vault.href} className="archive-page__vault-card-inner">
                <div className="archive-page__vault-folder">
                  <Folder color={vault.color} size={2.2} items={vault.items} />
                </div>
                <span className="archive-page__vault-label">{vault.label}</span>
              </a>
            </BorderGlow>
          ))}
        </div>
      </ScrollReveal>

      {/* ── Recent + Map ────────────────────────── */}
      <ScrollReveal className="archive-page__bottom">
        <div className="archive-page__bottom-grid">
          <BorderGlow
            className="archive-page__recent"
            glowColor="187 100 67"
            backgroundColor="#120F17"
            borderRadius={24}
            glowRadius={32}
            colors={['#56e4ff', '#3b82f6', '#38bdf8']}
            glowIntensity={0.6}
            coneSpread={10}
            edgeSensitivity={40}
          >
            <div className="archive-page__recent-inner">
              <h2 className="archive-page__section-title">Recent Additions</h2>
              <div className="archive-page__recent-list">
                {visualArchiveItems.slice(-3).reverse().map((item) => (
                  <a key={item.id} href="#/archive/images" className="archive-page__recent-item">
                    <span className="archive-page__recent-id">{item.id}</span>
                    <span className="archive-page__recent-title">{item.title}</span>
                  </a>
                ))}
                <span className="archive-page__recent-empty">More entries appear here as each vault grows.</span>
              </div>
            </div>
          </BorderGlow>
          <BorderGlow
            className="archive-page__map"
            glowColor="260 100 73"
            backgroundColor="#120F17"
            borderRadius={24}
            glowRadius={32}
            colors={['#8c75ff', '#7c3aed', '#a78bfa']}
            glowIntensity={0.6}
            coneSpread={10}
            edgeSensitivity={40}
          >
            <div className="archive-page__map-inner">
              <h2 className="archive-page__section-title">Archive Map</h2>
              <div className="archive-page__map-grid">
                <a href="#/archive/images" className="archive-page__map-node" style={{ '--node-color': '#56e4ff' } as React.CSSProperties}>
                  <span className="archive-page__map-node-label">Image Vault</span>
                  <span className="archive-page__map-node-count">{visualArchiveItems.length} visual{visualArchiveItems.length !== 1 ? 's' : ''}</span>
                </a>
                <a href="#/archive/notes" className="archive-page__map-node" style={{ '--node-color': '#8c75ff' } as React.CSSProperties}>
                  <span className="archive-page__map-node-label">Notes Vault</span>
                  <span className="archive-page__map-node-count">Taking shape</span>
                </a>
                <a href="#/archive/projects" className="archive-page__map-node" style={{ '--node-color': '#f2b976' } as React.CSSProperties}>
                  <span className="archive-page__map-node-label">Project Vault</span>
                  <span className="archive-page__map-node-count">Taking shape</span>
                </a>
              </div>
              <p className="archive-page__map-footnote">
                The Archive grows at its own pace. Each vault fills in when there's something worth keeping.
              </p>
            </div>
          </BorderGlow>
        </div>
      </ScrollReveal>
    </main>
  )
}
