import { useEffect, useState } from 'react'
import { ArrowLeft, FileText, Book, Code, GraduationCap, Library, Pen, Quote, MessageSquare, Sparkles, Lightbulb, Heart, BookOpen, Calendar, Clock, Camera, Map, Star } from 'lucide-react'

import { GlassIcons } from '../components/effects/react-bits/GlassIcons'
import '../components/effects/react-bits/GlassIcons.css'
import './ArchiveNotesCategoryPage.css'

type CategoryInfo = {
  title: string
  subtitle: string
  backHref: string
  items: { icon: React.ReactElement; color: string; label: string; onClick?: () => void }[]
}

const categoryMap: Record<string, CategoryInfo> = {
  learning: {
    title: 'Learning',
    subtitle: 'Language study, creative coding, design patterns — what I learn and how I learn it.',
    backHref: '#/archive/notes',
    items: [
      { icon: <FileText size={24} />, color: 'blue', label: 'Study Notes' },
      { icon: <Book size={24} />, color: 'blue', label: 'Book Notes' },
      { icon: <Code size={24} />, color: 'blue', label: 'Code Snippets' },
      { icon: <GraduationCap size={24} />, color: 'blue', label: 'Courses' },
      { icon: <Library size={24} />, color: 'blue', label: 'Reference' },
      { icon: <FileText size={24} />, color: 'blue', label: 'Cheatsheets' },
      { icon: <Book size={24} />, color: 'blue', label: 'Reading List' },
      { icon: <Code size={24} />, color: 'blue', label: 'Patterns' },
    ],
  },
  thoughts: {
    title: 'Thoughts',
    subtitle: 'Longer reflections on identity, growth, curiosity, and the things I keep thinking about.',
    backHref: '#/archive/notes',
    items: [
      { icon: <Pen size={24} />, color: 'purple', label: 'Personal Essays' },
      { icon: <Quote size={24} />, color: 'purple', label: 'Quotes' },
      { icon: <MessageSquare size={24} />, color: 'purple', label: 'Conversations' },
      { icon: <Sparkles size={24} />, color: 'purple', label: 'Ideas' },
      { icon: <Lightbulb size={24} />, color: 'purple', label: 'Insights' },
      { icon: <Heart size={24} />, color: 'purple', label: 'Reflections' },
      { icon: <Pen size={24} />, color: 'purple', label: 'Drafts' },
      { icon: <FileText size={24} />, color: 'purple', label: 'Notes' },
    ],
  },
  journal: {
    title: 'Journal',
    subtitle: 'Personal entries, drafts, and observations — a quiet space for things worth writing down.',
    backHref: '#/archive/notes',
    items: [
      { icon: <BookOpen size={24} />, color: 'orange', label: 'Journal Entries' },
      { icon: <Calendar size={24} />, color: 'orange', label: 'Daily Log' },
      { icon: <Clock size={24} />, color: 'orange', label: 'Moments' },
      { icon: <FileText size={24} />, color: 'orange', label: 'Drafts' },
      { icon: <Camera size={24} />, color: 'orange', label: 'Visual Journal' },
      { icon: <Map size={24} />, color: 'orange', label: 'Places' },
      { icon: <Heart size={24} />, color: 'orange', label: 'Gratitude' },
      { icon: <Star size={24} />, color: 'orange', label: 'Highlights' },
    ],
  },
}

function getCategoryFromHash(): string {
  if (typeof window === 'undefined') return 'learning'
  const segments = window.location.hash.split('/').filter(Boolean)
  const last = segments[segments.length - 1]
  if (last === 'learning') return 'learning'
  if (last === 'thoughts') return 'thoughts'
  if (last === 'journal') return 'journal'
  return 'learning'
}

export function ArchiveNotesCategoryPage() {
  const [catKey, setCatKey] = useState(() => getCategoryFromHash())

  useEffect(() => {
    const onHashChange = () => setCatKey(getCategoryFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const cat = categoryMap[catKey] || categoryMap.learning

  return (
    <main className="archive-notes-cat">
      <div className="archive-notes-cat__header">
        <a href={cat.backHref} className="archive-notes-cat__back">
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
          <span>Back to Notes Vault</span>
        </a>
        <h1 className="archive-notes-cat__title">{cat.title}</h1>
        <p className="archive-notes-cat__subtitle">{cat.subtitle}</p>
      </div>

      <div className="archive-notes-cat__docs">
        <GlassIcons items={cat.items} className="archive-notes-cat__glass" />
      </div>

      <p className="archive-notes-cat__footnote">
        Each icon represents a document. Click to open — more documents will appear as the vault grows.
      </p>
    </main>
  )
}
