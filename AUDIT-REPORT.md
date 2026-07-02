# 审计报告 — Seiya Digital Journal

**生成日期:** 2026-07-02
**审计范围:** 全站审计（首页、组件、设计令牌、数据层）
**风格类型:** Brand（个人数字杂志）

---

## 综合评分

| # | 维度 | 分数 | 核心发现 |
|---|------|------|----------|
| 1 | 无障碍 (A11y) | 2/4 | 正文字体对比度通过 WCAG AA；硬编码 `#eef2ff` 对比度未知；Chapter 组件对辅助技术隐藏了段落标签 |
| 2 | 性能 | 2/4 | GradientText 持续运行 `useAnimationFrame`；ScrollReveal 观察器始终活动；Lanyard 大块（893 kB gzip）未使用却被打包 |
| 3 | 主题化 | 2/4 | 设计令牌系统健壮但有 1 处硬编码颜色；未加载 Web 字体（使用系统 Inter + 衬线回退）；无亮色模式（故意） |
| 4 | 响应式 | 3/4 | 流式排版和断点设计优秀；移动端菜单按钮 ~41.6px 低于 44px 最低要求；ProfileCard `touch-action: none` 阻止双指缩放 |
| 5 | 反模式 | 1/4 | 渐变文字（绝对禁令）；每个段落上方的小写间距标签+编号标记；导航/卡片的毛玻璃效果；Inter 字体在反射拒绝列表中 |
| **总分** | | **10/20** | **可接受——需要显著改进** |

**评级区间:** 18-20 优秀 · 14-17 良好 · 10-13 可接受 · 6-9 差 · 0-5 严重

---

## 反模式结论

**结果：重度 AI 美学（3-4 个明显信号）**

这个网站不是"AI 垃圾"——暗黑大胆的配色方案、Three.js 网格扫描、自定义轨道动画、编辑式杂志网格，都带来了真实的独特性。但它带有几个经典的 AI 信号，削弱了品牌宣称的个性（"大膽 · 實驗 · 原始"）：

1. **渐变文字** ★ —— 首页 Hero 标题使用了 `background-clip: text` 渐变动画（GradientText 组件）；ProfileCard 标题也用了 `background-clip: text`。这是绝对禁令——"装饰性，无实际意义。"

2. **每个段落上方的小写间距标签** ★ —— `Chapter` 组件在每个段落顶部渲染 "01 / About" 到 "07 / Contact"。外加 `stack-eyebrow` 和 `signals-eyebrow` 构成了双重标签。这是 2023-2026 年 AI 界面的标志性脚手架模式。

3. **编号段落标记** ★ —— 每个段落都有 `Chapter number="01"` 到 `number="07"`。编号对读者不传递任何顺序信息，因此读起来像是脚手架，而不是品牌的语音。

4. **毛玻璃效果** ★ —— 导航栏 `backdrop-filter: blur(20px)`，ProfileCard 信息面板 `backdrop-filter: blur(30px)`。导航栏的模糊是功能性的（覆盖极光背景）；卡片的模糊是装饰性的。

5. **Inter 字体** 在技能的反射拒绝列表中——这是 AI 时代设计中最常见的"安全"无衬线字体。品牌宣称的个性需要更独特的选择。

**上下文：** 编辑式杂志美学是品牌有意为之（Product.md 称其为"个人杂志"），但上述信号是模式，不是身份认同。

---

## 执行摘要

- **审计评分：10/20**（可接受——需要显著改进）
- **问题统计：** 0 个 P0 · 7 个 P1 · 5 个 P2 · 3 个 P3
- **三大关键问题：**
  1. Hero 中的渐变文字违反绝对禁令，削弱品牌独特性
  2. 每个段落上方的标签+编号脚手架读起来像 AI 模板语法，而非杂志语音
  3. 魔术网格卡片描述中硬编码的 `#eef2ff`——绕过令牌系统，对比度未知

---

## 详细问题清单

### P1 — 严重

**1. Hero 标题中的渐变文字**
- **位置：** `src/components/effects/text/GradientText.tsx`（应用在 `src/components/sections/Hero.tsx:20-26`）
- **另见：** `src/components/effects/react-bits/ProfileCard.css:399-418`——卡片标题和副标题使用了 `background-clip: text`
- **类别：** 反模式
- **影响：** 违反了绝对禁令。渐变文字是 AI 时代最强的信号。Hero 是访客最先看到的内容——用渐变文字开头在内容有机会表达之前就发出了"AI 模板"的信号。
- **建议：** 将渐变文字替换为具有品牌重量的单一纯色。改用字重、字号或独特字体来强调。
- **建议指令：** `/impeccable quieter` 或 `/impeccable distill`

