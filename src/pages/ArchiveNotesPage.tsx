import { ArrowLeft, ArrowRight, BookOpen, GraduationCap, Pen, Sparkles } from 'lucide-react'
import { Fragment } from 'react'

import { ScrollReveal } from '../components/motion/ScrollReveal'
import { BorderGlow } from '../components/effects/react-bits/BorderGlow'
import { getNotesByCategory, categoryInfo } from '../data/notes'
import type { NoteCategory } from '../data/notes'
import '../components/effects/react-bits/BorderGlow.css'
import './ArchiveNotesPage.css'

const archiveNotesCardBackground = 'oklch(21% 0.028 292 / 98%)'

const categoryMeta: Record<
  NoteCategory,
  { icon: React.ReactNode; color: string; glowColor: string; glowColors: string[] }
> = {
  learning: {
    icon: <GraduationCap size={20} />,
    color: '#56e4ff',
    glowColor: '187 100 67',
    glowColors: ['#56e4ff', '#3b82f6', '#38bdf8'],
  },
  thoughts: {
    icon: <Pen size={20} />,
    color: '#8c75ff',
    glowColor: '260 100 73',
    glowColors: ['#8c75ff', '#7c3aed', '#a78bfa'],
  },
  journal: {
    icon: <BookOpen size={20} />,
    color: '#f2b976',
    glowColor: '38 90 68',
    glowColors: ['#f2b976', '#f59e0b', '#fbbf24'],
  },
}

export function ArchiveNotesPage() {
  const allCategories: NoteCategory[] = ['learning', 'thoughts', 'journal']

  return (
    <main className="archive-notes">
      <div className="archive-notes__header">
        <a href="#/archive" className="archive-notes__back">
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
          <span>Back to Archive</span>
        </a>
        <h1 className="archive-notes__title">Notes Vault</h1>
        <p className="archive-notes__subtitle">
          A writing drawer for learning notes, reflections, and journal fragments.
        </p>
        <p className="archive-notes__subtitle--chinese">
          这里存放学习笔记、想法记录和阶段性的个人日志。
        </p>
      </div>

      {/* ── Category cards ────────────────────────── */}
      <ScrollReveal className="archive-notes__categories">
        <h2 className="archive-notes__section-title">Categories</h2>
        <div className="archive-notes__category-grid">
          {allCategories.map((key) => {
            const info = categoryInfo[key]
            const meta = categoryMeta[key]
            const count = getNotesByCategory(key).length
            const tags = getNotesByCategory(key)
              .flatMap((n) => n.tags)
              .filter((t, i, a) => a.indexOf(t) === i)
              .slice(0, 4)
            return (
              <a key={key} href={`#/archive/notes/${key}`} className="archive-notes__cat-link">
                <BorderGlow
                  className="archive-notes__cat-card"
                  glowColor={meta.glowColor}
                  backgroundColor={archiveNotesCardBackground}
                  borderRadius={20}
                  glowRadius={28}
                  colors={meta.glowColors}
                >
                  <div className="archive-notes__cat-inner">
                    <div className="archive-notes__cat-header">
                      <span className="archive-notes__cat-icon" style={{ color: meta.color }}>
                        {meta.icon}
                      </span>
                      <h3 className="archive-notes__cat-label">{info.label}</h3>
                    </div>
                    <p className="archive-notes__cat-desc">{info.description}</p>
                    <div className="archive-notes__cat-footer">
                      <span className="archive-notes__cat-count">{count} notes</span>
                      {tags.length > 0 && (
                        <div className="archive-notes__cat-tags">
                          {tags.map((t) => (
                            <span key={t} className="archive-notes__cat-tag">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </BorderGlow>
              </a>
            )
          })}
        </div>
      </ScrollReveal>

      {/* ── How it works ─────────────────────────── */}
      <ScrollReveal className="archive-notes__flow-section">
        <h2 className="archive-notes__section-title">How it works</h2>
        <BorderGlow
          className="archive-notes__flow-card"
          glowColor="350 92 64"
          backgroundColor={archiveNotesCardBackground}
          borderRadius={24}
          glowRadius={32}
          colors={['#ff6b93', '#ff3366', '#ffb3c7']}
        >
          <div className="archive-notes__flow">
            {[
              { icon: <Pen size={16} />, label: 'Capture', desc: 'Write down the raw thought' },
              { icon: <Sparkles size={16} />, label: 'Reflect', desc: 'Let it sit, revisit, refine' },
              { icon: <BookOpen size={16} />, label: 'Archive', desc: 'Save with context and care' },
            ].map((step, i) => (
              <Fragment key={step.label}>
                {i > 0 && (
                  <div className="archive-notes__flow-arrow" aria-hidden>
                    <ArrowRight size={16} strokeWidth={1.2} />
                  </div>
                )}
                <div className="archive-notes__flow-step">
                  <span className="archive-notes__flow-icon">{step.icon}</span>
                  <span className="archive-notes__flow-label">{step.label}</span>
                  <span className="archive-notes__flow-desc">{step.desc}</span>
                </div>
              </Fragment>
            ))}
          </div>
        </BorderGlow>
      </ScrollReveal>
    </main>
  )
}