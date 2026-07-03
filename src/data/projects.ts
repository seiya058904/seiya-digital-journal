export type ProjectCategory = 'website' | 'game' | 'presentation' | 'experiment' | 'system'

export type ProjectStatus = 'active' | 'stable' | 'prototype' | 'planned'

export type ProjectRecord = {
  id: string
  title: string
  subtitle: string
  category: ProjectCategory
  status: ProjectStatus
  year: string
  description: string
  highlights: string[]
  tech: string[]
  imageKind: 'website' | 'game' | 'slides' | 'system' | 'motion'
  image: string
  imageAlt: string
  primaryLink?: string
  secondaryLink?: string
  primaryLabel?: string
  secondaryLabel?: string
}

export const projects: ProjectRecord[] = [
  {
    id: 'hardware-monitoring',
    title: 'Hardware Monitoring',
    subtitle: 'Lightweight Windows performance monitor',
    category: 'system',
    status: 'stable',
    year: '2026',
    description:
      'A compact Windows utility for tracking CPU, GPU, memory, temperatures, frequencies, power, network activity, and in-game FPS.',
    highlights: ['Real-time hardware metrics', 'FPS and 1% Low', 'Bilingual controls', 'Tray and always-on-top modes'],
    tech: ['Python', 'Windows', 'NSIS', 'Hardware Monitoring'],
    imageKind: 'system',
    image: '/project-showcase/hardware-monitoring.webp',
    imageAlt: 'Blue promotional poster showing Hardware Monitoring windows beside illuminated PC hardware',
    primaryLink: 'https://github.com/seiya058904/Hardware-Monitoring',
    primaryLabel: 'Repository',
  },
  {
    id: 'relax-block-puzzle',
    title: 'Relax Block Puzzle',
    subtitle: 'Offline mobile block puzzle',
    category: 'game',
    status: 'stable',
    year: '2026',
    description:
      'A lightweight block puzzle game with a 10x10 board, three difficulty levels, local scores, utility tools, audio, and Android offline play.',
    highlights: ['10x10 puzzle board', 'Three difficulty levels', 'Local score saving', 'Android offline play'],
    tech: ['JavaScript', 'Canvas', 'Kotlin', 'Android WebView'],
    imageKind: 'game',
    image: '/project-showcase/relax-block-puzzle.webp',
    imageAlt: 'Blue promotional poster showing Relax Block Puzzle running on a phone with colorful blocks',
    primaryLink: 'https://seiya058904.github.io/Relax-Block-Puzzle/',
    secondaryLink: 'https://github.com/seiya058904/Relax-Block-Puzzle',
    primaryLabel: 'Open game',
    secondaryLabel: 'Source',
  },
  {
    id: 'seiya-digital-journal',
    title: 'Seiya Digital Journal',
    subtitle: 'Personal digital identity system',
    category: 'website',
    status: 'active',
    year: '2026',
    description:
      'A dark editorial personal website with a three-vault archive, visual journal, motion experiments, and project records.',
    highlights: ['Three-vault archive', 'Visual Archive', 'Notes Vault', 'Motion Lab'],
    tech: ['React', 'TypeScript', 'Vite', 'GitHub Pages'],
    imageKind: 'website',
    image: '/project-showcase/seiya-digital-journal.webp',
    imageAlt: 'Purple promotional poster showing the Seiya Digital Journal homepage and its archive sections',
    primaryLink: 'https://seiya058904.github.io/seiya-digital-journal/',
    secondaryLink: 'https://github.com/seiya058904/seiya-digital-journal',
    primaryLabel: 'Open site',
    secondaryLabel: 'Source',
  },
  {
    id: 'seiya-personal-website',
    title: 'Seiya Personal Website',
    subtitle: 'Personal technology archive',
    category: 'website',
    status: 'active',
    year: '2026',
    description:
      'A personal technology homepage for projects, web presentations, learning records, and community interaction.',
    highlights: ['28 web presentations', 'Project collection', 'Comments and likes', 'Account features'],
    tech: ['HTML', 'CSS', 'JavaScript', 'Cloudflare', 'Supabase'],
    imageKind: 'website',
    image: '/project-showcase/seiya-personal-website.webp',
    imageAlt: 'Purple promotional poster showing the Seiya personal website and its project collection',
    primaryLink: 'https://seiya058904.github.io/',
    secondaryLink: 'https://github.com/seiya058904/seiya058904.github.io',
    primaryLabel: 'Open site',
    secondaryLabel: 'Source',
  },
  {
    id: 'star-ring-card-battle',
    title: 'Star Ring Card Battle',
    subtitle: 'Dark fantasy card battle',
    category: 'game',
    status: 'prototype',
    year: '2026',
    description:
      'A single-file fantasy card battle prototype with character decks, skill effects, visual particles, and dark-gold card UI.',
    highlights: ['Turn-based battle', 'Character decks', 'Element particles', 'Dark fantasy card UI'],
    tech: ['HTML', 'CSS', 'JavaScript', 'Android WebView'],
    imageKind: 'game',
    image: '/project-showcase/star-ring-card-battle.webp',
    imageAlt: 'Dark-gold promotional poster showing Star Ring Card Battle gameplay and elemental effects',
    primaryLink: 'https://seiya058904.github.io/star-ring-card-battle/',
    secondaryLink: 'https://github.com/seiya058904/star-ring-card-battle',
    primaryLabel: 'Open game',
    secondaryLabel: 'Source',
  },
]

export function getWrappedProjectIndex(index: number, length: number) {
  return length > 0 ? ((index % length) + length) % length : 0
}
