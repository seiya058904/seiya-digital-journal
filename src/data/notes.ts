export type NoteCategory = 'learning' | 'thoughts' | 'journal'

export type NoteStatus = 'seed' | 'draft' | 'published'

export type NoteSection = {
  heading: string
  body: string
  chinese?: string
}

export type NoteDocument = {
  id: string
  category: NoteCategory
  title: string
  chineseTitle?: string
  dateLabel: string
  readingTime: string
  status: NoteStatus
  excerpt: string
  chineseNote?: string
  tags: string[]
  sections: NoteSection[]
}

export const notes: NoteDocument[] = [
  // ── Learning ────────────────────────────────────
  {
    id: 'learning-as-system',
    category: 'learning',
    title: 'Learning as a system',
    chineseTitle: '学习作为系统',
    dateLabel: 'July 2026',
    readingTime: '3 min',
    status: 'published',
    excerpt:
      'I am learning to treat study not as a short burst of motivation, but as a system that can survive ordinary days.',
    chineseNote:
      '学习不是一阵热情，而是一套能穿过普通日子的系统。',
    tags: ['Learning', 'System', 'Growth'],
    sections: [
      {
        heading: 'Motivation fades, systems stay',
        body: 'For a long time I relied on motivation. I would wait for the right mood, the right time of day, the right playlist. When motivation came, I studied intensely for a few days. Then it faded, and I stopped. The problem was not a lack of interest — it was a lack of structure. A system does not need inspiration. It only needs to be simple enough to start.',
        chinese: '动力总会消退，但系统不会。关键不是等状态来了再学，而是让学习变成一个不需要动力也能启动的流程。',
      },
      {
        heading: 'The smallest repeatable unit',
        body: 'I started asking: what is the smallest action I can repeat every day? For me it is 20 minutes of focused practice, no more. Some days that feels like nothing. Other days it turns into an hour. But the rule is: show up for 20 minutes first. The system works because it lowers the barrier to zero. Once I am in motion, continuation is easier than stopping.',
        chinese: '我找到的最小可重复单元是 20 分钟。重点是先到场，而不是先计划好要学多久。',
      },
      {
        heading: 'Tracking without pressure',
        body: 'I keep a simple log: date, what I did, one sentence about how it felt. No streaks, no scores, no punishment for missed days. The log is not a judge — it is a mirror. Over weeks, I can see which methods worked and which did not. The system is not about perfection. It is about making learning something that survives a bad day.',
        chinese: '记录不是为了打分，而是为了看见。一周后回头看，比当天凭感觉判断要准确得多。',
      },
    ],
  },
  {
    id: 'english-as-second-world',
    category: 'learning',
    title: 'English as a second world',
    chineseTitle: '英语像第二个世界',
    dateLabel: 'July 2026',
    readingTime: '3 min',
    status: 'published',
    excerpt:
      'English is not only a subject for exams. It changes how I explain things, ask questions, and understand people.',
    chineseNote:
      '英语不只是考试科目，它也在改变我解释世界和理解他人的方式。',
    tags: ['English', 'Language', 'Communication'],
    sections: [
      {
        heading: 'A different window',
        body: 'When I learn a concept in Chinese, I understand it. When I learn the same concept in English, I understand it differently. The vocabulary shapes which details I notice. English forces me to be more direct, more structured. Chinese allows more context and subtlety. Having both feels like seeing the same landscape through two windows placed at different angles.',
        chinese: '中文和英文不只是语言不同，它们让你注意到的细节也不同。同时拥有两种视角，就像在同一个风景前开了两扇不同角度的窗。',
      },
      {
        heading: 'Input over output',
        body: 'I focus on input: reading articles, watching talks, listening to podcasts. Output pressure creates anxiety. Input builds a natural sense for what sounds right. I do not force myself to speak perfectly. I let the language settle first. After enough exposure, the right words come more easily. This approach is slower at first, but it does not burn me out.',
        chinese: '先大量输入，不急着输出。等语感自然形成后，说和写会变得顺畅很多。',
      },
      {
        heading: 'English as a tool, not a test',
        body: 'The biggest shift was seeing English as a tool for access, not a subject to pass. I can read documentation, follow global conversations, and understand perspectives that are not translated. That changes why I learn. It is no longer about scores. It is about being able to reach ideas that would otherwise stay on the other side of a language wall.',
        chinese: '英语不是考试，是钥匙。它能打开那些没有被翻译过来的世界。',
      },
    ],
  },
  {
    id: 'coding-to-think',
    category: 'learning',
    title: 'Code as a way to think',
    chineseTitle: '用代码思考',
    dateLabel: 'July 2026',
    readingTime: '3 min',
    status: 'published',
    excerpt:
      'Programming feels less like typing commands and more like learning how to describe a problem clearly.',
    chineseNote:
      '写代码不只是输入命令，更像是在学习如何把问题描述清楚。',
    tags: ['Code', 'Thinking', 'Frontend'],
    sections: [
      {
        heading: 'Clarity is the real skill',
        body: 'When I write code, the hardest part is never the syntax. It is figuring out what I actually want the program to do. The code is just a description of that understanding. If my description is messy, the program will be messy. Programming teaches me to break vague ideas into precise steps. That skill — breaking things down — carries into how I plan my day and how I communicate.',
        chinese: '写代码最难的不是语法，是想清楚到底要做什么。代码只是把想清楚的东西写下来。',
      },
      {
        heading: 'Debugging as thinking',
        body: 'Debugging is not fixing — it is investigating. I used to get frustrated when something did not work. Now I treat it as a puzzle: what does the program actually believe? The error message is a clue, not a failure. This mindset has changed how I approach problems outside code. When something goes wrong, I ask: what is the system actually doing, and where does it differ from what I assumed?',
        chinese: '调试不是修东西，是侦探工作。错误信息是线索，不是失败。这种思路在生活里也一样有用。',
      },
      {
        heading: 'Small projects, real learning',
        body: 'I learn fastest when I build something small but real. A component, a page, a tiny tool. Tutorials give the illusion of understanding. A real project reveals what I do not know. Each project is a loop: try, break, fix, learn. The cycle is uncomfortable but effective. The goal is not to write perfect code — it is to keep the loop turning.',
        chinese: '小项目是最有效的学习方式。教程给的是幻觉，真做一个才知道哪里不会。',
      },
    ],
  },

  // ── Thoughts ─────────────────────────────────────
  {
    id: 'curiosity-is-method',
    category: 'thoughts',
    title: 'Curiosity is not a mood',
    chineseTitle: '好奇心不是情绪',
    dateLabel: 'July 2026',
    readingTime: '2 min',
    status: 'published',
    excerpt:
      'Curiosity becomes useful when it turns into a method: noticing, asking, testing, and recording.',
    chineseNote:
      '好奇心真正有用的时候，是它变成观察、提问、测试和记录的方法。',
    tags: ['Curiosity', 'Method', 'Self'],
    sections: [
      {
        heading: 'From feeling to practice',
        body: 'I used to wait for curiosity to strike like a wave. When it came, I would read everything about a topic for a week. Then it passed, and I moved on. That is not a method — it is entertainment. Real curiosity is a practice. It means writing down a question even when you are tired. It means following a thread for ten minutes, not ten hours, but doing it consistently.',
        chinese: '等好奇心来了再行动，那是在消费兴趣。真正的好奇心是即使不在状态，也愿意花十分钟去追问一个问题。',
      },
      {
        heading: 'The notebook habit',
        body: 'I keep a small note file for questions that come up during the day. Most of them I will never answer. But the act of writing them down trains my attention. Over time, patterns appear. The questions I ask repeatedly point to what I actually care about. That is more useful than any single answer.',
        chinese: '随手记下问题，大多数不会去回答。但记下来的过程本身就在训练注意力。',
      },
    ],
  },
  {
    id: 'small-projects-matter',
    category: 'thoughts',
    title: 'Why small projects matter',
    chineseTitle: '为什么小项目也重要',
    dateLabel: 'July 2026',
    readingTime: '2 min',
    status: 'published',
    excerpt:
      'A small project is still a real project. It gives an idea a shape, a place, and a chance to improve.',
    chineseNote:
      '小项目也是项目。它让想法有了形状，也有了可以被修改的地方。',
    tags: ['Making', 'Projects', 'Practice'],
    sections: [
      {
        heading: 'Ideas need containers',
        body: 'An idea in your head feels complete. As soon as you try to build it, you discover the gaps. A small project is a container. It holds the idea long enough for you to examine it, test it, and find what is missing. Without a container, the idea dissolves. It does not matter if the project is a single webpage, a short script, or a notebook page. The container is what makes it real.',
        chinese: '想法在脑子里是完整的，一做就会发现漏洞。小项目就是装想法的容器。',
      },
      {
        heading: 'Finished beats perfect',
        body: 'I have learned that finishing a small thing teaches more than perfecting a large thing that never ships. Each finished project is a data point. It tells me what I can actually do, what I enjoy, and what I want to try next. The size does not determine the value. The completion does.',
        chinese: '做完一个小的，比没做完一个大的，能学到更多。完成本身就是价值。',
      },
    ],
  },
  {
    id: 'archive-as-memory-device',
    category: 'thoughts',
    title: 'A website as a memory device',
    chineseTitle: '网站作为记忆装置',
    dateLabel: 'July 2026',
    readingTime: '3 min',
    status: 'published',
    excerpt:
      'I do not want this site to be only a portfolio. I want it to keep traces of what I was thinking at different stages.',
    chineseNote:
      '我不想让这个网站只是作品集，它也应该留下不同阶段的思考痕迹。',
    tags: ['Website', 'Memory', 'Journal'],
    sections: [
      {
        heading: 'The problem with portfolios',
        body: 'A portfolio shows only the finished results. It hides the process, the doubts, the dead ends. When I look back at my own work, I am more interested in what I was trying to do than what I achieved. A portfolio is a highlight reel. A memory device is something else — it keeps the context around the work. That is what I want this site to become.',
        chinese: '作品集只展示结果，隐藏了过程和犹豫。我回头看自己的东西时，更想知道当时在想什么。',
      },
      {
        heading: 'Traces over polish',
        body: 'This site has rough edges. Some pages are incomplete. Some notes are drafts. That is intentional. A polished surface tells the viewer nothing about how it was made. Traces of thinking — unfinished sentences, abandoned experiments, half-built features — those are honest records. They show not what I can do, but what I am trying to do.',
        chinese: '粗糙的地方不是缺陷。未完成的句子和实验中的想法，反而比抛光后的表面更诚实。',
      },
    ],
  },

  // ── Journal ──────────────────────────────────────
  {
    id: 'building-digital-self',
    category: 'journal',
    title: 'Building a digital self',
    chineseTitle: '构建一个数字化的自己',
    dateLabel: 'July 2026',
    readingTime: '3 min',
    status: 'published',
    excerpt:
      'This site is a small attempt to connect learning, making, images, and reflection into one personal system.',
    chineseNote:
      '这个网站是一种尝试：把学习、创作、图像和反思连接成一个个人系统。',
    tags: ['Digital Journal', 'Identity', 'Growth'],
    sections: [
      {
        heading: 'Why build a digital self',
        body: 'Social media shows fragments of a person — a post here, a photo there. They are disconnected. I wanted a space where the different parts of me could coexist: what I learn, what I make, what I think, what I see. Not for an audience, but for myself. A digital self is not a profile. It is a construction. It takes time, and it changes as I change.',
        chinese: '社交媒体展示的是碎片化的自己。我想做一个能把不同面放在一起的空间，不是为了给别人看，是为了给自己。',
      },
      {
        heading: 'Connecting the pieces',
        body: 'The archive structure reflects how I think. Images are memories. Notes are thoughts. Projects are experiments. They are not separate — they influence each other. A note might come from an image I saw. A project might grow out of a thought I wrote down. By keeping them in one place, connections become visible that would otherwise be lost.',
        chinese: '归档的结构就是我的思考方式。图片、笔记、项目之间是互相影响的，放在一起才能看到联系。',
      },
      {
        heading: 'A living system',
        body: 'This site is not finished. It will never be finished. That is the point. A digital self is not a static page — it is a living system that grows and changes. I add things when they feel right. I remove things when they no longer fit. The goal is not completion. It is coherence.',
        chinese: '这个网站永远不会完成。它是一套活着的系统，随着我的变化而变化。完成不是目标，一致性才是。',
      },
    ],
  },
  {
    id: 'visual-archive-begins',
    category: 'journal',
    title: 'The visual archive begins',
    chineseTitle: '视觉档案开始形成',
    dateLabel: 'July 2026',
    readingTime: '2 min',
    status: 'published',
    excerpt:
      'Images are not just decorations here. They are fragments of places, moods, and the way I remember a period of life.',
    chineseNote:
      '这里的图片不只是装饰，它们是地点、情绪和某个阶段记忆的碎片。',
    tags: ['Archive', 'Images', 'Memory'],
    sections: [
      {
        heading: 'Why images matter',
        body: 'Text records what I think. Images record what I see. They capture a different kind of memory — the light in a room, the color of the sky, the way something felt before I had words for it. I started collecting images not as a designer collecting references, but as a person collecting moments. The visual archive is the result of that instinct.',
        chinese: '文字记录思考，图像记录看见。它们捕捉的是还来不及用语言描述的感觉。',
      },
      {
        heading: 'Categories as containers',
        body: 'I group images loosely: places, moods, textures, moments. The categories are not strict. Some images fit in multiple places. That is fine. The goal is not taxonomy — it is retrieval. I want to be able to find a feeling again. A picture of a rainy street from last year. A snapshot of light through a window. These are not art. They are evidence of being present.',
        chinese: '分类不是严格的学术体系，而是为了以后能找到某个感觉。一张雨天的街景、一束穿过窗户的光——它们是曾经在场的证据。',
      },
    ],
  },
  {
    id: 'notes-vault-purpose',
    category: 'journal',
    title: 'What the Notes Vault is for',
    chineseTitle: 'Notes Vault 的用途',
    dateLabel: 'July 2026',
    readingTime: '2 min',
    status: 'published',
    excerpt:
      'The Notes Vault is where unfinished thoughts can stay visible long enough to become clearer.',
    chineseNote:
      'Notes Vault 是一个让未完成的想法先被保存下来、再慢慢变清楚的地方。',
    tags: ['Notes', 'Writing', 'Reflection'],
    sections: [
      {
        heading: 'A space for unfinished things',
        body: 'Most thoughts are not ready to be published. They are half-formed, tentative, still finding their shape. In a traditional blog, those thoughts never see the light. The Notes Vault is a different kind of space. It holds drafts and fragments without pressure. A note does not need to be complete to be worth keeping. It just needs to be honest.',
        chinese: '大多数想法还没成型。传统博客里它们永远不会被看到。Notes Vault 是一个允许不完整存在的地方。',
      },
      {
        heading: 'Visible long enough',
        body: 'The key insight is visibility. A thought that is written down and left open will slowly become clearer. Revisiting is the mechanism. I do not force myself to finish a note. I leave it, read it again weeks later, and add a sentence or two. Over time, the shape emerges. The vault is not a publishing pipeline. It is a slow workshop.',
        chinese: '关键在于可见性。写下来放着，隔几周再看一眼，慢慢就会变清楚。Notes Vault 不是发布管道，是一个慢工坊。',
      },
    ],
  },
]

export function getNoteById(id: string): NoteDocument | undefined {
  return notes.find((n) => n.id === id)
}

export function getNotesByCategory(category: NoteCategory): NoteDocument[] {
  return notes.filter((n) => n.category === category)
}

export function getFeaturedNotes(count = 6): NoteDocument[] {
  return notes.filter((n) => n.status === 'published').slice(0, count)
}

export const categoryInfo: Record<
  NoteCategory,
  { label: string; description: string; chineseDescription: string }
> = {
  learning: {
    label: 'Learning',
    description: 'Language study, creative coding, design patterns — what I learn and how I learn it.',
    chineseDescription: '学习方法、编程、英语、系统化学习笔记',
  },
  thoughts: {
    label: 'Thoughts',
    description: 'Longer reflections on identity, growth, curiosity, and the things I keep thinking about.',
    chineseDescription: '反思、自我表达、成长、观察',
  },
  journal: {
    label: 'Journal',
    description: 'Personal entries, drafts, and observations — a quiet space for things worth writing down.',
    chineseDescription: '阶段记录、网站搭建、长期成长日志',
  },
}
