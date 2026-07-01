# 设计评审 + 动效审计报告

> 项目：Seiya 数字日志 / 成长杂志
> 日期：2026-07-01
> 范围：全站设计评审 + 深度动效审计
> 方法：双-agent（A: 设计评审+动效审计 / B: 检测器+代码审查）

---

## 设计健康评分

| # | 启发式 | 分数 | 关键问题 |
|---|--------|------|---------|
| 1 | 系统状态可见性 | 3/4 | 导航栏显示活动章节，滚动时区块高亮。但缺少滚动进度指示器。 |
| 2 | 系统与现实世界的匹配 | 3/4 | 杂志语言（"Chapter"）+ 双语配对。CTA 标签清晰。少量领域内行话。 |
| 3 | 用户控制与自由度 | 3/4 | 固定导航、返回顶部、哈希路由。移动端菜单有明确关闭按钮。 |
| 4 | 一致性与标准 | 3/4 | 视觉语言一致。Motion Lab 是不同布局风格（效果卡片展示区）。Gallery Card 已统一为全卡片 BorderGlow。 |
| 5 | 错误预防 | 2/4 | 联系链接有 `aria-disabled`。`src/data/links.ts` 中 `placeholder` 行为未验证。 |
| 6 | 识别而非回忆 | 4/4 | 章节名与导航标签完全一致，无需猜测。 |
| 7 | 灵活性与效率 | 2/4 | 无快捷键、无跳过导航、无章节间键盘导航。 |
| 8 | 美学与极简设计 | 4/4 | 强视觉身份。有质感的纹理（Aurora、颗粒）。有意图的留白。 |
| 9 | 错误恢复 | 2/4 | HeavyEffectGate 有重试按钮。无撤销操作。`#` 占位符链接无反馈。 |
| 10 | 帮助与文档 | 1/4 | 无帮助系统。ScrambledText 靠用户偶然发现。Motion Lab 概念对首次访客不明确。 |
| **总分** | | **27/40** | **可接受 — 需重大改进** |

---

## Anti-Patterns 评估

**AI Slop 判定：非 AI slop** ✅

检测器找到 3 处 `gradient-text`，全部为 **false positive** — GradientText 是故意设计的选择（品牌"大胆、实验性"），有 proper reduced-motion 降级。

### 品牌 slop 检查
- ✅ 非开发者作品集 — 无项目卡片墙、技术栈图标、GitHub 统计
- ✅ 非 SaaS 着陆页 — 无功能对比、推荐、指标
- ✅ 非 AI 模板 — 章节结构虽常见，但内容质量和布局多样性使其与众不同
- ✅ 编辑杂志美学 — 排版系统、深色背景、高对比强调色、双语内容

---

## 总览印象

这是一个真正有身份感的个人杂志页面。视觉语言一致、动效丰富但克制、内容层级清晰。最突出的优势是 **品牌身份与视觉执行的一致性** — 从颜色系统（青/紫/金/品红）到排版区分，每一步都在强化"数字身份杂志"的定位。

**最大的机会：** 动效系统缺少统一的质量关卡 — 4 个动效引擎（Framer Motion + GSAP + Three.js + CSS）同时运行，ScrollReveal 的"统一反射"问题削弱了叙事节奏。*(reduced-motion 门控缺陷已在 2026-07-01 修复)*

---

## 做得好的（3 项）

### S1：强一致的视觉身份
颜色系统（青/紫/金/品红）被坚持用作语义高亮。排版区分（Inter 无衬线正文 + 编辑性引用的衬线字体）建立了清晰的杂志层次。深色背景通过放射状渐变增加深度，避免平面感。内容优先级系统运作良好 — 章节标题 ~5.6rem 杂志比例，正文 ~1rem。

### S2：深思熟虑的 reduced-motion 策略
比许多生产级网站做得更好。集中式 `MotionConfig reducedMotion="user"` 处理 Framer Motion 组件。大多数 GSAP 效果通过媒体查询门控条件加载。AuroraBackground 有 CSS 媒体查询。这种分层策略意味着大多数动画在 reduced-motion 激活时正确降级。

### S3：Gallery 马赛克布局
12 列 CSS Grid 马赛克（非均匀跨列/跨行）加上移位布局（项目 5 `margin-top: 4rem`，项目 6 `margin-top: 9rem`），创造了有意的混乱感，使画廊感觉像真正的编辑布局而非模板。

---

## 优先问题

### ~~P0：SplitText / AnimatedContent 缺少 reduced-motion 门控~~ (✅ 已修复)

