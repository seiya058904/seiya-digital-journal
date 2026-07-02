import { ArrowLeft, GraduationCap, Pen, BookOpen } from 'lucide-react'

import { ScrollReveal } from '../components/motion/ScrollReveal'
import { GlassIcons } from '../components/effects/react-bits/GlassIcons'
import '../components/effects/react-bits/GlassIcons.css'
import './ArchiveNotesPage.css'

const glassIconItems = [
  { icon: <GraduationCap size={24} />, color: 'transparent', label: 'Learning' },
  { icon: <Pen size={24} />, color: 'transparent', label: 'Thoughts' },
  { icon: <BookOpen size={24} />, color: 'transparent', label: 'Journal' },
]

const noteCategories = [
  {
    label: 'Learning',
    desc: 'Language study, creative coding, design patterns — what I learn and how I learn it.',
    status: 'Coming soon',
  },
  {
    label: 'Thoughts',
    desc: 'Longer reflections on identity, growth, curiosity, and the things I keep thinking about.',
    status: 'Coming soon',
  },
  {
    label: 'Journal',
    desc: 'Personal entries, drafts, and observations — a quiet space for things worth writing down.',
    status: 'Coming soon',
  },
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

      <ScrollReveal className="archive-notes__categories">
        <h2 className="archive-notes__section-title">Categories</h2>
        <div className="archive-notes__glass-wrap">
          <GlassIcons items={glassIconItems} className="archive-notes__glass" />
        </div>
        <div className="archive-notes__category-list">
          {noteCategories.map((cat) => (
            <div key={cat.label} className="archive-note-item">
              <span className="archive-note-item__label">{cat.label}</span>
              <span className="archive-note-item__desc">{cat.desc}</span>
              <span className="archive-note-item__status">{cat.status}</span>
            </div>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal className="archive-notes__vision">
        <h2 className="archive-notes__section-title">What this becomes</h2>
        <div className="archive-notes__vision-card">
          <p>
            The Notes Vault will hold things that don't fit in short journal entries —
            longer learning notes, personal reflections, and thinking-out-loud essays.
            Each category grows at its own pace.
          </p>
          <p className="archive-notes__vision-card__cn">
            笔记档案馆会装下那些不适合放在短条目里的东西——
            学习笔记、个人反思、和一些慢慢写的想法。
          </p>
        </div>
      </ScrollReveal>
    </main>
  )
}
