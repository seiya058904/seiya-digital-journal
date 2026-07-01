export type Thought = {
  title: string
  date: string
  excerpt: string
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
    },
    {
      title: 'Language as a second world',
      date: 'A note on English',
      excerpt: 'Learning English feels like building another version of my mind. It is not only about exams or vocabulary. It changes how I explain things, ask questions, and understand people.',
    },
    {
      title: 'A website as a memory device',
      date: 'A note on this journal',
      excerpt: 'I do not want this site to be only a portfolio. I want it to keep traces of what I was thinking at different stages, even when those thoughts are unfinished.',
    },
  ] satisfies Thought[],
} as const
