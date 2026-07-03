import { ArrowLeft, GraduationCap, Pen, BookOpen, ArrowRight, Sparkles } from 'lucide-react'
import { Fragment } from 'react'

import { ScrollReveal } from '../components/motion/ScrollReveal'
import { BorderGlow } from '../components/effects/react-bits/BorderGlow'
import '../components/effects/react-bits/BorderGlow.css'
import './ArchiveNotesPage.css'

const categoryCards = [
  {
    label: 'Learning',
    href: '#/archive/notes/learning',
    desc: 'Language study, creative coding, design patterns — what I learn and how I learn it.',
    icon: <GraduationCap size={20} />,
    color: '#56e4ff',
    glowColor: '187 100 67',
    glowColors: ['#56e4ff', '#3b82f6', '#38bdf8'],
    backgroundColor: 'oklch(25% 0.025 285 / 98%)',
    status: 'Coming soon',
  },
  {
    label: 'Thoughts',
    href: '#/archive/notes/thoughts',
    desc: 'Longer reflections on identity, growth, curiosity, and the things I keep thinking about.',
    icon: <Pen size={20} />,
    color: '#8c75ff',
    glowColor: '260 100 73',
    glowColors: ['#8c75ff', '#7c3aed', '#a78bfa'],
    backgroundColor: 'oklch(25% 0.025 285 / 98%)',
    status: 'Coming soon',
  },
  {
    label: 'Journal',
    href: '#/archive/notes/journal',
    desc: 'Personal entries, drafts, and observations — a quiet space for things worth writing down.',
    icon: <BookOpen size={20} />,
    color: '#f2b976',
    glowColor: '38 90 68',
    glowColors: ['#f2b976', '#f59e0b', '#fbbf24'],
    backgroundColor: 'oklch(25% 0.025 285 / 98%)',
    status: 'Coming soon',
  },
]

const placeholderNotes = [
  {
    category: 'Learning',
    title: 'Notes will appear here',
    preview: 'Each note shows a preview of the content, making it easy to browse at a glance.',
    color: '#56e4ff',
    glowColor: '187 100 67',
    glowColors: ['#56e4ff', '#3b82f6', '#38bdf8'],
    backgroundColor: 'oklch(25% 0.025 285 / 98%)',
  },
  {
    category: 'Thoughts',
    title: 'A place for longer reflections',
    preview: 'Thoughts that need more than a paragraph — drafted, revisited, and kept.',
    color: '#8c75ff',
    glowColor: '260 100 73',
    glowColors: ['#8c75ff', '#7c3aed', '#a78bfa'],
    backgroundColor: 'oklch(25% 0.025 285 / 98%)',
  },
  {
    category: 'Journal',
    title: 'Entries and observations',
    preview: 'Quiet documentation of moments, ideas, and the shape of ordinary days.',
    color: '#f2b976',
    glowColor: '38 90 68',
    glowColors: ['#f2b976', '#f59e0b', '#fbbf24'],
    backgroundColor: 'oklch(25% 0.025 285 / 98%)',
  },
]

const flowSteps = [
  { icon: <Pen size={16} />, label: 'Capture', desc: 'Write down the raw thought' },
  { icon: <Sparkles size={16} />, label: 'Reflect', desc: 'Let it sit, revisit, refine' },
  { icon: <BookOpen size={16} />, label: 'Archive', desc: 'Save with context and care' },
]

export function ArchiveNotesPage() {
  return (
    <main className="archive-notes">
      <div className="archive-notes__header">
        <a href="#/archive" className="archive-notes__back">
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
          <span>Back to Archive</span>
        </a>
        <h1 className="archive-notes__title">Notes Vault</h1>
        <p className="archive-notes__subtitle">
          A place for longer writing — learning logs, reflections, and journal entries.
          Not a blog engine, but a quiet space for things worth writing down.
        </p>
      </div>

      {/* ── Category cards with BorderGlow ────────── */}
      <ScrollReveal className="archive-notes__categories">
        <h2 className="archive-notes__section-title">Categories</h2>
        <div className="archive-notes__category-grid">
          {categoryCards.map((cat) => (
            <a key={cat.label} href={cat.href} className="archive-notes__cat-link">
              <BorderGlow
                className="archive-notes__cat-card"
                glowColor={cat.glowColor}
                backgroundColor={cat.backgroundColor}
                borderRadius={20}
                glowRadius={28}
                colors={cat.glowColors}
              >
                <div className="archive-notes__cat-inner">
                  <div className="archive-notes__cat-header">
                    <span className="archive-notes__cat-icon" style={{ color: cat.color }}>
                      {cat.icon}
                    </span>
                    <h3 className="archive-notes__cat-label">{cat.label}</h3>
                  </div>
                  <p className="archive-notes__cat-desc">{cat.desc}</p>
                  <span className="archive-notes__cat-status">{cat.status}</span>
                </div>
              </BorderGlow>
            </a>
          ))}
        </div>
      </ScrollReveal>

      {/* ── Note placeholders with BorderGlow ─────── */}
      <ScrollReveal className="archive-notes__preview">
        <h2 className="archive-notes__section-title">Recent notes</h2>
        <div className="archive-notes__preview-grid">
          {placeholderNotes.map((note) => (
            <BorderGlow
              key={note.title}
              className="archive-notes__note-card"
              glowColor={note.glowColor}
              backgroundColor={note.backgroundColor}
              borderRadius={20}
              glowRadius={28}
              colors={note.glowColors}
            >
              <div className="archive-notes__note-inner">
                <span className="archive-notes__note-tag" style={{ color: note.color }}>
                  {note.category}
                </span>
                <h3 className="archive-notes__note-title">{note.title}</h3>
                <p className="archive-notes__note-preview">{note.preview}</p>
              </div>
            </BorderGlow>
          ))}
        </div>
      </ScrollReveal>

      {/* ── Flow with BorderGlow ──────────────────── */}
      <ScrollReveal className="archive-notes__flow-section">
        <h2 className="archive-notes__section-title">How it works</h2>
        <BorderGlow
          className="archive-notes__flow-card"
          glowColor="38 90 68"
          backgroundColor="oklch(25% 0.025 285 / 98%)"
          borderRadius={24}
          glowRadius={32}
          colors={['#f2b976', '#f59e0b', '#fbbf24']}
        >
          <div className="archive-notes__flow">
            {flowSteps.map((step, i) => (
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
