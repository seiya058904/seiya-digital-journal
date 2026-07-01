# Seiya Digital Journal — 项目交接报告

**日期:** 2026-07-01
**项目路径:** `D:\xia zai\AI project\7.1 React`
**当前分支:** `codex/integrate-profilecard-repeat-reveal`
**用途:** 给接手人完整了解项目状态、内容策略、待办事项

---

## 1. 项目定位

这不是一个开发者作品集（portfolio），也不是一个 SaaS 落地页或简历。

它是一个 **个人数字成长杂志（Digital Journal）**，风格为：

- 深色 editorial（Dark Editorial Magazine）
- 电影感 / 动效克制 / Apple-like
- 围绕学习、成长、技术、语言、创作、旅行
- 品牌是 **"Seiya"**，不是真实姓名

网站已部署在 GitHub Pages：
`https://seiya058904.github.io/seiya-digital-journal/`

---

## 2. 当前技术架构

### 2.1 技术栈

| 层 | 选型 |
|---|---|
| 框架 | React 19 + TypeScript |
| 构建 | Vite 8（base: `/seiya-digital-journal/`） |
| 动效 | Framer Motion（主）、GSAP（部分 React Bits 效果）、Three.js（GridScan） |
| 路由 | Hash-based（`#/motion-lab`），无路由库 |
| 图标 | lucide-react |
| 样式 | 全局 CSS（`src/styles/global.css`）+ tokens（`tokens.css`） |
| 测试 | Node 内置 test runner + `--experimental-strip-types` |
| 部署 | GitHub Actions → GitHub Pages |

### 2.2 目录结构

```
src/
├── components/
│   ├── sections/    — Hero, About, Interests, Gallery, Thoughts, Journey, Contact
│   ├── ui/          — Header, Chapter, ActionLink
│   ├── motion/      — ScrollReveal, TextReveal
│   ├── effects/     — react-bits/（~19 个移植效果）, text/, lab/
│   └── lab/         — EffectCard, HeavyEffectGate, ReactBitsDemo
├── pages/           — HomePage, MotionLabPage
├── data/            — profile.ts, gallery.ts, thoughts.ts, links.ts, effects.ts
├── styles/          — tokens.css, global.css
└── assets/          — profile-placeholder.svg（待替换）

public/
├── gallery/         — 6 张抽象 WebP 图（aurora/horizon/motion/reflection/geometry/future）
├── favicon.svg      — 默认 Vite favicon（待自定义）
└── og-image.png     — OG 分享图（已接入）

report/              — 审计报告、完成报告

picture/             — 生活照（73 张原始照片，~632MB，未压缩）
art picture/         — 视觉图（44 张 JPEG，~5.4MB，已中度压缩）
React bits/          — 19 个 React Bits 源码 TXT（只读参考）
```

---

## 3. 已完成的工作

### 3.1 第一轮 P0 内容填充（report/p0-content-fill-2026-07-01.md）

| 文件 | 变更 |
|---|---|
| `src/data/profile.ts` | Hero / About / Interests / Journey 全部替换为个人化文案 |
| `src/data/thoughts.ts` | Featured quote + 3 篇短文全部替换 |
| `src/data/links.ts` | GitHub / Work / Email 填入真实链接 |
| `index.html` | SEO: title / description / og / twitter 标签全部写入 |
| `ReactBitsDemo.tsx:35` | `night-study.webp` → `motion.webp`（修复 404） |

### 3.2 第二轮 P0 内容填充（report/p0-content-fill-round2-2026-07-01.md）

| 文件 | 变更 |
|---|---|
| `src/data/links.ts` | Email: `mailto:sunmengsaiyi@gmail.com`；Work: `https://github.com/seiya058904` |
| `public/og-image.png` | OG 分享图已接入（PNG 格式 1.83MB） |

### 3.3 视觉素材编排审计（report/visual-asset-layout-audit-2026-07-01.md）

- 扫描了全部 4 个图片来源（113 张图）
- 发现 art picture 是核心视觉来源（44 张仅 5.4MB）
- 发现 picture 需严格筛选（73 张 632MB，仅取 3-6 张）
- 提出 Gallery → Visual Archive 升级方案
- 提出新增 Learning Section
- 发现现有 gallery 图 shape 标注错误（6 张全是横图，3 张标错）

### 3.4 素材编号与索引（report/asset-selection-index-2026-07-01.md）

- 生成 3 张 contact sheet 缩略图总览
- 44 张 art picture 编号 #1–#44
- 70 张 picture 编号 #1–#70
- 标注了 HEIC / 超大文件 / 重复文件 / 不推荐文件

---

## 4. 关键决策（未实施）

### 4.1 内容策展方向（2026-07-01 确立）

