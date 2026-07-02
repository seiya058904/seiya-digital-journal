import { ArrowLeft, BookOpen, FolderOpen, GraduationCap } from 'lucide-react'

import { ScrollReveal } from '../components/motion/ScrollReveal'
import './ArchiveNotesPage.css'

const noteCategories = [
  {
    label: 'Learning',
    icon: GraduationCap,
    desc: 'Language study, creative coding, design patterns — what I learn and how I learn it.',
    count: null,
    status: 'Coming soon',
  },
  {
    label: 'Thoughts',
    icon: BookOpen,
    desc: 'Longer reflections on identity, growth, curiosity, and the things I keep thinking about.',
    count: null,
    status: 'Coming soon',
  },
  {
    label: 'Projects',
    icon: FolderOpen,
    desc: 'Build logs, experiments, and notes on things I make — not portfolios, but process.',
    count: null,
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
        <h1 className="archive-notes__title">Text Vault</h1>
        <p className="archive-notes__subtitle">
          A place for longer writing — learning logs, reflections, and project notes.
          Not a blog engine, but a quiet space for things worth writing down.
        </p>
      </div>

      <ScrollReveal className="archive-notes__categories">
        <h2 className="archive-notes__section-title">Categories</h2>
        <div className="archive-notes__grid">
          {noteCategories.map((cat) => {
            const Icon = cat.icon
            return (
              <div key={cat.label} className="archive-note-card">
                <div className="archive-note-card__icon">
                  <Icon aria-hidden="true" size={22} strokeWidth={1.4} />
                </div>
                <div className="archive-note-card__body">
                  <h3>{cat.label}</h3>
                  <p>{cat.desc}</p>
                </div>
                <span className="archive-note-card__status">{cat.status}</span>
              </div>
            )
          })}
        </div>
      </ScrollReveal>

      <ScrollReveal className="archive-notes__vision">
        <h2 className="archive-notes__section-title">What this becomes</h2>
        <div className="archive-notes__vision-card">
          <p>
            The Text Vault will hold things that don't fit in short journal entries —
            longer learning notes, project retrospectives, and thinking-out-loud essays.
            Each category grows at its own pace.
          </p>
          <p className="archive-notes__vision-card__cn">
            文字档案馆会装下那些不适合放在短条目里的东西——
            学习笔记、项目回顾、和一些慢慢写的想法。
          </p>
        </div>
      </ScrollReveal>
    </main>
  )
}
