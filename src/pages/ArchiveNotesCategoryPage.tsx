import { useEffect, useState } from 'react'
import { ArrowLeft, Plus, Calendar } from 'lucide-react'

import { ScrollReveal } from '../components/motion/ScrollReveal'
import { GlassIcons } from '../components/effects/react-bits/GlassIcons'
import { BorderGlow } from '../components/effects/react-bits/BorderGlow'
import { getNotesByCategory } from '../data/notes'
import type { NoteCategory } from '../data/notes'
import '../components/effects/react-bits/GlassIcons.css'
import '../components/effects/react-bits/BorderGlow.css'
import './ArchiveNotesCategoryPage.css'

const cardBg = 'oklch(21% 0.028 292 / 98%)'

const categoryMeta: Record<NoteCategory, { color: string; description: string; chineseDescription: string }> = {
  learning: {
    color: '#56e4ff',
    description: 'Language study, creative coding, design patterns — what I learn and how I learn it.',
    chineseDescription: '学习方法、编程、英语、系统化学习笔记',
  },
  thoughts: {
    color: '#8c75ff',
    description: 'Longer reflections on identity, growth, curiosity, and the things I keep thinking about.',
    chineseDescription: '反思、自我表达、成长、观察',
  },
  journal: {
    color: '#f2b976',
    description: 'Personal entries, drafts, and observations — a quiet space for things worth writing down.',
    chineseDescription: '阶段记录、网站搭建、长期成长日志',
  },
}

function getCategoryFromHash(): NoteCategory {
  if (typeof window === 'undefined') return 'learning'
  const segments = window.location.hash.split('/').filter(Boolean)
  const last = segments[segments.length - 1]
  if (last === 'learning') return 'learning'
  if (last === 'thoughts') return 'thoughts'
  if (last === 'journal') return 'journal'
  return 'learning'
}

export function ArchiveNotesCategoryPage() {
  const [catKey, setCatKey] = useState<NoteCategory>(() => getCategoryFromHash())

  useEffect(() => {
    const onHashChange = () => setCatKey(getCategoryFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const meta = categoryMeta[catKey] || categoryMeta.learning
  const notes = getNotesByCategory(catKey)

  // 只为真实笔记创建玻璃图标（前3个有真实内容的）
  const glassItems = notes.map((note) => ({
    icon: <Calendar size={24} />,
    color: catKey === 'learning' ? 'blue' : catKey === 'thoughts' ? 'purple' : 'orange',
    label: note.title,
    onClick: () => {
      window.location.hash = `#/archive/notes/${note.id}`
    },
  }))

  return (
    <main className="archive-notes-cat">
      {/* Header with animation */}
      <ScrollReveal className="archive-notes-cat__header">
        <a href="#/archive/notes" className="archive-notes-cat__back">
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
          <span>Back to Notes Vault</span>
        </a>
        <h1 className="archive-notes-cat__title">{catKey.charAt(0).toUpperCase() + catKey.slice(1)}</h1>
        <p className="archive-notes-cat__subtitle">{meta.description}</p>
        <p className="archive-notes-cat__subtitle--chinese">{meta.chineseDescription}</p>
      </ScrollReveal>

      {/* Glass icons without animation (preserves glass effect) */}
      <div className="archive-notes-cat__docs">
        <GlassIcons items={glassItems} className="archive-notes-cat__glass" />
      </div>

      {/* Future shelves section */}
      <ScrollReveal className="archive-notes-cat__future">
        <BorderGlow
          className="archive-notes-cat__future-card"
          glowColor="260 30 30"
          backgroundColor={cardBg}
          borderRadius={20}
          glowRadius={24}
          colors={['#5A6A82', '#4a5568', '#6b7c93']}
        >
          <div className="archive-notes-cat__future-inner">
            <span className="archive-notes-cat__future-icon">
              <Plus size={20} strokeWidth={1.5} />
            </span>
            <div>
              <h2 className="archive-notes-cat__future-title">Future shelves</h2>
              <p className="archive-notes-cat__future-desc">More documents will appear here as the vault grows.</p>
            </div>
          </div>
        </BorderGlow>
      </ScrollReveal>

      {/* Footnote with animation */}
      <ScrollReveal>
        <p className="archive-notes-cat__footnote">
          {notes.length} note{notes.length !== 1 ? 's' : ''} available in this folder. Each glass tile opens one document.
        </p>
      </ScrollReveal>
    </main>
  )
}