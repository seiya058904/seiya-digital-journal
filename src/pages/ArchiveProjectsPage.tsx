import { ArrowLeft } from 'lucide-react'

import { ScrollReveal } from '../components/motion/ScrollReveal'
import './ArchiveProjectsPage.css'

const projectCategories = [
  {
    label: 'Websites',
    desc: 'Full websites and web apps built from scratch.',
    status: 'Coming soon — projects are being organized.',
  },
  {
    label: 'Games',
    desc: 'Game prototypes, interactive experiments, and playful builds.',
    status: 'Coming soon — projects are being organized.',
  },
  {
    label: 'Presentations',
    desc: 'Slides, decks, and visual presentations on various topics.',
    status: 'Coming soon — projects are being organized.',
  },
  {
    label: 'Experiments',
    desc: 'Visual experiments, creative coding, and tools I built to learn.',
    status: 'Coming soon — projects are being organized.',
  },
]

export function ArchiveProjectsPage() {
  return (
    <main className="archive-projects">
      <div className="archive-projects__header">
        <a href="#/archive" className="archive-projects__back">
          <ArrowLeft aria-hidden="true" size={16} strokeWidth={1.5} />
          <span>Back to Archive</span>
        </a>
        <h1 className="archive-projects__title">Project Vault</h1>
        <p className="archive-projects__subtitle">
          A place for websites, game prototypes, visual experiments, and things I build over time.
        </p>
      </div>

      <ScrollReveal className="archive-projects__categories">
        <h2 className="archive-projects__section-title">Categories</h2>
        <div className="archive-projects__grid">
          {projectCategories.map((cat) => (
            <div key={cat.label} className="archive-project-card">
              <h3 className="archive-project-card__label">{cat.label}</h3>
              <p className="archive-project-card__desc">{cat.desc}</p>
              <span className="archive-project-card__status">{cat.status}</span>
            </div>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal className="archive-projects__vision">
        <h2 className="archive-projects__section-title">What this becomes</h2>
        <div className="archive-projects__vision-card">
          <p>
            The Project Vault will grow to hold everything I build — from polished websites
            to quick experiments. Each project gets a page with context, process notes, and
            what I learned making it.
          </p>
          <p className="archive-projects__vision-card__cn">
            项目档案馆会装下我做过的所有东西——从完整的网站到快速的实验。
            每个项目都会有一页记录：背景、过程和学到的东西。
          </p>
        </div>
      </ScrollReveal>
    </main>
  )
}