> 网站已过"做功能"阶段，进入**内容策展（Content Curation）**阶段。

**核心原则：**
- Gallery → Visual Archive（三个分类：Editorial / Memory / Making）
- 全站不使用真人头像，Hero/About/Journey 都不放真人照片
- 生活照应作为"故事证据"而非"内容主体"
- 品牌是"Seiya"，不是真实姓名

### 4.2 图片精选结果

| 分类 | 来源 | 数量 | 命名规范 |
|---|---|---|---|
| Editorial | art picture/ 精选 | 19 张 | `editorial-001.webp` ~ `editorial-019.webp` |
| Memory - 重庆 | picture/ | 17 张 | `cq-001.webp` ~ `cq-017.webp` |
| Memory - 成都 | picture/ | 3 张 | `cd-001.webp` ~ `cd-003.webp` |
| Memory - 武汉 | picture/ | 4 张 | `wh-001.webp` ~ `wh-004.webp` |

**精选编号对照（对应 contact-sheet）：**

**Editorial（art picture）：** #1 #2 #3 #6 #7 #9 #11 #13 #15 #16 #17 #18 #23 #26 #28 #32 #35 #41 #42

**重庆（picture Part 1）：** #9 #12 #13 #17 #18 #22 #23 #24 #28 #33 #34 #41 #44 #47 #49 #51 #52

**成都（picture Part 2）：** #60 #61 #62

**武汉（picture Part 2）：** #67 #68 #69 #70

### 4.3 元数据字段设计（未实施）

建议在 `src/data/` 下新建 `visual-archive.ts`，定义类型：

```typescript
{
  id: string                // 如 "editorial-001" / "cq-009"
  title: string             // 英文标题
  subtitle?: string         // 副标题或一句话
  category: 'editorial' | 'memory' | 'making'
  city?: string             // 城市（生活照专有）
  year: number              // 拍摄年份
  tags: string[]            // 标签
  aspect: 'landscape' | 'portrait' | 'square'
  featured: boolean         // 是否首页大卡展示
  image: string             // 图片路径
  alt: string               // alt 文本
  emotion?: string          // 情绪标签：Quiet/Night/Rain/Reflection...
}
```

### 4.4 长期站点结构

```
Home
├── About
├── Visual Archive
│   ├── Editorial（art picture 抽象视觉）
│   ├── Photography（生活照，有标题有故事）
│   └── Projects（项目截图 + 说明）
├── Journal（专栏系统）
│   ├── Learning（英语/PTE/编程/加拿大）
│   ├── Technology（计算机/AI/React）
│   ├── Travel（📍城市 + 照片集 + 一句话描述）
│   └── Thoughts（短句流，不是博客）
├── Motion Lab（已有）
├── Now（当前状态页）
├── Contact
└── Links
```

### 4.5 Travel 城市描述（每城市 1-2 句）

- **Chongqing:** "A city that never seems to stop climbing."
- **Chengdu:** "Slower than I expected."
- **Wuhan:** "The city where old memories met new perspectives."

### 4.6 HEIC Live Photo

picture/ 中有约 19 张 HEIC 格式文件（含 Live Photo 动图）。浏览器不支持直接使用，建议 Phase 3 转为 MOV/MP4 后实现微动效果（类似 Apple 官网鼠标移过轻动）。

---

## 5. 待办事项清单

### P0 — 必须先处理

| # | 任务 | 说明 |
|---|---|---|
| 1 | 头像转 WebP 接入 Hero | 1122×1402 PNG 已备好，放 `src/assets/`，改 `Hero.tsx` import + alt |
| 2 | OG 图转 WebP | 当前 1.83MB PNG，建议压缩至 <200KB |
| 3 | 自定义 favicon | 当前是 Vite 默认 SVG，建议替换为 Seiya 标志 |

### P1 — 元数据建立

| # | 任务 | 说明 |
|---|---|---|
| 4 | 在 `src/data/` 下创建 `visual-archive.ts` | 定义类型 + 填写全部 43 张图元数据 |
| 5 | 修正 `gallery.ts` 中 6 张图的 shape 字段 | 当前 3 张标注不准确 |
| 6 | Gallery → Visual Archive 升级 | 改组件名、分类渲染 |
| 7 | 新增 Learning Section | 文字内容 + 配图 |
| 8 | Thoughts 短句化 | 从 3 篇短文改为短句流 |

### P2 — 图片接入与压缩

| # | 任务 | 说明 |
|---|---|---|
| 9 | 19 张 Editorial 图转 WebP | 放入 `public/gallery/` |
| 10 | 24 张生活照筛选 + 转 WebP | 先选首批 8-12 张，压缩至 ~250KB 每张 |
| 11 | Travel Section | 城市 + 照片集 + 一句话描述 |

