# React Bits 使用状态审计

> 审计日期: 2026-07-01
> 最后更新: 2026-07-01 (完成任务 #1–#4)
> 审计范围: 19 个 React Bits 效果的源码存在性、Real Demo 状态、首页使用情况、死代码、Metadata 准确性

---

## 总览

| # | 名称 | 源码组件 | Real Demo | 首页使用 | 仅 Motion Lab | 备注 |
|---|------|----------|-----------|----------|---------------|------|
| 1 | **GradientText** | `effects/text/` ✅ | ✅ 已补 | **Hero** ✅ | — | real-demo, 完整集成 |
| 2 | **ShinyText** | `effects/text/` ✅ | ✅ 已补 | **Hero/Thoughts** ✅ | — | real-demo, 完整集成 |
| 3 | **RotatingText** | `effects/text/` ✅ | ✅ 已补 | **Hero** ✅ | — | real-demo, 完整集成 |
| 4 | **BorderGlow** | `react-bits/` ✅ | ✅ | **Gallery** ✅ | — | real-demo, 完整集成 |
| 5 | **GlareHover** | `react-bits/` ✅ | ✅ | **Gallery** ✅ | — | real-demo, 完整集成 |
| 6 | **ProfileCard** | `react-bits/` ✅ | ✅ | **Hero** ✅ | — | real-demo, 完整集成 |
| 7 | **TiltedCard** | `react-bits/` ✅ | ✅ | ❌ | ✅ | real-demo, 仅 Motion Lab |
| 8 | **Stack** | `react-bits/` ✅ | ✅ | ❌ | ✅ | real-demo, 仅 Motion Lab |
| 9 | **BounceCards** | `react-bits/` ✅ | ✅ | ❌ | ✅ | real-demo, 仅 Motion Lab |
| 10 | **ImageTrail** | `react-bits/` ✅ | ✅ | ❌ | ✅ | real-demo, 仅 Motion Lab |
| 11 | **MagicBento** | `react-bits/` ✅ | ✅ | **Interests** ✅ | — | real-demo, 完整集成 |
| 12 | **PillNav** | `react-bits/` ✅ | ✅ | **Header** ✅ | — | real-demo, 完整集成 |
| 13 | **ScrambledText** | `react-bits/` ✅ | ✅ | **Chapter** ✅ | — | real-demo, 完整集成 |
| 14 | **SplitText** | `react-bits/` ✅ | ✅ | **Thoughts** ✅ | — | real-demo, 完整集成 |
| 15 | **AnimatedContent** | `react-bits/` ✅ | ✅ | **About** ✅ | — | real-demo, 完整集成 |
| 16 | **CardNav** | ❌ 无源码 | ❌ | ❌ | ❌ | intentionally skipped |
| 17 | **CountUp** | `react-bits/` ✅ | ✅ | ❌ | ✅ | real-demo, 仅 Motion Lab |
| 18 | **Lanyard** | ❌ 无源码 | ❌ | ❌ | ❌ | intentionally skipped |
| 19 | **GridScan** | `react-bits/` ✅ | ✅ | **App 背景** ✅ | — | real-demo, 完整集成 |

---

## 已完成任务

### #1 GradientText / ShinyText / RotatingText 补 Motion Lab real demo

- `ReactBitsDemo.tsx`: 新增 3 个 case (`gradient-text`, `shiny-text`, `rotating-text`)，从 `effects/text/` 直接导入使用
- `ReactBitsDemo.css`: 新增 `rb-demo-gradient`, `rb-demo-shiny`, `rb-demo-rotating-wrap`, `rb-demo-rotating` 样式
- 3 个组件已加入 `realDemoNames` set，Motion Lab 卡片内可交互预览

### #2 Metadata 修正

- `GradientText` → `integrationStatus`: `real-demo`, `homepageUsage`: true
- `ShinyText` → `integrationStatus`: `real-demo`, `homepageUsage`: true
- `RotatingText` → `integrationStatus`: `real-demo`, `homepageUsage`: true
- `TiltedCard.where` → "Motion Lab" (原 "Hero portrait, Interests")
- `Stack.where` → "Motion Lab" (原 "Interests, Motion Lab")
- `ProfileCard.where` → "Hero, Motion Lab" (原 "Hero, Motion Lab"，修正为正确反映首页 + Motion Lab 双重使用)
- 3 个 text 组件的 `where` 追加 "Motion Lab"

### #3 Lanyard / CardNav 确认 intentionally skipped

- `plannedNames` set 已清空 (不再标 `planned`)
- 两条目保持 `metadata-only` (fallthrough)
- description 已标注 "Intentionally skipped — not planned."
- `where` 已标注 "Not integrated"
- `sourceFile` 引用保留 (React bits/*.txt 作为参考)
- ✅ 确认：这 2 个是故意跳过，非遗忘

### #4 清理 `effects/cards/` 死代码

**删除 8 文件 + 1 空目录:**

| 文件 | 原因 |
|------|------|
| `cards/BorderGlow.tsx` + `.css` | 被 `react-bits/BorderGlow` 替代 |
| `cards/GlareHover.tsx` + `.css` | 被 `react-bits/GlareHover` 替代 |
| `cards/TiltedCard.tsx` + `.css` | 被 `react-bits/TiltedCard` 替代 |
| `cards/Stack.tsx` + `.css` | 被 `react-bits/Stack` 替代 |
| `cards/` 空目录 | 已删除 |

所有文件确认未被任何文件导入 (`grep 'from.*effects/cards/'` → 0 结果)。

---

## 最终状态

| 汇总状态 | 数量 | Effects |
|----------|------|---------|
| ✅ 完整集成 (源码 + 首页在用 + Motion Lab demo) | 12 | GradientText, ShinyText, RotatingText, BorderGlow, GlareHover, MagicBento, PillNav, ScrambledText, SplitText, AnimatedContent, GridScan, ProfileCard |
| ✅ 完整集成 (源码 + 首页在用, 无 demo 必要) | 0 | — |
| ✅ 仅 Motion Lab (源码 + demo) | 5 | TiltedCard, Stack, BounceCards, ImageTrail, CountUp |
| ⏳ Intentionally Skipped (无源码) | 2 | CardNav, Lanyard |
| ❌ 死代码 | 0 | **已全部清理** |
| ❌ Metadata 不准确 | 0 | **已全部修正** |
