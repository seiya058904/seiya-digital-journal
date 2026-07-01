export type Interest = {
  title: string
  description: string
  chinese: string
  keywords: readonly string[]
  image: string
  accent: 'cyan' | 'violet' | 'gold' | 'magenta'
}

export type JourneyMilestone = {
  stage: string
  title: string
  description: string
}

export const profile = {
  brand: 'Seiya',
  hero: {
    title: [
      { text: 'Building a ', accent: 'digital self.' },
      { text: 'Learning through ', accent: 'code.' },
    ],
    subtitle:
      'A personal digital journal about technology, language, creativity, and the slow process of becoming.',
    chinese: '用代码记录成长，用设计保存思考。',
  },
  about: {
    intro:
      'I am a student learning to connect technology, language, and visual expression. This site is not a traditional portfolio. It is a digital journal where I record what I build, what I learn, and how my thoughts change over time.',
    statement: 'I build to understand myself.',
    chinese:
      '我是一个正在学习计算机、英语和创作表达的学生。这个网站不是传统作品集，而是一个个人数字日志，用来记录我做过的项目、学到的东西，以及想法慢慢变化的过程。',
  },
  interests: [
    {
      title: 'Technology',
      description: 'I explore computers, frontend development, AI tools, hardware, and personal projects.',
      chinese: '计算机',
      keywords: ['Windows', 'Frontend', 'AI tools', 'Hardware'],
      image: '/gallery/geometry.webp',
      accent: 'cyan',
    },
    {
      title: 'Language',
      description: 'English is a second world for thinking, communication, and future study.',
      chinese: '英语',
      keywords: ['English', 'PTE', 'Speaking', 'Vocabulary'],
      image: '/gallery/reflection.webp',
      accent: 'violet',
    },
    {
      title: 'Making',
      description: 'I turn ideas into websites, game prototypes, visual pages, and presentations.',
      chinese: '创作',
      keywords: ['Websites', 'Games', 'PPT', 'Visual design'],
      image: '/gallery/motion.webp',
      accent: 'gold',
    },
    {
      title: 'Exploration',
      description: 'I use travel, study, and projects to move toward a wider future.',
      chinese: '探索',
      keywords: ['Travel', 'Canada', 'Growth', 'Future'],
      image: '/gallery/horizon.webp',
      accent: 'magenta',
    },
  ] satisfies Interest[],
  journey: [
    {
      stage: 'Now',
      title: 'Learning in public',
      description: 'I am building my own digital space while learning programming, English, design, and project development step by step.',
    },
    {
      stage: 'Growing',
      title: 'Connecting the pieces',
      description: 'My interests are slowly becoming connected: computers, language, visual design, games, writing, and the habit of recording progress.',
    },
    {
      stage: 'Next',
      title: 'Moving outward',
      description: 'The next stage is to keep improving my skills, prepare for study abroad, and turn scattered interests into real ability.',
    },
  ] satisfies JourneyMilestone[],
} as const