### P3 — 长期增强

| # | 任务 | 说明 |
|---|---|---|
| 12 | /Now 页面 | Derek Sivers 风格的当前状态页 |
| 13 | Journal 专栏系统 | Learning / Technology / Travel / Thoughts 独立页面 |
| 14 | HEIC Live Photo 动图 | 转为 MOV/MP4，实现微动效果 |
| 15 | 情绪 Filter（emotion） | 按 Night/Rain/Reflection 等标签筛选图片 |

---

## 6. 现有图片状况

| 目录 | 数量 | 总大小 | 状态 |
|---|---|---|---|
| `public/gallery/` | 6 张 WebP | 269 KB | ✅ 已压缩可在网页使用 |
| `public/` | favicon.svg + og-image.png | ~1.83 MB | ⚠️ OG 需转 WebP |
| `src/assets/` | profile-placeholder.svg | 1.6 KB | ❌ 待替换为头像 |
| `art picture/` | 44 张 JPEG | ~5.4 MB | ✅ 压缩好，待选 19 张转 WebP |
| `picture/` | 70 张 JPG+HEIC | ~632 MB | ❌ 需筛选 + 压缩 |
| 头像（未入库） | 1 张 PNG | 1.88 MB | ❌ 待转 WebP 接入 |

---

## 7. 链接与 SEO 状态

### 社交链接（`src/data/links.ts`）

| 类型 | URL | 状态 |
|---|---|---|
| Email | `mailto:sunmengsaiyi@gmail.com` | ✅ 已填 |
| GitHub | `https://github.com/seiya058904` | ✅ 已填 |
| Work | `https://github.com/seiya058904` | ✅ 已填 |

### SEO（`index.html`）

| 标签 | 状态 |
|---|---|
| `<title>` | ✅ Seiya — Digital Growth Journal \| Code, Language & Creative Learning |
| `<meta name="description">` | ✅ 已填 |
| `<meta property="og:title">` | ✅ 已填 |
| `<meta property="og:description">` | ✅ 已填 |
| `<meta property="og:image">` | ✅ 指向 `/seiya-digital-journal/og-image.png` |
| `<meta property="og:type">` | ✅ website |
| `<meta name="twitter:card">` | ✅ summary_large_image |
| `<meta name="twitter:title">` | ✅ 已填 |
| `<meta name="twitter:description">` | ✅ 已填 |
| `<meta name="twitter:image">` | ✅ 同 og:image |
| `<meta name="theme-color">` | ✅ `#030713` |
| Manifest | ❌ 缺失 |
| Apple touch icon | ❌ 缺失 |

---

## 8. 已知问题

1. **night-study.webp 缺失** — 已在 `ReactBitsDemo.tsx:35` 改为 `motion.webp`，已修复
2. **Gallery shape 标注错误** — aurora/reflection/geometry 的 shape 与图片实际比例不匹配，待修正
3. **picture/ 大量超大文件** — 约 35 张 > 10MB，必须压缩才能使用
4. **HEIC 格式不兼容** — ~19 张无法在 Web 中直接使用
5. **重复文件** — `1782882228248.jpg` 与 `1782882228248 (2).jpg` 完全一致
6. **GitHub Pages base 路径** — 所有图片路径需用 `import.meta.env.BASE_URL` 前缀

---

## 9. 联系信息

- 项目作者 GitHub: `seiya058904`
- 邮箱: `sunmengsaiyi@gmail.com`
- GitHub 仓库: `https://github.com/seiya058904/seiya-digital-journal`
- 部署地址: `https://seiya058904.github.io/seiya-digital-journal/`

---

## 10. 报告文件索引

`report/` 目录下所有文件：

| 文件 | 内容 |
|---|---|
| `content-fill-audit-2026-07-01.md` | 第一轮内容填充审计 |
| `p0-content-fill-2026-07-01.md` | 第一轮 P0 填充完成报告 |
| `p0-content-fill-round2-2026-07-01.md` | 第二轮 P0 填充完成报告 |
| `visual-asset-layout-audit-2026-07-01.md` | 视觉素材编排审计 |
| `asset-selection-index-2026-07-01.md` | 素材编号索引（含 contact sheet） |
| `contact-sheet-art-picture.jpg` | art picture 缩略图总览（44 张） |
| `contact-sheet-picture-01.jpg` | picture 缩略图 Part 1（#1–#35） |
| `contact-sheet-picture-02.jpg` | picture 缩略图 Part 2（#36–#70） |
| `generate-contact-sheets.py` | 缩略图生成脚本 |
| **本文档** | 项目交接报告 |

---

*本报告由 Claude Code 于 2026-07-01 生成，基于与 Seiya 的多轮内容策展对话整理。*
