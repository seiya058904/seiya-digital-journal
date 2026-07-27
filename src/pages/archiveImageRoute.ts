export type ImageCategory = 'featured' | 'editorial' | 'memory' | 'city'

export function getArchiveImageCategoryFromHash(hash: string): ImageCategory | null {
  const path = hash.replace(/\/+$/, '')
  if (path === '#/archive/images/featured') return 'featured'
  if (path === '#/archive/images/editorial') return 'editorial'
  if (path === '#/archive/images/memory') return 'memory'
  if (path === '#/archive/images/city') return 'city'
  return null
}