- **位置：** `src/components/effects/react-bits/SplitText.tsx:60-70`，`AnimatedContent.tsx:45-61`
- **修复：** 在 `useEffect` 顶部添加 `window.matchMedia('(prefers-reduced-motion: reduce)')` 检查，偏好激活时提前返回，内容直接可见。
- **状态：** 2026-07-01 已修复

### ~~P0：ProfileCard 倾斜引擎无 reduced-motion 检查~~ (✅ 已修复)

- **位置：** `src/components/effects/react-bits/ProfileCard.tsx:68-182`
- **修复：** 添加 `useReducedMotion()`，`tiltDisabled = !enableTilt || reducedMotion`，倾斜引擎由此短路。
- **状态：** 2026-07-01 已修复

### ~~P0：BounceCards / BorderGlow 缺少 reduced-motion 门控~~ (✅ 已修复)

- **位置：** `BounceCards.tsx:52-65`，`BorderGlow.tsx:161-183`
- **修复：** BounceCards useEffect 顶部加 media query 检查跳过 GSAP。BorderGlow handlePointerMove 媒体查询追加 `prefers-reduced-motion: no-preference`。
- **状态：** 2026-07-01 已修复

### P1：统一的 ScrollReveal 创建"公式化"动画

- **位置：** `src/components/motion/ScrollReveal.tsx:19`
- **问题：** 每个引用 ScrollReveal 的章节使用完全相同的参数（`y: 34`、`duration: 0.8`、相同缓动）。违背"节奏即叙事"原则。
- **修复：** 扩展 ScrollReveal 支持可选的 `direction`、`distance`、`ease` 参数，为不同章节变化。

### P1：GradientText / ShinyText 动画 background-position 触发重绘

- **位置：** `GradientText.tsx:64`，`ShinyText.tsx:62`
- **问题：** 使用 `useAnimationFrame` 连续更新 `background-position` — 不是仅合成器属性，触发重绘。Hero 同时运行 GridScan（Three.js）+ Aurora（CSS 动画）。
- **修复：** 使用 `transform: translateX()` 在伪元素上模拟背景移动，或使用 IntersectionObserver 在视口外暂停循环。

### ~~P1：ScrollReveal `once: false` 章节重复入场~~ (有意保留)

- **位置：** `ScrollReveal.tsx:21`
- **状态：** 产品需求明确要求"滚动离开再回来仍可重新触发动效"。`once: false` 是**有意的**，非 bug，不应修改。

---

## 动效审计专项报告

### 全部 20 个动画组件摘要 (活跃)

| 组件 | 引擎 | 类型 | 使用位置 | Reduced-motion |
|------|------|------|---------|----------------|
| ScrollReveal | FM | 滚动触发 | 首页 5 章节 | ✅ `useReducedMotion` |
| TextReveal | FM | 入场 | 首页 Hero | ✅ `MotionConfig` |
| GradientText | rAF | 连续 | 首页 Hero | ✅ `useReducedMotion` |
| ShinyText | rAF | 连续/悬停 | 首页 Thoughts | ✅ `useReducedMotion` |
| RotatingText | FM | 轮换 | 首页 Hero | ✅ `useReducedMotion` |
| AuroraBackground | CSS | 连续 | 全局背景 | ✅ 媒体查询 |
| ~~CursorGlow~~ | ~~FM spring~~ | ~~指针跟踪~~ | ~~全局 (已从 App.tsx 移除)~~ | ~~死代码~~ |
| CardTilt | FM spring | 悬停 | Motion Lab | ✅ `useReducedMotion` |
| ProfileCard | 自定义 rAF | 悬停/入场 | Hero | ✅ `useReducedMotion` (本轮已修复) |
| GridScan | Three.js | 连续+交互 | 首页背景 | ✅ 媒体查询 |
| MagicBento | GSAP | 悬停/交互 | 首页 Interests | ✅ 媒体查询 |
| ScrambledText | GSAP | 悬停 | 首页 Chapter | ✅ 媒体查询 |
| SplitText | GSAP+ST | 滚动触发 | 首页 Thoughts | ✅ 媒体查询 (本轮已修复) |
| AnimatedContent | GSAP+ST | 滚动触发 | 首页 About | ✅ 媒体查询 (本轮已修复) |
| PillNav | GSAP | 悬停+入场 | Header | ✅ 媒体查询 |
| ImageTrail | GSAP | 光标跟踪 | Motion Lab | ✅ 媒体查询 |
| BounceCards | GSAP | 入场+悬停 | Motion Lab | ✅ 媒体查询 (本轮已修复) |
| Stack | FM spring | 拖拽/自动 | Motion Lab | ✅ `useReducedMotion` |
| TiltedCard | FM spring | 悬停 | Motion Lab | ✅ `useReducedMotion` |
| BorderGlow | 自定义 rAF | 悬停/动画 | Gallery | ✅ 媒体查询 (本轮已修复) |
| GlareHover | 纯 CSS | 悬停 | Gallery | ✅ 纯 CSS（自然降级） |