**2. 每个段落上方的标签 + 编号脚手架**
- **位置：** `src/components/ui/Chapter.tsx`——用于 About、Interests、Gallery、Thoughts、Journey、Contact；外加 `stack-eyebrow` 和 `signals-eyebrow`
- **类别：** 反模式
- **影响：** "每个段落上方的小写间距标签"是 2023-2026 年最泛滥的 AI 信号。在每个段落上都使用它读起来像是模板语法。搭配编号标记使脚手架信号加倍。这与品牌"实验 · 原始"的个性直接矛盾。
- **建议：** 重新思考 Chapter 作为段落标题的机制。要么赋予它语音（每个段落不同的视觉呈现），要么移除它。保持段落多样性——每个段落都使用统一标签恰恰与品牌追求的原始、实验性节奏相反。
- **建议指令：** `/impeccable distill`

**3. 硬编码的 `#eef2ff` 颜色**
- **位置：** `src/styles/global.css:721`（`.magic-bento-card__description`）
- **类别：** 主题化
- **影响：** 完全绕过了设计令牌系统。该颜色在卡片表面（半透明的 `var(--color-surface)`）上的对比度未知——可能不满足 WCAG AA。造成维护负担：主题更新不会影响它。
- **建议：** 将 `#eef2ff` 替换为 `var(--color-text)` 或创建一个新令牌。
- **建议指令：** `/impeccable colorize`

**4. Lanyard 组件被打包但被标记为跳过**
- **位置：** `src/components/effects/react-bits/Lanyard.tsx`、`DesktopLanyard.tsx`
- **类别：** 性能
- **影响：** Lanyard 块重 **893 kB gzip**（2.4 MB 原始）带一个 2.4 MB 的 `.glb` 模型文件。CLAUDE.md 明确说"有意未集成"。该块仍被构建和分发——增加部署大小、CI 时间和开发者困惑。
- **建议：** 从构建中移除或完全排除 Lanyard/DesktopLanyard。如果保留供将来使用，确保它在动态导入后面并且在不使用时能被 tree-shake 掉。
- **建议指令：** 手动清理

**5. Inter 字体被列入反射拒绝列表**
- **位置：** `src/styles/tokens.css:17`（`--font-sans`）
- **类别：** 反模式
- **影响：** Inter 是训练数据默认字体——2024-2026 年 AI 设计首选"安全几何无衬线体"。品牌的"大膽 · 實驗 · 原始"性格需要更有特色的字体。一个经过精心挑选的字体系列，配合有力的字重对比，会比 Inter + 系统衬线回退更能体现品牌。
- **建议：** 选择符合品牌三个关键词的独特字体。参见品牌注册字体选择流程。
- **建议指令：** `/impeccable typeset`

**6. 移动端菜单按钮低于 44px 触摸目标**
- **位置：** `src/styles/global.css:248-250`（`.menu-button`——`width: 2.6rem; height: 2.6rem`）
- **类别：** 响应式设计
- **影响：** 在 16px 基准下，2.6rem ≈ 41.6px。WCAG SC 2.5.8（目标大小，AA）要求指针目标最小 44×44px。有运动障碍的用户在小屏手机或单手操作时可能难以点击菜单按钮。
- **建议：** 至少增加到 2.75rem（44px）或添加不可见的触摸区域 padding。
- **建议指令：** `/impeccable adapt`

**7. ProfileCard 的 `touch-action: none`**
- **位置：** `src/components/effects/react-bits/ProfileCard.css:35`（`.pc-card-wrapper`）
- **类别：** 无障碍 / 响应式
- **影响：** `touch-action: none` 阻止了卡片上的所有浏览器默认触摸行为，包括双指缩放。需要缩放来阅读文字或查看图片的用戶被阻止。由于卡片在 Hero 中（首屏之上），这影响每个触摸设备访客。
- **建议：** 改用 `touch-action: manipulation`（仍然阻止双击缩放但允许双指缩放），或将 `touch-action: none` 限定到处理指针事件的特定子元素。
- **建议指令：** `/impeccable adapt`

