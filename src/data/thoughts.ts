export type Thought = {
  title: string
  date: string
  excerpt: string
}

export const thoughts = {
  featured: {
    quote: 'Curiosity drives everything.',
    body: 'I like systems, details, and the feeling of turning abstract thoughts into visible interfaces.',
    chinese: '慢慢学习，慢慢构建。',
  },
  entries: [
    {
      title: 'The quiet power of curiosity',
      date: 'A note for now',
      excerpt: 'Questions make ordinary days feel larger.',
    },
    {
      title: 'Designing a digital identity',
      date: 'An open draft',
      excerpt: 'A personal website can be a mirror, not a résumé.',
    },
    {
      title: 'Growth as a system',
      date: 'Still learning',
      excerpt: 'Small habits become the architecture of a future self.',
    },
  ] satisfies Thought[],
} as const
