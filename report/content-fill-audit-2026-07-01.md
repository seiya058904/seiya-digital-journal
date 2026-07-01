# Content Fill Audit / 内容填充审计

**日期:** 2026-07-01
**项目:** seiya-digital-journal
**目标:** 找出所有可填充的文字、图片、视频、链接、SEO 位置

---

## 1. 总结

这个网站骨架完整、动效精致，但目前内容以 **占位 / 通用文案** 为主。**最迫切需要填的三个方向：**

1. **个人化文本** — Hero 标题 / About / Thoughts / Journey 目前都是通用文案，读者无法知道"这个人是谁、有什么经历、为什么做这个站"。需要把 `src/data/` 下所有内容替换成你的真实身份和故事。
2. **社交链接** — Email、GitHub、Work 全部是 `#` 占位，点过去会滚动到页面顶部，容易误导用户。
3. **SEO / 分享** — 没有 Open Graph / Twitter Card 标签，分享到社交平台会显示空白摘要；缺少 manifest.json（无法安装 PWA）。

次要但不紧急的缺口：Hero 头像目前是抽象 SVG 占位；Gallery 6 张图已有但可以用个人作品替换；Motion Lab 文案目前是通用 Demo 文字。

---

## 2. P0 — 必填清单

*不填会显得网站不完整，或影响用户理解。*

| # | 位置 | 类型 | 文件 | 当前状态 | 建议内容 | 优先级原因 |
|---|---|---|---|---|---|---|
| 1 | Hero 头像 | 图片 | `src/components/sections/Hero.tsx:91` | 用 `profile-placeholder.svg`（渐变抽象占位） | 替换成你的真实头像（4:5 比例，WebP，居中构图） | 访客第一眼看到的"人"是抽象图形，没有信任感 |
| 2 | Email 链接 | 链接 | `src/data/links.ts:22` | `href: '#'`, `placeholder: true` | 填真实邮箱如 `mailto:your@email.com` | 点联系人 Section 的 Email 按钮会"无效点击" |
| 3 | GitHub 链接 | 链接 | `src/data/links.ts:23` | `href: '#'`, `placeholder: true` | 填真实 GitHub URL | 同上；而且 README 也提到了 GitHub 链接 |
| 4 | Work 链接 | 链接 | `src/data/links.ts:24` | `href: '#'`, `placeholder: true` | 填你的作品集 / 个人站 URL | 同上 |
| 5 | `night-study.webp` 引用 | 图片（缺失） | `src/components/lab/ReactBitsDemo.tsx:35` | 引用了 `night-study.webp` 但 `public/gallery/` 下不存在该文件 | 补一张同名 WebP，或把第35行改成现有图片之一（如 `future.webp`） | 控制台会 404，BounceCards / ImageTrail Demo 中断 |
| 6 | Open Graph 分享标签 | SEO | `index.html` | 完全缺失 | 添加 `og:title`, `og:description`, `og:image`, `twitter:card`（见第10节） | 分享到微信/Twitter/Discord 时显示空白卡片 |
| 7 | Hero 标题文案 | 文字 | `src/data/profile.ts:7-11` | `"Designing with code."` / `"Growing with curiosity."` 偏通用 | 替换为更个人化的标题，反映你的身份（见第6节） | 标题是网站第一印象，目前像通用模板 |

---

## 3. P1 — 强烈建议清单

*不填也能运行，但填了明显提升质量。*