---

### P2 — 次要

**8. ScrollReveal 在每个实例上都使用 `{ once: false }`**
- **位置：** `src/components/motion/ScrollReveal.tsx:21`
- **类别：** 性能
- **影响：** 每个段落和子段落都创建一个持久的 IntersectionObserver，每次滚动都触发。首页上有 15+ 个 ScrollReveal 实例，这是不必要的开销。滚动回看时动画重新播放，可能造成困惑。
- **建议：** 内容段落默认使用 `once: true`。仅当重放确实增加价值时才使用 `once: false`（例如被筛选的图库项目）。
- **建议指令：** `/impeccable optimize`

**9. GradientText 持续运行 `useAnimationFrame`**
- **位置：** `src/components/effects/text/GradientText.tsx:64-91`
- **类别：** 性能
- **影响：** `useAnimationFrame` 每帧触发（约 16ms），无论组件是否在视窗中可见。渐变动画在页面加载后持续运行，与滚动处理程序和其他动画工作竞争资源。在较慢设备上造成卡顿。
- **建议：** 使用 IntersectionObserver 暂停/恢复动画循环，或切换到纯 CSS `@keyframes` 动画，使合成器能独立于主线程处理。
- **建议指令：** `/impeccable optimize`

**10. Chapter 组件内容对屏幕阅读器隐藏**
- **位置：** `src/components/ui/Chapter.tsx:8`（`aria-hidden="true"`）
- **类别：** 无障碍
- **影响：** Chapter 中的段落标题（"About"、"Interests" 等）对辅助技术隐藏。这些标签提供导航上下文。虽然段落的 `id` 属性可用于跳过链接，但使用标题导航的屏幕阅读器用户听不到这些上下文提示。
- **建议：** 让 Chapter 对辅助技术可见（移除 `aria-hidden`），并确保其中的文字作为适当的段落标题发挥作用，或确保段落可见的 `<h2>` 提供等同的上下文。
- **建议指令：** `/impeccable clarify`

**11. `--color-faint` 在 `--color-bg` 上为 4.59:1**
- **位置：** `src/styles/tokens.css:10`（`--color-faint: #657087`）
- **类别：** 无障碍
- **影响：** 以 4.59:1 通过 WCAG AA，但处于 4.5:1 阈值的舍入误差范围内。对于小号文字（0.66-0.78rem，用于滚动提示、章节标签、关键词标签），任何渲染偏差（子像素、抗锯齿）都可能将其推至阈值以下。这个"淡淡"色用于次要文字，但激进的深色背景让其难以正常工作。
- **建议：** 将 `--color-faint` 加亮到约 `#7a8aa0` 以获得舒适的 5.5:1+ 缓冲，或增加淡色元素字重。
- **建议指令：** `/impeccable colorize`

**12. Chapter 文件底部有 import 语句**
- **位置：** `src/components/ui/Chapter.tsx:17`
- **类别：** 完善
- **影响：** `import { ScrambledText }` 语句在文件底部，组件函数之后。虽然 ESM 会提升导入，但这是一个不寻常的模式，可能混淆开发者并触发未来的工具警告。
- **建议：** 将 import 移回文件顶部。
- **建议指令：** 手动修复

---

### P3 — 锦上添花

**13. 未加载自定义 Web 字体**
- **位置：** `src/styles/tokens.css:17-20`
- **类别：** 主题化
- **影响：** 网站依赖 Inter（部分平台系统安装）和衬线回退栈。在没有安装 Inter 的平台上（Linux、部分移动浏览器），会回退到 system-ui 或通用衬线字体，视觉效果差异显著。这会破坏编辑式杂志的感觉。
- **建议：** 通过 `@font-face`/Google Fonts 自托管或加载显示和正文字体。品牌注册推荐独特字体，而非系统栈。
- **建议指令：** `/impeccable typeset`

**14. ProfileCard CSS 包含许多硬编码颜色**
- **位置：** `src/components/effects/react-bits/ProfileCard.css`——遍布各处
- **类别：** 主题化
- **影响：** 卡片使用硬编码的 `hsl()` 和 `rgba()` 值用于全息光泽、眩光和光晕效果。这些不会响应主题令牌变化。不是布局破坏性问题，但创建了两层主题化：页面一套，卡片另一套。
- **建议：** 在可能的情况下，从父组件设置的 CSS 变量派生卡片效果颜色。接受某些移植的 React Bits 组件将始终半独立。
- **建议指令：** `/impeccable colorize`

