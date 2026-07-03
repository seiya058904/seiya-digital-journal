import assert from 'node:assert/strict'
import { existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'

import { getWrappedProjectIndex, projects } from './projects.ts'

test('project records keep the approved order and only confirmed links', () => {
  assert.deepEqual(
    projects.map((project) => project.title),
    [
      'Hardware Monitoring',
      'Relax Block Puzzle',
      'Seiya Digital Journal',
      'Seiya Personal Website',
      'Star Ring Card Battle',
    ],
  )

  const links = projects.flatMap((project) =>
    [project.primaryLink, project.secondaryLink].filter((link): link is string => Boolean(link)),
  )

  assert.equal(links.every((link) => link.startsWith('https://')), true)
  assert.equal(links.some((link) => link === '#' || /[a-z]:\\/i.test(link)), false)
})

test('carousel navigation wraps at both ends', () => {
  assert.equal(getWrappedProjectIndex(-1, projects.length), projects.length - 1)
  assert.equal(getWrappedProjectIndex(projects.length, projects.length), 0)
})

test('every carousel slide uses an optimized local showcase image', () => {
  assert.deepEqual(
    projects.map((project) => project.image),
    [
      '/project-showcase/hardware-monitoring.webp',
      '/project-showcase/relax-block-puzzle.webp',
      '/project-showcase/seiya-digital-journal.webp',
      '/project-showcase/seiya-personal-website.webp',
      '/project-showcase/star-ring-card-battle.webp',
    ],
  )

  for (const project of projects) {
    assert.equal(project.image?.startsWith('/project-showcase/'), true, project.title)
    assert.equal(Boolean(project.imageAlt?.trim()), true, project.title)
    const imagePath = join(process.cwd(), 'public', project.image?.replace(/^\//, '') ?? '')
    assert.equal(existsSync(imagePath), true, project.title)
    assert.equal(statSync(imagePath).size <= 500_000, true, `${project.title} exceeds 500 KB`)
  }
})