| # | 位置 | 类型 | 文件 | 当前状态 | 建议内容 |
|---|---|---|---|---|---|
| 8 | Hero subtitle | 文字 | `profile.ts:12-13` | `"A personal digital journal about technology, memory, and becoming."` | 更个人化的副标题 |
| 9 | About intro 文案 | 文字 | `profile.ts:17-18` | `"I am learning to connect technology with the way I see the world..."` | 替换为真实的自我介绍（你的背景、动机、方向） |
| 10 | About statement | 文字 | `profile.ts:19` | `"I build my digital world to understand myself."` | 替换为更有力的个人宣言 |
| 11 | Thoughts featured quote | 文字 | `thoughts.ts:7` | `"Curiosity drives everything."` | 替换为你真正有感触的一句话 |
| 12 | Thoughts entries (3篇) | 文字 | `thoughts.ts:12-26` | 每篇只有 1 句话，非常通用（如 "Questions make ordinary days feel larger."） | 写 2-3 段真实的短文（每篇 50-150 字左右，中文或双语） |
| 13 | Gallery 标题 / 描述 | 文字 | `gallery.ts:8-47` | 抽象诗意文案（如 "A light that keeps moving"） | 如果是个人作品，改为作品命名；如果保留纯艺术，至少让文案指向个人意义 |
| 14 | Interests 内容 | 文字 | `profile.ts:24-44` | 4 个兴趣领域（Technology/Language/Making/Exploration）描述很通用 | 增加具体细节：你在学什么技术、英语到什么水平、做什么类型的创作 |
| 15 | Journey 内容 | 文字 | `profile.ts:46-59` | 3 个阶段（Now/Growing/Next）描述非常简短 | 写具体里程碑：在哪学习、什么项目、留学目标等 |
| 16 | SEO title | SEO | `index.html:8` | `"Seiya — Digital Identity & Personal Growth"` | 加关键词，如 `"Seiya — 数字身份与个人成长杂志 | 代码、设计与思考"` |
| 17 | SEO meta description | SEO | `index.html:7` | 英文已存在 | 增加中文版本；优化关键词覆盖 |
| 18 | favicon 自定义 | 图片 | `public/favicon.svg` | 当前是 Vite 默认 SVG（769 字节的通用图标） | 替换为你的个人标志/缩写（SVG 或 PNG 多尺寸） |
| 19 | 中文翻译一致性 | 文字 | `profile.ts` 多个字段 | 中文写得很美，但有些字段有空缺（如 `interests[n].chinese` 目前用于标签） | 确认所有 section 的中文版本都准确 |
| 20 | Gallery 图片 alt 文本 | 图片 | `src/components/sections/GalleryCard.tsx:27` | `alt={`${item.theme}: abstract editorial artwork for Seiya's visual journal`}` | 如果换成个人作品，alt 要改为真实描述 |

---

## 4. P2 — 可选增强清单

*适合以后慢慢补。*

| # | 位置 | 类型 | 文件 | 当前状态 | 建议内容 |
|---|---|---|---|---|---|
| 21 | Motion Lab Demo 文案 | 文字 | `ReactBitsDemo.tsx` 各 case | 通用 Demo 文字（如 "Move across the light."） | 改为与你的 journal 主题相关（可选，不会影响用户对网站核心的理解） |
| 22 | Hero identityWords | 文字 | `Hero.tsx:10` | 硬编码 `['Learning', 'Creating', 'Remembering', 'Becoming']` | 可移到 data 文件统一管理，或改为 4 个更个人化的词 |
| 23 | Scroll cue aria-label | 文字 | `Hero.tsx:103` | `"Scroll to About"` | 不需要改，但可考虑更优雅如 "Continue reading" |
| 24 | Contact footer 文案 | 文字 | `Contact.tsx:42` | `"Crafted with motion, precision, and curiosity. / 用代码保存一点点热爱。"` | 保留但可定期更新 |
| 25 | Header 导航 aria-label | 文字 | `Header.tsx:47` | `"Primary navigation"` | 符合规范，不用改 |
| 26 | 更多 Gallery 条目 | 图片 | `gallery.ts` | 6 张 | 增加到 9-12 张视觉效果更丰富（但不急） |
| 27 | Hero chinese 文案 | 文字 | `profile.ts:14` | `"以代码记录成长，以设计表达自我。"` | 很好，保持 |
| 28 | 404 / 空状态文案 | 文字 | 全局 | 当前无 404 页面 | 如果以后加路由深度，可以加 |
| 29 | Manifest / PWA 支持 | SEO | `index.html` + `public/manifest.json` | 完全缺失 | 加 Web Manifest 后可安装为 PWA |
| 30 | Apple touch icon | 图片 | `index.html` | 完全缺失 | 180x180 PNG，Add to Home Screen 用 |
| 31 | 关于页配图 | 图片 | `About.tsx` | 纯文字 | 可以加一张有意义的配图（但不是必须） |
| 32 | Chapter 组件 `aria-hidden` | 无障碍 | `Chapter.tsx` | `aria-hidden="true"` 隐藏了章节号 | 确认该信息在别处对屏幕阅读器可见 |

---

## 5. P3 — 暂时不要填清单

*可能会增加维护成本、拖慢网站、或和当前设计方向不匹配。*

