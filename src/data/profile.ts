export type Interest = {
  title: string
  description: string
  chinese: string
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
    title: ['Designing with code.', 'Learning with curiosity.', 'Building my own digital world.'],
    subtitle:
      'A personal space for technology, language, design, and ideas — crafted with motion, precision, and a touch of Chinese identity.',
    chinese: '以代码记录成长，以设计表达自我。',
  },
  about: {
    intro:
      'I am learning to connect technology with the way I see the world. This journal holds the quiet details: what I study, what I notice, and who I am becoming.',
    statement: 'I build my digital world to understand myself.',
    chinese: '慢慢认识世界，也慢慢成为自己。',
  },
  interests: [
    {
      title: 'Technology',
      description: 'Understanding software, hardware, and the systems between them.',
      chinese: '计算机',
      accent: 'cyan',
    },
    {
      title: 'Language',
      description: 'Learning English as a new lens for thought, culture, and possibility.',
      chinese: '英语',
      accent: 'violet',
    },
    {
      title: 'Making',
      description: 'Turning abstract ideas into interfaces, experiments, and visible form.',
      chinese: '创作',
      accent: 'gold',
    },
    {
      title: 'Exploration',
      description: 'Preparing for a wider world through study, curiosity, and travel.',
      chinese: '留学',
      accent: 'magenta',
    },
  ] satisfies Interest[],
  journey: [
    {
      stage: 'Now',
      title: 'Learning in public',
      description: 'Studying computer science, practicing English, and recording the process.',
    },
    {
      stage: 'Growing',
      title: 'Connecting the pieces',
      description: 'Exploring creative code, personal expression, and thoughtful digital systems.',
    },
    {
      stage: 'Next',
      title: 'Stepping outward',
      description: 'Preparing for future study abroad and the perspectives that come with it.',
    },
  ] satisfies JourneyMilestone[],
} as const
