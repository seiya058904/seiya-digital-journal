export type GalleryItem = {
  theme: string
  image: string
  title: string
  caption: string
  note: string
  shape: 'portrait' | 'landscape' | 'square'
}

export const galleryItems = [
  {
    theme: 'Aurora',
    image: '/gallery/aurora.webp',
    title: 'A light that keeps moving',
    caption: 'Some changes arrive quietly, then color everything.',
    note: '微光',
    shape: 'portrait',
  },
  {
    theme: 'Horizon',
    image: '/gallery/horizon.webp',
    title: 'Looking beyond the known',
    caption: 'Learning begins at the edge of what feels familiar.',
    note: '远方',
    shape: 'landscape',
  },
  {
    theme: 'Motion',
    image: '/gallery/motion.webp',
    title: 'Momentum, held softly',
    caption: 'Progress does not need to be loud to be real.',
    note: '流动',
    shape: 'landscape',
  },
  {
    theme: 'Reflection',
    image: '/gallery/reflection.webp',
    title: 'A clearer inner signal',
    caption: 'Making space to notice what a busy day hides.',
    note: '映照',
    shape: 'square',
  },
  {
    theme: 'Geometry',
    image: '/gallery/geometry.webp',
    title: 'Structure becomes expression',
    caption: 'Details turn an idea into something we can feel.',
    note: '秩序',
    shape: 'portrait',
  },
  {
    theme: 'Future',
    image: '/gallery/future.webp',
    title: 'Still becoming',
    caption: 'The next chapter is not certain. That is the beautiful part.',
    note: '未来',
    shape: 'landscape',
  },
] satisfies GalleryItem[]