| # | 位置 | 类型 | 当前状态 | 不要填的原因 |
|---|---|---|---|---|
| 33 | Hero 背景视频 | 视频 | 无播放器 | 与杂志式暗色编辑风冲突；移动端带宽和性能成本高；动效已足够丰富 |
| 34 | 项目/作品演示视频 | 视频 | 无播放器 | 页面不是作品集，引入视频播放器会改变设计定位 |
| 35 | 完整博客文章页 | 文字 | 无博客路由 | 需要新页面、新路由、Markdown 处理；当前 Thoughts 微条目就是设计意图 |
| 36 | 评论区 / Disqus | 文字 | 无实现 | 增加维护成本、需要鉴权、与个人杂志定位不完全匹配 |
| 37 | 访客统计 / Analytics | 代码 | 无 | 增加隐私考虑；确定需要时再添加（建议 Plausible / Umami 轻量方案） |
| 38 | RSS Feed | 代码 | 无 | 等有固定内容更新后再加 |

---

## 6. 文字内容清单

### 6.1 数据文件中的可编辑文字（`src/data/`）

| 字段 | 文件 | 当前内容 | 建议字数 | 语言建议 | 必须？ |
|---|---|---|---|---|---|
| `profile.brand` | `profile.ts:5` | `Seiya` | 1-5 字 | 英文（品牌名） | P0 |
| `hero.title[0].text` + `.accent` | `profile.ts:8` | "Designing with " + "code." | 6-15 词 | 英文 / 双语 | P0 |
| `hero.title[1].text` + `.accent` | `profile.ts:9` | "Growing with " + "curiosity." | 6-15 词 | 英文 / 双语 | P0 |
| `hero.subtitle` | `profile.ts:12` | "A personal digital journal..." | 10-25 词 | 英文 + 中文 | P1 |
| `hero.chinese` | `profile.ts:14` | "以代码记录成长，以设计表达自我。" | 10-30 字 | 中文 | P1 |
| `about.intro` | `profile.ts:17` | "I am learning to connect..." | 30-80 词 | 英文 + 中文 | P1 |
| `about.statement` | `profile.ts:19` | "I build my digital world to understand myself." | 5-20 词 | 英文 | P1 |
| `about.chinese` | `profile.ts:20` | "慢慢认识世界，也慢慢成为自己。" | 10-30 字 | 中文 | P1 |
| `interests[n].title` (×4) | `profile.ts:25-42` | Technology / Language / Making / Exploration | 1-3 词 | 英文 | P1 |
| `interests[n].description` (×4) | `profile.ts:26-43` | 各 10-15 词 | 15-40 词 | 英文 + 中文 | P1 |
| `interests[n].chinese` (×4) | `profile.ts:27-44` | 计算机 / 英语 / 创作 / 留学 | 1-4 字 | 中文 | P1 |
| `journey[n].stage` (×3) | `profile.ts:47-57` | Now / Growing / Next | 1-5 词 | 英文 | P1 |
| `journey[n].title` (×3) | `profile.ts:48-58` | "Learning in public" / "Connecting the pieces" / "Stepping outward" | 5-15 词 | 英文 + 中文 | P1 |
| `journey[n].description` (×3) | `profile.ts:49-59` | 各 10-15 词 | 15-40 词 | 英文 + 中文 | P1 |
| `thoughts.featured.quote` | `thoughts.ts:7` | "Curiosity drives everything." | 5-20 词 | 英文 + 中文 | P1 |
| `thoughts.featured.body` | `thoughts.ts:8` | "I like systems, details..." | 15-50 词 | 英文 + 中文 | P1 |
| `thoughts.featured.chinese` | `thoughts.ts:9` | "慢慢学习，慢慢构建。" | 10-30 字 | 中文 | P1 |
| `thoughts.entries[n].title` (×3) | `thoughts.ts:13-23` | "The quiet power of curiosity" 等 | 5-15 词 | 英文 / 中文 | P1 |
| `thoughts.entries[n].date` (×3) | `thoughts.ts:14-24` | "A note for now" / "An open draft" / "Still learning" | 5-20 词 | 英文 | P1 |
| `thoughts.entries[n].excerpt` (×3) | `thoughts.ts:15-25` | 各 7-12 词 | 20-50 词 | 英文 + 中文 | P1 |
| `galleryItems[n].title` (×6) | `gallery.ts:10-46` | "A light that keeps moving" 等 | 3-10 词 | 英文 + 中文 | P2 |
| `galleryItems[n].caption` (×6) | `gallery.ts:11-47` | "Some changes arrive quietly..." 等 | 5-20 词 | 英文 + 中文 | P2 |
| `galleryItems[n].note` (×6) | `gallery.ts:12-48` | 微光 / 远方 / 流动 / 映照 / 秩序 / 未来 | 1-4 字 | 中文 | P2 |
| `socialLinks[n].label` (×3) | `links.ts:22-24` | "Email me" / "GitHub" / "Visit my work" | 2-6 词 | 英文 | P0 (与链接一起) |

