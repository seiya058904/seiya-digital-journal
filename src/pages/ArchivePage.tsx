import { ArrowLeft, BookOpen, Camera, FolderOpen, GraduationCap, Layers, Map, PenTool } from 'lucide-react'

import { visualArchiveItems } from '../data/visualArchive'
import { ScrollReveal } from '../components/motion/ScrollReveal'
import './ArchivePage.css'

const editorialCount = visualArchiveItems.filter(i => i.category === 'editorial').length
const memoryCount = visualArchiveItems.filter(i => i.category === 'memory').length
const cities = [...new Set(visualArchiveItems.map(i => i.city).filter(Boolean))]

const archiveSections = [
  { label: 'Images', desc: 'Visual archive — editorial, memory, cities', href: '#/archive/images', icon: Camera, count: visualArchiveItems.length },
  { label: 'Notes', desc: 'Text vault — learning, thoughts, projects', href: '#/archive/notes', icon: PenTool, count: null },
  { label: 'Travel', desc: 'Cities and places — Chongqing, Chengdu, Wuhan', href: '#/archive/images', icon: Map, count: memoryCount },
  { label: 'Projects', desc: 'Things I build and experiment with', href: '#/archive/notes', icon: FolderOpen, count: null },
  { label: 'Learning', desc: 'Language, code, and creative practice', href: '#/archive/notes', icon: GraduationCap, count: null },
  { label: 'Journal', desc: 'Longer thoughts and reflections', href: '#/archive/notes', icon: BookOpen, count: null },
  { label: 'Collections', desc: 'Curated groupings — by mood, place, and type', href: '#/archive/collections', icon: Layers, count: null },
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
          A growing content library — images, notes, travel records, and learning logs.
          Not a small gallery section, but a place for everything that deserves more room.
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
          <span className="archive-stat__value">{cities.length}</span>
          <span className="archive-stat__label">Cities</span>
        </div>
      </div>

      <ScrollReveal className="archive-page__nav-section">
        <h2 className="archive-page__section-title">Explore the archive</h2>
        <div className="archive-nav-grid">
          {archiveSections.map((section) => {
            const Icon = section.icon
            return (
              <a key={section.label} href={section.href} className="archive-nav-card">
                <div className="archive-nav-card__icon">
                  <Icon aria-hidden="true" size={22} strokeWidth={1.4} />
                </div>
                <div className="archive-nav-card__body">
                  <h3>{section.label}</h3>
                  <p>{section.desc}</p>
                </div>
                {section.count !== null && (
                  <span className="archive-nav-card__count">{section.count}</span>
                )}
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
            across {cities.length} cities. Tomorrow it will hold learning notes, project logs,
            longer essays, and whatever else deserves a permanent place.
          </p>
          <p className="archive-vision-card__cn">
            档案馆会长大。现在有 {visualArchiveItems.length} 张图，
            以后会有更多值得留下来的东西。
          </p>
        </div>
      </ScrollReveal>
    </main>
  )
}
