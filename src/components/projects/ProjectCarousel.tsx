import { ArrowRight } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'

import { getWrappedProjectIndex, projects, type ProjectRecord } from '../../data/projects'
import './ProjectCarousel.css'

const base = import.meta.env.BASE_URL

type ProjectSlideProps = {
  project: ProjectRecord
  index: number
  current: number
  onSelect: (index: number) => void
  headingId: string
}

function ProjectSlide({ project, index, current, onSelect, headingId }: ProjectSlideProps) {
  const slideRef = useRef<HTMLLIElement>(null)
  const xRef = useRef(0)
  const yRef = useRef(0)
  const frameRef = useRef<number>(undefined)
  const active = current === index
  const actionLink = project.primaryLink ?? project.secondaryLink

  useEffect(() => {
    const animate = () => {
      if (slideRef.current) {
        slideRef.current.style.setProperty('--pointer-x', `${xRef.current}px`)
        slideRef.current.style.setProperty('--pointer-y', `${yRef.current}px`)
      }
      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)
    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current)
    }
  }, [])

  return (
    <li
      ref={slideRef}
      className={`project-carousel__slide${active ? ' is-active' : ''}`}
      aria-current={active ? 'true' : undefined}
      onClick={() => {
        if (!active) onSelect(index)
      }}
      onMouseMove={(event) => {
        const bounds = slideRef.current?.getBoundingClientRect()
        if (!bounds) return
        xRef.current = event.clientX - (bounds.left + Math.floor(bounds.width / 2))
        yRef.current = event.clientY - (bounds.top + Math.floor(bounds.height / 2))
      }}
      onMouseLeave={() => {
        xRef.current = 0
        yRef.current = 0
      }}
    >
      <div className="project-carousel__image-plane">
        <img
          src={`${base}${project.image.replace(/^\//, '')}`}
          alt={project.imageAlt}
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="sync"
          fetchPriority={index === 0 ? 'high' : 'auto'}
        />
        <span className="project-carousel__shade" aria-hidden="true" />
      </div>

      <article className="project-carousel__content">
        <h3 id={headingId}>{project.title}</h3>
        <p>{project.subtitle}</p>
        {actionLink ? (
          <a
            href={actionLink}
            className="project-carousel__explore"
            {...(actionLink.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            Explore Project
          </a>
        ) : (
          <button
            type="button"
            className="project-carousel__explore"
            disabled
            title="No confirmed project link"
          >
            Explore Project
          </button>
        )}
      </article>
    </li>
  )
}

export function ProjectCarousel() {
  const [current, setCurrent] = useState(0)
  const id = useId()
  const headingId = `project-carousel-heading-${id}-${current}`
  const move = (direction: number) => {
    setCurrent((index) => getWrappedProjectIndex(index + direction, projects.length))
  }

  return (
    <section
      className="project-carousel"
      aria-roledescription="carousel"
      aria-labelledby={headingId}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          move(-1)
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          move(1)
        }
      }}
    >
      <div className="project-carousel__window">
        <ul
          className="project-carousel__track"
          style={{ transform: `translateX(-${current * (100 / projects.length)}%)` }}
        >
          {projects.map((project, index) => (
            <ProjectSlide
              key={project.id}
              project={project}
              index={index}
              current={current}
              onSelect={setCurrent}
              headingId={`project-carousel-heading-${id}-${index}`}
            />
          ))}
        </ul>
      </div>

      <div className="project-carousel__controls">
        <button type="button" onClick={() => move(-1)} aria-label="Previous project">
          <ArrowRight size={20} aria-hidden="true" />
        </button>
        <span aria-live="polite">
          {String(current + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
        </span>
        <button type="button" onClick={() => move(1)} aria-label="Next project">
          <ArrowRight size={20} aria-hidden="true" />
        </button>
      </div>
    </section>
  )
}