### 6.2 组件中硬编码文字

| 位置 | 文件 | 当前内容 | 建议 | 必须？ |
|---|---|---|---|---|
| Hero 旋转词 | `Hero.tsx:10` | Learning, Creating, Remembering, Becoming | 改为你的 4 个身份词 | P2 |
| "View profile" 按钮 | `Hero.tsx:72` | "View profile" | 可改为 "About me" 等 | P2 |
| "Explore gallery" 按钮 | `Hero.tsx:74` | "Explore gallery" | 可改为 "Gallery" 等 | P2 |
| ProfileCard title | `Hero.tsx:94` | "Personal Journal" | 可改为更个人化的副标题 | P2 |
| "Scroll to About" aria-label | `Hero.tsx:103` | "Scroll to About" | 保持或改为 "Continue" | P3 |
| "Four signals I keep returning to." | `Interests.tsx:13` | 硬编码 | 移到 data 文件 | P2 |
| "Curiosity has more than one orbit." | `Interests.tsx:14` | 硬编码 | 移到 data 文件 | P2 |
| "No finished story. Just a direction." | `Journey.tsx:16` | 硬编码 | 移到 data 文件 | P2 |
| "Becoming, one chapter at a time." | `Journey.tsx:17` | 硬编码 | 移到 data 文件 | P2 |
| "This journal is still growing." | `Contact.tsx:20` | 硬编码 | 移到 data 文件 | P2 |
| "Let's connect." | `Contact.tsx:21` | 硬编码 | 移到 data 文件 | P2 |
| "Back to top" | `Contact.tsx:38` | 硬编码 | 保持 | P3 |
| Footer 文案 | `Contact.tsx:42` | "Crafted with motion, precision, and curiosity. / 用代码保存一点点热爱。" | 中文部分保持，英文部分可定制 | P2 |
| "A visual journal" | `Gallery.tsx:12` | 硬编码 | 移到 data 文件 | P2 |
| "Fragments of light, kept for later." | `Gallery.tsx:13` | 硬编码 | 移到 data 文件 | P2 |
| Motion Lab subtitle | `MotionLabPage.tsx:17` | "An experimental collection..." | 保持或定制 | P2 |
| Demo 文案（~10 处） | `ReactBitsDemo.tsx` | "Move across the light." 等 | 改为 journal 主题相关文字 | P2 |

**共计文字坑位：约 70+ 个（含 data 字段 + 硬编码）**

---

## 7. 图片内容清单

| 位置 | 文件 | 当前引用路径 | 推荐尺寸 | 推荐格式 | 需要 alt？ | 需要压缩？ | 存放位置 | 优先级 |
|---|---|---|---|---|---|---|---|---|
| Hero 头像 | `Hero.tsx:91` | `profile-placeholder.svg`（占位） | ~400×500px (4:5) | WebP（原 SVG 占位换成 WebP） | 是 | 是（<100KB） | `src/assets/` | P0 |
| Header Logo | `Header.tsx:37` | 同 `profile-placeholder.svg` | 与头像同文件或独立 32×32 | SVG | 已有 `logoAlt` | — | `src/assets/` | P2 |
| Gallery 封面 ×6 | `gallery.ts` | `/gallery/{name}.webp` | 视 shape:
portrait: 1122×1402
landscape: 1536×1024
square: 1254×1254 | WebP | 是（已有） | 已压缩（27-65KB） | `public/gallery/` | 已有图片，但可替换为个人作品（P2） |
| `night-study.webp` | `ReactBitsDemo.tsx:35` | **文件不存在！** | 无要求 | WebP | 是 | 是 | `public/gallery/` | **P0（补文件或改代码）** |
| favicon | `index.html` | `/favicon.svg` | SVG 任意；另备 32×32 + 180×180 | SVG + PNG | — | — | `public/` | P1（自定义 logo） |
| OG 分享图 | `index.html` | 不存在 | 1200×630px | PNG / WebP | — | 是（<300KB） | `public/`（或 `public/images/`） | P0 |
| Apple touch icon | `index.html` | 不存在 | 180×180 | PNG | — | 是（<50KB） | `public/` | P2 |