**15. 页脚小号文字使用 `--color-faint`**
- **位置：** `src/styles/global.css:1426`——页脚 0.7rem
- **类别：** 无障碍 / 性能
- **影响：** 0.7rem = 11.2px 文字使用 `--color-faint` 在边界 4.59:1。小号 + 边界对比度使视力障碍用户难以阅读。
- **建议：** 将页脚文字稍微放大（0.75rem）或使用 `--color-muted` 代替 `--color-faint`。
- **建议指令：** `/impeccable clarify`

---

## 系统性问题

1. **两层主题化系统** —— 核心页面使用 `tokens.css` 的 CSS 自定义属性，但移植的 React Bits 组件（ProfileCard、MagicBento 等）在其 CSS 中使用硬编码颜色。这随着时间推移造成视觉漂移，令牌更新不会级联到效果组件。

2. **渐变文字分布在两个组件中** —— `GradientText`（文字效果）和 `ProfileCard`（卡片标题/副标题）都使用 `background-clip: text`。这是一个模式，不是一次性现象——它在需要强调的地方都出现，说明这是一种设计习惯而非刻意选择。

3. **ScrollReveal 统一性** —— 每个段落的入场效果都是 `fade-in + translateY(34px)` 使用相同的 cubic-bezier。品牌说"节奏即叙事"——每个段落使用相同入场效果与此原则矛盾。

4. **多重标签** —— 段落可以有 Chapter（编号段落标记）和额外的标签（`stack-eyebrow`、`signals-eyebrow`、`about-eyebrow`）。这是一个段落的两层脚手架。

---

## 亮点

- **设计令牌基础扎实** —— `tokens.css` 结构清晰，语义化命名，`clamp()` 使用得当，颜色方案声明正确。这是一个坚实的地基。

- **响应式系统健壮** —— 三个断点、流式 `clamp()` 排版、深思熟虑的移动端布局转换（旅程时间线→垂直、兴趣轨道→列表）。响应式设计展现了真正的工艺。

- **图库无障碍模式正确** —— 过滤按钮使用 `role="tablist"`、`role="tab"`、`aria-selected`，移动菜单有 `aria-label`，`alt` 文字构建合理，全局定义了 `focus-visible` 样式。

- **图片优化到位** —— `loading="lazy"`、`decoding="async"`、固定的 `width`/`height` 属性避免累计布局偏移。全站使用 WebP 格式。资源路径正确使用 `import.meta.env.BASE_URL`。

- **动效自律** —— `prefers-reduced-motion` 得到尊重且有适当的回退。Framer Motion 动画仅使用 `transform` 和 `opacity`。GSAP 延迟加载。极光背景使用 `will-change: transform`。

- **代码整洁** —— 零 lint 警告，零构建错误。代码库维护良好。

- **品牌调性一致** —— 尽管存在反模式信号，整体设计确实符合"暗黑编辑式杂志"的身份。配色方案（深海军蓝上的青/紫/金/品红）独特且不是通用的暗色模式。

---

## 建议操作

1. **[P1] 手动清理**：移除或 tree-shake Lanyard 的构建（893 kB gzip，CLAUDE.md 明确跳过）
2. **[P1] `/impeccable quieter` 或 `/impeccable distill`**：处理 Hero 中的渐变文字 + 标签脚手架
3. **[P1] `/impeccable typeset`**：用独特品牌字体替换 Inter
4. **[P1] `/impeccable adapt`**：修复触摸目标大小（菜单按钮）和 `touch-action: none`
5. **[P1] `/impeccable colorize`**：用令牌替换 `#eef2ff` 硬编码颜色；调整 `--color-faint`
6. **[P2] `/impeccable optimize`**：分页 ScrollReveal 观察器，暂停屏幕外 GradientText 动画
7. **[P2] `/impeccable clarify`**：修复 Chapter 的 `aria-hidden`；改进其余无障碍差距
8. **[P3] `/impeccable polish`**：微调页脚、ProfileCard CSS 变量集成

---

你可以让我按顺序逐个执行这些修复，一次性全部执行，或按你喜欢的任何顺序执行。

修复后重新运行 `/impeccable audit` 即可看到评分提升。
