import { useState } from 'react'
import { ArrowLeft, Target, Globe, Gamepad2, Monitor, FlaskConical, Search, Route, Trophy, BookOpen, FileText, Code, Image, Settings } from 'lucide-react'

import { ScrollReveal } from '../components/motion/ScrollReveal'
import { ProjectCarousel } from '../components/projects/ProjectCarousel'
import { BorderGlow } from '../components/effects/react-bits/BorderGlow'
import '../components/effects/react-bits/BorderGlow.css'
import '../components/effects/react-bits/GlassIcons.css'
import './ArchiveProjectsPage.css'

const base = import.meta.env.BASE_URL
const archiveProjectsCardBackground = 'oklch(21% 0.028 292 / 98%)'

const focusTabs = [
  {
    id: 'docs',
    icon: <FileText size={18} />,
    label: 'Docs',
    title: 'Archive documentation',
    description: 'Content rules, vault structure, writing system, and how this digital journal is organized.',
  },
  {
    id: 'code',
    icon: <Code size={18} />,
    label: 'Code',
    title: 'Frontend architecture',
    description: 'React, TypeScript, Vite, hash routes, reusable components, and GitHub Pages deployment.',
  },
  {
    id: 'design',
    icon: <Image size={18} />,
    label: 'Design',
    title: 'Visual language',
    description: 'Dark editorial layout, visual archive, glass cards, motion details, and personal-brand atmosphere.',
  },
  {
    id: 'config',
    icon: <Settings size={18} />,
    label: 'Config',
    title: 'System setup',
    description: 'Asset paths, routing constraints, performance decisions, deployment setup, and maintenance notes.',
  },
]

const projectCategories = [
  {
    label: 'Websites',
    desc: 'Full websites and web apps built from scratch.',
    icon: <Globe size={18} />,
    color: '#56e4ff',
    glowColor: '187 100 67',
    glowColors: ['#56e4ff', '#3b82f6', '#38bdf8'],
    backgroundColor: archiveProjectsCardBackground,
    url: 'https://seiya058904.github.io/',
  },
  {
    label: 'Games',
    desc: 'Game prototypes, interactive experiments, and playful builds.',
    icon: <Gamepad2 size={18} />,
    color: '#8c75ff',
    glowColor: '260 100 73',
    glowColors: ['#8c75ff', '#7c3aed', '#a78bfa'],
    backgroundColor: archiveProjectsCardBackground,
    url: 'https://seiya058904.github.io/star-ring-card-battle/',
  },
  {
    label: 'Presentations',
    desc: 'Slides, decks, and visual presentations on various topics.',
    icon: <Monitor size={18} />,
    color: '#f2b976',
    glowColor: '38 90 68',
    glowColors: ['#f2b976', '#f59e0b', '#fbbf24'],
    backgroundColor: archiveProjectsCardBackground,
    url: `${base}presentations/weather-forecast.html`,
  },
  {
    label: 'Experiments',
    desc: 'Visual experiments, creative coding, and tools I built to learn.',
    icon: <FlaskConical size={18} />,
    color: '#ed6dff',
    glowColor: '310 100 73',
    glowColors: ['#ed6dff', '#c084fc', '#e879f9'],
    backgroundColor: archiveProjectsCardBackground,
    status: 'Coming soon',
  },
]

const recordPhases = [
  {
    icon: <Search size={16} />,
    label: 'Context',
    desc: 'What prompted this project — the question, the need, the curiosity.',
  },
  {
    icon: <Route size={16} />,
    label: 'Process',
    desc: 'How it unfolded — decisions, detours, breakthroughs.',
  },
  {
    icon: <Trophy size={16} />,
    label: 'Result',
    desc: 'What shipped — links, screenshots, metrics, outcomes.',
  },
  {
    icon: <BookOpen size={16} />,
    label: 'What I learned',
    desc: 'The takeaway — skills gained, mistakes worth remembering.',
  },
]