**共计图片坑位：8（现有）+ 2（缺失引用/新增）= 10**

**注意**：`night-study.webp` 被 `ReactBitsDemo.tsx:35` 引用但不存在。BounceCards、ImageTrail 等 demo 用到 `demoImages` 数组时会 404。

---

## 8. 视频内容清单

| 位置 | 建议？ | 原因 |
|---|---|---|
| Hero 背景视频 | ❌ 不建议 | 与暗色杂志风冲突；增加加载量；移动端性能差；当前动效已足够 |
| Motion Lab 演示录屏 | ⚠️ 可考虑（外链） | 如果以后效果过多，可以用 GIF/视频录屏代替实际渲染。推荐先用外链（YouTube/Bilibili），不本地存。格式 mp4 优先 |
| Gallery 项目展示 | ⚠️ 可考虑（外链） | 如果你有游戏/交互项目演示，可以在 Gallery 中放外链视频封面。当前设计没有播放器组件，加之前先确认设计方向 |
| Thoughts 文章配视频 | ❌ 不建议 | 文本区域不适合放视频，会破坏阅读节奏 |
| About 个人介绍视频 | ❌ 不建议 | 与杂志调性不符；个人介绍视频不适合这个设计 |

**总结：当前阶段不建议本地存任何视频文件。未来如果 Motion Lab 需要，用封面图 + YouTube/Bilibili 外链嵌入。**

---

## 9. 链接内容清单

| 链接 | 文件 | 当前值 | Placeholder？ | 会误导？ | 建议填什么 | 优先级 |
|---|---|---|---|---|---|---|
| Email | `links.ts:22` | `#` | ✅ `true` | ⚠️ 点击回到顶部 | 你真实的邮箱，如 `mailto:you@example.com` | **P0** |
| GitHub | `links.ts:23` | `#` | ✅ `true` | ⚠️ 同上 | `https://github.com/yourname` | **P0** |
| Work / Portfolio | `links.ts:24` | `#` | ✅ `true` | ⚠️ 同上 | 你的作品集或个人站 URL | **P0** |
| Nav: Home → Contact (7条) | `links.ts:11-19` | `#home` ~ `#contact` | ❌ 正常 | ❌ 锚点导航 | 保持，不需要改 | — |
| "View profile" | `Hero.tsx:72` | `#about` | ❌ 锚点 | ❌ 正确 | 保持或改为 CTA 文字 | — |
| "Explore gallery" | `Hero.tsx:74` | `#gallery` | ❌ 锚点 | ❌ 正确 | 保持 | — |

**Placeholder 链接处理建议：**
- 在 `links.ts` 中，把 `placeholder` 改为 `false` 并填入真实 URL
- 如果暂时只有邮箱可用，可以先只填邮箱，其他保持 `placeholder: true`
- 当链接是 placeholder 时，Contact 组件会设置 `aria-disabled={link.placeholder}`，外观上会有 disabled 样式。建议还可以在 hover 时加上 "Coming soon" tooltip（但目前没有 tooltip 机制，留待以后）

**共计链接坑位：3 个必须填 + 7 个锚点正常**

---

## 10. SEO / 分享信息清单

