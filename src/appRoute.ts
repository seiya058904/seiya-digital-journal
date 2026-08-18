export type Page = 'home' | 'lab' | 'archive' | 'archive-images' | 'archive-notes' | 'archive-notes-category' | 'archive-note-detail' | 'archive-projects' | 'gallery' | 'auth' | 'profile'

export function normalizeHashRoute(hash: string): string {
  const path = hash.replace(/\/+$/, '')
  return path === '#' ? '#/' : path
}

export function resolvePageFromHash(hash: string): Page {
  const path = normalizeHashRoute(hash)
  if (path === '#/auth') return 'auth'
  if (path === '#/profile') return 'profile'
  if (path === '#/lab' || path === '#/motion-lab') return 'lab'
  if (path === '#/archive/images/gallery') return 'gallery'
  if (path === '#/archive/images' || path.startsWith('#/archive/images/')) return 'archive-images'
  if (path === '#/archive/notes') return 'archive-notes'
  if (path.startsWith('#/archive/notes/')) {
    const noteSegment = path.replace('#/archive/notes/', '').split('/')[0]
    if (noteSegment && noteSegment !== 'learning' && noteSegment !== 'thoughts' && noteSegment !== 'journal') {
      return 'archive-note-detail'
    }
    return 'archive-notes-category'
  }
  if (path === '#/archive/projects') return 'archive-projects'
  if (path === '#/archive/collections') return 'archive-images'
  if (path === '#/archive') return 'archive'
  if (path === '#/gallery') return 'gallery'
  return 'home'
}

export function getNoteIdFromHash(hash: string): string | null {
  const match = normalizeHashRoute(hash).match(/^#\/archive\/notes\/(.+)$/)
  return match?.[1] ?? null
}
