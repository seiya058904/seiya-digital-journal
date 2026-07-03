import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ScrollReveal } from '../components/motion/ScrollReveal'
import { BorderGlow } from '../components/effects/react-bits/BorderGlow'
import { getNoteById, notes, categoryInfo } from '../data/notes'
import type { NoteDocument } from '../data/notes'
import '../components/effects/react-bits/BorderGlow.css'
import './ArchiveNoteDetailPage.css'

const categoryAccent: Record<string, { color: string; glowColor: string; glowColors: string[] }> = {
  learning: { color: '#56e4ff', glowColor: '187 100 67', glowColors: ['#56e4ff', '#3b82f6', '#38bdf8'] },
  thoughts: { color: '#8c75ff', glowColor: '260 100 73', glowColors: ['#8c75ff', '#7c3aed', '#a78bfa'] },
  journal: { color: '#f2b976', glowColor: '38 90 68', glowColors: ['#f2b976', '#f59e0b', '#fbbf24'] },
}

const cardBg = 'oklch(21% 0.028 292 / 98%)'

function getNoteIdFromHash(): string | null {
  if (typeof window === 'undefined') return null
  const match = window.location.hash.match(/^#\/archive\/notes\/(.+)$/)
  return match ? match[1] : null
}

export function ArchiveNoteDetailPage() {
  const [noteId, setNoteId] = useState<string | null>(() => getNoteIdFromHash())

  useEffect(() => {
    const onHashChange = () => setNoteId(getNoteIdFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const note: NoteDocument | undefined = noteId ? getNoteById(noteId) : undefined

  if (!note) {
    return (
      <main className="archive-note-detail">
        <div className="archive-note-detail__not-found">
          <a href="#/archive/notes" className="archive-note-detail__back">
            <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
            <span>Back to Notes Vault</span>
          </a>
          <h1 className="archive-note-detail__title">Note not found</h1>
          <p className="archive-note-detail__subtitle">
            This note does not exist or has been removed.
          </p>
        </div>
      </main>
    )
  }

  const accent = categoryAccent[note.category] || categoryAccent.learning
  const catInfo = categoryInfo[note.category]
  const categoryHref = `#/archive/notes/${note.category}`
  const currentIndex = notes.findIndex((n) => n.id === note.id)
  const prevNote = currentIndex > 0 ? notes[currentIndex - 1] : null
  const nextNote = currentIndex < notes.length - 1 ? notes[currentIndex + 1] : null

  return (
    <main className="archive-note-detail">
      {/* Back link */}
      <a href={categoryHref} className="archive-note-detail__back">
        <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
        <span>Back to {catInfo.label}</span>
      </a>

      {/* Breadcrumb */}
      <nav className="archive-note-detail__breadcrumb" aria-label="Breadcrumb">
        <a href="#/archive">Archive</a>
        <span className="archive-note-detail__breadcrumb-sep">/</span>
        <a href="#/archive/notes">Notes Vault</a>
        <span className="archive-note-detail__breadcrumb-sep">/</span>
        <a href={categoryHref} style={{ color: accent.color }}>{catInfo.label}</a>
      </nav>

      {/* Title section */}
      <ScrollReveal className="archive-note-detail__heading">
        <h1 className="archive-note-detail__title">{note.title}</h1>
        {note.chineseTitle && (
          <p className="archive-note-detail__chinese-title">{note.chineseTitle}</p>
        )}
        <div className="archive-note-detail__meta">
          <span className="archive-note-detail__meta-cat" style={{ color: accent.color }}>
            {catInfo.label}
          </span>
          <span className="archive-note-detail__meta-sep">·</span>
          <span>{note.dateLabel}</span>
          <span className="archive-note-detail__meta-sep">·</span>
          <span>{note.readingTime} read</span>
        </div>
        {note.tags.length > 0 && (
          <div className="archive-note-detail__tags">
            {note.tags.map((t) => (
              <span key={t} className="archive-note-detail__tag">{t}</span>
            ))}
          </div>
        )}
      </ScrollReveal>

      {/* Document sections heading */}
      <ScrollReveal>
        <h2 className="archive-note-detail__sections-title">Document sections</h2>
      </ScrollReveal>

      {/* Content sections */}
      <div className="archive-note-detail__content">
        {note.sections.map((section, i) => (
          <ScrollReveal key={i} className="archive-note-detail__section">
            <BorderGlow
              className="archive-note-detail__section-card"
              glowColor={accent.glowColor}
              backgroundColor={cardBg}
              borderRadius={20}
              glowRadius={28}
              colors={accent.glowColors}
            >
              <div className="archive-note-detail__section-inner">
                <h2 className="archive-note-detail__section-heading">{section.heading}</h2>
                <p className="archive-note-detail__section-body">{section.body}</p>
                {section.chinese && (
                  <p className="archive-note-detail__section-chinese">{section.chinese}</p>
                )}
              </div>
            </BorderGlow>
          </ScrollReveal>
        ))}
      </div>

      {/* Chinese note (overall) */}
      {note.chineseNote && (
        <ScrollReveal className="archive-note-detail__chinese-note-wrapper">
          <p className="archive-note-detail__chinese-note">{note.chineseNote}</p>
        </ScrollReveal>
      )}

      {/* Bottom navigation */}
      <ScrollReveal className="archive-note-detail__nav">
        <BorderGlow
          className="archive-note-detail__nav-card"
          glowColor="260 50 50"
          backgroundColor={cardBg}
          borderRadius={20}
          glowRadius={24}
          colors={['#5A6A82', '#4a5568', '#6b7c93']}
        >
          <div className="archive-note-detail__nav-inner">
            <a href={categoryHref} className="archive-note-detail__nav-back">
              <ArrowLeft aria-hidden="true" size={14} strokeWidth={1.5} />
              <span>Back to {catInfo.label}</span>
            </a>
            <div className="archive-note-detail__nav-siblings">
              {prevNote ? (
                <a href={`#/archive/notes/${prevNote.id}`} className="archive-note-detail__nav-prev">
                  <ArrowLeft aria-hidden="true" size={12} strokeWidth={1.5} />
                  <span>{prevNote.title}</span>
                </a>
              ) : (
                <span />
              )}
              {nextNote ? (
                <a href={`#/archive/notes/${nextNote.id}`} className="archive-note-detail__nav-next">
                  <span>{nextNote.title}</span>
                  <ArrowRight aria-hidden="true" size={12} strokeWidth={1.5} />
                </a>
              ) : (
                <span />
              )}
            </div>
          </div>
        </BorderGlow>
      </ScrollReveal>
    </main>
  )
}