| 项目 | 当前状态 | 缺失？ | 建议内容 | 优先级 |
|---|---|---|---|---|
| `<title>` | ✅ 有 | — | `"Seiya — 数字身份与个人成长杂志 | 代码、设计与思考"`（中英双语） | P1 |
| `<meta name="description">` | ✅ 有（英文） | 缺中文 | 保留英文，**增加中文版本**（或替换成双语 description） | P1 |
| `<meta property="og:title">` | ❌ 缺失 | ✅ | 同 title，如 `"Seiya — 数字身份与个人成长"` | **P0** |
| `<meta property="og:description">` | ❌ 缺失 | ✅ | 1-2 句简介，中英双语 | **P0** |
| `<meta property="og:image">` | ❌ 缺失 | ✅ | 1200×630px 分享图，建议放 `public/og-image.webp` | **P0** |
| `<meta property="og:type">` | ❌ 缺失 | ✅ | `"website"` | P1 |
| `<meta name="twitter:card">` | ❌ 缺失 | ✅ | `"summary_large_image"` | P1 |
| `<meta name="twitter:title">` | ❌ 缺失 | ✅ | 同 og:title | P1 |
| `<meta name="twitter:description">` | ❌ 缺失 | ✅ | 同 og:description | P1 |
| `<meta name="twitter:image">` | ❌ 缺失 | ✅ | 同 og:image | P1 |
| `<link rel="icon">` | ✅ 有 | — | 当前 favicon.svg 是 Vite 默认，建议替换为个人标志 | P1 |
| `<link rel="manifest">` | ❌ 缺失 | ✅ | 加 `manifest.json`，定义名称、图标、主题色 | P2 |
| `<meta name="theme-color">` | ✅ 有 | — | `#030713`，与品牌色一致，保留 | — |
| `package.json` 字段 | 部分有 | `description` 缺失 | 加 `"description": "Seiya's digital identity and personal growth journal"` | P2 |
| README | ✅ 有 | 中详细说明 | 保持，但 deploy 部分可以更新（目前写的是未配置 GitHub repo 的状态） | P2 |

### 建议的英文简介（可用于 og:description / README / 社交简介）

> A dark editorial personal growth journal by Seiya — chronicling technology, language, creativity, and the process of becoming. Built with React, Framer Motion, and TypeScript.

### 建议标签（用于 GitHub About / README）

> `personal-journal` `digital-identity` `react` `typescript` `framer-motion` `personal-growth` `portfolio` `creative-coding`

---

## 11. 推荐填充顺序

按优先级 + 依赖关系排列：

1. **先修 bug** → 处理 `night-study.webp` 缺失（补文件或改引用）
2. **填链接** → Email、GitHub、Work 三个链接（最快速、影响最大）
3. **填个人身份** → Hero 头像 + Hero 标题/subtitle/中文 → About 全部 → Journey 全部
4. **填思想内容** → Thoughts featured quote + 3 篇短文（用心写，这是灵魂）
5. **填 SEO** → og:title / og:description / og:image + twitter cards
6. **填兴趣细节** → Interests 描述（加具体内容）
7. **优化视觉** → favicon 自定义
8. **填补展示** → Gallery 文案优化（如果图片保留的话）
9. **选填** → Motion Lab 文案、硬编码文字移到 data 文件、manifest.json

---

## 12. 给用户的下一步建议

1. **从 `src/data/` 文件开始填**，不用碰任何组件代码。所有核心文字都在 `profile.ts` / `thoughts.ts` / `gallery.ts` / `links.ts` 里。
2. **准备一张真实头像**：4:5 比例（约 400×500px），WebP 格式，居中构图，放到 `src/assets/` 并更新 `Hero.tsx` 的 import 和 alt 文本。
3. **准备一张 OG 分享图**：1200×630px，深色底 + 你的品牌字或标志，放到 `public/`。
4. **准备你自己的 favicon**：替换 `public/favicon.svg`。
5. **补上 `night-study.webp`**：放一张同名图片到 `public/gallery/`，或修改 `ReactBitsDemo.tsx` 第 35 行把 `night-study` 改为一个已有文件名。
6. **修改 `src/data/links.ts`**：替换三个 `#` 为真实 URL，将 `placeholder` 改为 `false`。
7. **写真实 Thoughts 短文**：这是网站最有温度的部分，花时间写 2-3 篇你真正想表达的。

所有改动都在 `src/data/` + `src/assets/` + `public/` + `index.html` 范围内，不动组件和动效。

---

## 附录：审计总结

| 类别 | 数量 |
|---|---|
| 文字坑位（data 文件字段） | ~55 个 |
| 文字坑位（组件硬编码） | ~18 个 |
| 图片坑位 | 10（含 1 个缺失引用 + 2 个新增） |
| 视频候选位 | 0（不建议本地放） |
| 链接坑位（placeholder） | 3 |
| 链接坑位（锚点正常） | 7 |
| SEO 缺失项 | ~12 个标签缺失 |
| **P0 必填项** | **7** |
| **P1 强烈建议** | **13** |
| **P2 可选增强** | **12** |
| **P3 暂时不填** | **6** |