export function ArchiveProjectsPage() {
  const [activeFocus, setActiveFocus] = useState(focusTabs[0])

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

      {/* ── Current Focus ───────────────────────── */}
      <ScrollReveal className="archive-projects__focus-section">
        <h2 className="archive-projects__section-title">Current Focus</h2>
        <BorderGlow
          className="archive-projects__focus-card"
          glowColor="38 90 68"
          backgroundColor={archiveProjectsCardBackground}
          borderRadius={24}
          glowRadius={32}
          colors={['#f2b976', '#f59e0b', '#fbbf24']}
        >
          <div className="archive-projects__focus-inner">
            <span className="archive-projects__focus-icon">
              <Target size={20} />
            </span>
            <div className="archive-projects__focus-body">
              <h3 className="archive-projects__focus-title">This digital journal</h3>
              <p className="archive-projects__focus-desc">
                Building and refining seiya-digital-journal — a personal identity magazine
                with rich motion, a three-vault archive, and a growing collection of interactive effects.
                Ongoing work across design, animation, and information architecture.
              </p>
              <span className="archive-projects__focus-status">Active — evolving</span>
            </div>
            <div className="archive-projects__focus-console">
              <div
                className="archive-projects__focus-tabs rb-glass-icons"
                role="tablist"
                aria-label="Current focus details"
              >
                {focusTabs.map((tab) => (
                  <button
                    key={tab.id}
                    id={`focus-tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={activeFocus.id === tab.id}
                    aria-controls="current-focus-panel"
                    className={`rb-glass-icon${activeFocus.id === tab.id ? ' is-active' : ''}`}
                    onClick={() => setActiveFocus(tab)}
                  >
                    <span className="rb-glass-icon__back" />
                    <span className="rb-glass-icon__front">
                      <span className="rb-glass-icon__icon" aria-hidden="true">{tab.icon}</span>
                    </span>
                    <span className="rb-glass-icon__label">{tab.label}</span>
                  </button>
                ))}
              </div>
              <div
                id="current-focus-panel"
                className="archive-projects__focus-panel"
                role="tabpanel"
                aria-labelledby={`focus-tab-${activeFocus.id}`}
                aria-live="polite"
              >
                <h3>{activeFocus.title}</h3>
                <p>{activeFocus.description}</p>
              </div>
            </div>
          </div>
        </BorderGlow>
      </ScrollReveal>

      {/* ── Categories ──────────────────────────── */}
      <ScrollReveal className="archive-projects__categories">
        <h2 className="archive-projects__section-title">Categories</h2>
        <div className="archive-projects__grid">
          {projectCategories.map((cat) => (
            <BorderGlow
              key={cat.label}
              className="archive-project-card"
              glowColor={cat.glowColor}
              backgroundColor={cat.backgroundColor}
              borderRadius={20}
              glowRadius={28}
              colors={cat.glowColors}
            >
              <div className="archive-project-card__inner">
                <div className="archive-project-card__header">
                  <span className="archive-project-card__icon" style={{ color: cat.color }}>
                    {cat.icon}
                  </span>
                  <h3 className="archive-project-card__label">{cat.label}</h3>
                </div>
                <p className="archive-project-card__desc">{cat.desc}</p>
                {cat.url ? (
                  <a href={cat.url} target="_blank" rel="noopener noreferrer" className="archive-project-card__link">
                    Open ↗
                  </a>
                ) : (
                  <span className="archive-project-card__status">{cat.status}</span>
                )}
              </div>
            </BorderGlow>
          ))}
        </div>
      </ScrollReveal>

      {/* ── Project Showcase ───────────────────── */}
      <ScrollReveal className="archive-projects__showcase">
        <div className="archive-projects__showcase-heading">
          <h2 className="archive-projects__section-title">Project Showcase</h2>
          <p>Selected builds and systems from this digital journal.</p>
        </div>
        <ProjectCarousel />
      </ScrollReveal>

      {/* ── Record template ─────────────────────── */}
      <ScrollReveal className="archive-projects__template-section">
        <h2 className="archive-projects__section-title">Project record</h2>
        <BorderGlow
          className="archive-projects__template-card"
          glowColor="38 90 68"
          backgroundColor={archiveProjectsCardBackground}
          borderRadius={24}
          glowRadius={32}
          colors={['#f2b976', '#f59e0b', '#fbbf24']}
        >
          <div className="archive-projects__template">
            {recordPhases.map((phase) => (
              <div key={phase.label} className="archive-projects__template-phase">
                <span className="archive-projects__template-icon">{phase.icon}</span>
                <div className="archive-projects__template-body">
                  <h3 className="archive-projects__template-label">{phase.label}</h3>
                  <p className="archive-projects__template-desc">{phase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </BorderGlow>
      </ScrollReveal>
    </main>
  )
}
