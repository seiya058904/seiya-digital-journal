export type Thought = {
  title: string
  date: string
  excerpt: string
  href: string
  ariaLabel: string
}

export const thoughts = {
  featured: {
    quote: 'Curiosity is not a mood. It is a method.',
    body: 'I keep learning because I want to understand how things are made: a sentence, a website, a computer, a game, a city, or a future version of myself.',
    chinese: '好奇心不是一种情绪，而是一种方法。',
  },
  entries: [
    {
      title: 'Why I build small things',
      date: 'A note on making',
      excerpt: 'Small projects are not small to me. They are proofs that an idea can leave my head and become something visible. Even a simple page or prototype gives me a clearer sense of progress.',
      href: '#gallery',
      ariaLabel: 'Read note on why I build small things',
    },
    {
      title: 'Language as a second world',
      date: 'A note on English',
      excerpt: 'Learning English feels like building another version of my mind. It is not only about exams or vocabulary. It changes how I explain things, ask questions, and understand people.',
      href: '#interests',
      ariaLabel: 'Read note on language as a second world',
    },
    {
      title: 'A website as a memory device',
      date: 'A note on this journal',
      excerpt: 'I do not want this site to be only a portfolio. I want it to keep traces of what I was thinking at different stages, even when those thoughts are unfinished.',
      href: '#about',
      ariaLabel: 'Read note on website as a memory device',
    },
  ] satisfies Thought[],
} as const