### 关键发现

**Reduced-motion 合规率：** 20 个激活组件中原 5 个存在缺陷（SplitText, AnimatedContent, ProfileCard, BounceCards, BorderGlow），**本轮已全部修复**，待人工验证后确认 100% 合规

**4 个动效引擎并发运行：** Framer Motion + GSAP + Three.js + CSS 动画同时活跃。这在高端桌面上可接受，但低端设备和电池供电设备上是个问题。

**统一反射问题：** ScrollReveal 给每个章节完全相同的入场参数（方向、距离、时长、缓动），违背"节奏即叙事"的品牌原则。

**连续动画性能：** GradientText 和 ShinyText 持续更新 `background-position`（重绘触发），且 Hero 同时运行 GridScan（Three.js 全屏渲染）+ AuroraContinuous（CSS）。三重重叠。

### 动效修复建议

| 优先级 | 行动 | 影响 |
|--------|------|------|
| ~~🔴 紧急~~ | ~~修复 5 个缺少 reduced-motion 门控的组件~~ | ✅ 本轮已全部修复 |
| 🟡 高优先 | ScrollReveal 每章节差异化（direction/distance/ease 参数） | 品牌叙事质量 |
| 🟡 中优先 | GradientText/ShinyText 从 `background-position` 迁移到 `transform`-based 方案 | 性能 |
| 🔵 低优先 | 视口外/后台暂停连续动画（GradientText, ShinyText, AuroraBackground） | 电池+性能 |

> **动效健康评分：7/10** — 基础扎实，4 个 reduced-motion 缺陷已在本轮修复，待下次审计验证

---

## 人物角色红旗

### Jordan（首次访客）
- 🚩 Motion Lab 概念不明确 — 无解释文本，用户点"Lab"不知会看到什么
- 🚩 ScrambledText 是隐藏彩蛋 — 需在 54px 半径内悬停章节标签，用户要"偶然发现"
- 🚩 首屏认知过载 — Hero 入场 + Aurora 漂移 + GradientText 移动 + GridScan 同时启动

### Casey（移动端）
- 🚩 6 个交互效果依赖悬停（MagicBento 倾斜、ScrambledText、PillNav、BorderGlow、ImageTrail、TiltedCard），移动端完全失效
- 🚩 GridScan 需 `pointer: fine`，移动端 `fallback={null}`，留下空白背景无说明

### Riley（压力测试者）
- 🚩 `src/data/links.ts` 中 placeholder 链接行为未定义 — 可能点击后无任何反馈
- 🚩 无 Error Boundary — 任一组件 render 崩溃会导致整个应用白屏
- 🚩 无 noscript 降级 — JS 禁用时显示空白白页（在深色主题应用中尤为刺眼）

---

## 次要观察

1. `src/styles/global.css:577-650` — 过时的 `.interest-orbits` / `.interest-orbit` 样式，被 MagicBento 取代但未删除（死代码 ~70 行）
2. `Stack.tsx:94` — 未使用的 `isMobile` 状态导入
3. `PillNav.tsx:123-138` — 初始加载动画用 GSAP 从 `width: 0` → `width: auto`，产生布局偏移
4. 中文文本使用 `font-sans`（Inter），缺少高级 CJK 字体选项 — Noto Sans SC 会更合适
5. 无语言选择器 — 双语用户不能切换中文优先
6. 无 Error Boundary 包装根组件 — 单点崩溃风险
7. 无 loading/skeleton 状态 — 页面内容直接 render，无渐进加载感知

---

## 值得思考的问题

1. **如果去掉所有动效，About 和 Contact 还剩什么？** 它们仅有的动画是 ScrollReveal 和 AnimatedContent，没有文本替换或视觉替代。减去动效后内容是否仍然有感染力？

2. **"粗糙中的精致"在哪里？** 品牌承诺"原始"和"有意的不完美"，但目前整体美学是精致、抛光、电影化的。页面上有任何部分感觉"粗糙"或手工制吗？

3. **如果 GridScan 仅在高配桌面运行，什么才是"真实"的品牌体验？** 目前三个世界：完整桌面版（GridScan + Aurora + 全部效果）、移动版（仅 Aurora）、reduced-motion 版（无效果）。每个版本讲述不同的品牌故事。

4. **当 Motion Lab 的 16 个效果中有 6 个依赖悬停，这在移动优先的世界里意味着什么？** 半数以上的 Motion Lab 交互（ImageTrail、TiltedCard、ScrambledText、PillNav hover、BorderGlow、MagicBento tilt）在触摸设备上对用户不可见。
