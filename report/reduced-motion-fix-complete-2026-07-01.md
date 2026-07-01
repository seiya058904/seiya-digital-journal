# 动效可访问性修复 + 最终收口 完成报告

> 日期: 2026-07-01
> 分支: `codex/integrate-profilecard-repeat-reveal`

---

## 范围

本轮严格限于：
- 5 个 React Bits 组件的 reduced-motion 无障碍门控
- 审计文档矛盾修正
- 不含新动效、不含视觉改动、不含 MagicBento

---

## 1. 修改文件清单

| 文件 | 变更 |
|------|------|
| `src/components/effects/react-bits/SplitText.tsx` | +`matchMedia('reduce')` 门控 |
| `src/components/effects/react-bits/AnimatedContent.tsx` | +`matchMedia('reduce')` 门控 |
| `src/components/effects/react-bits/ProfileCard.tsx` | +`useReducedMotion()` + `tiltDisabled` |
| `src/components/effects/react-bits/BounceCards.tsx` | +`matchMedia('reduce')` 门控 |
| `src/components/effects/react-bits/BorderGlow.tsx` | +`matchMedia('reduce')` 门控（经 lint 优化） |
| `src/data/effects.ts` | ProfileCard.where → "Hero, Motion Lab" |

---

## 2. 门控逻辑验证

所有门控只读取 `prefers-reduced-motion: reduce`，**正常模式零影响**。

| 组件 | 正常模式 | Reduce 模式 |
|------|---------|-------------|
| SplitText | GSAP ScrollTrigger 滚入动画，不变 | 跳过 GSAP，内容直接可见 |
| AnimatedContent | GSAP ScrollTrigger 入场动画，不变 | 跳过 GSAP，内容直接可见 |
| ProfileCard | rAF 倾斜引擎 + 指针追踪，不变 | `tiltDisabled` 短路引擎，卡片静态 |
| BounceCards | GSAP elastic 缩放入场，不变 | 跳过 `fromTo`，卡片直接显示 |
| BorderGlow | 指针追踪边缘光效，不变 | 不追踪指针，保留基础边框 |

---

## 3. 越界回退

MagicBento.tsx / MagicBento.css 已被 hook 写入无关特性（clickEffect / textAutoHide / enableBorderGlow / enableSpotlight），已 `git checkout` 回退。diff 中已无这两个文件。

---

## 4. 审计文档矛盾修正

| 文档 | 矛盾 | 修正 |
|------|------|------|
| `effects.ts` (源码) | ProfileCard.where = "Motion Lab" | → "Hero, Motion Lab" |
| `react-bits-audit-2026-07-01.md` | ProfileCard.where 记录为 "Motion Lab" | → 修正描述 |
| `critique-motion-audit-2026-07-01.md` | 合规率写 "4 个有缺陷" | → "原 5 缺陷已修复，待人工验证" |

---

## 5. Untracked 文件处理建议

| 文件 | 建议 |
|------|------|
| `.impeccable/` | 加 `.gitignore` 排除 |
| `AGENTS.md` / `PRODUCT.md` | 项目决策是否提交 |
| `React bits/` | 保留不提交（参考材料） |
| `Report/` (4 文件) | 项目决策是否提交 |
| `picture/` | 项目决策是否提交 |
| `GalleryCard.tsx` | 需提交（与 Gallery.tsx 联动） |

---

## 6. 验证

| 检查 | 结果 |
|------|:----:|
| `npm run lint` | ✅ 通过 |
| `npm run build` | ✅ 通过 |
| 正常模式动效保持 | ✅ 全部 5 组件和之前一致 |
| reduce 模式只做无障碍降级 | ✅ |
| 无越界改动 | ✅ MagicBento 已回退 |
| ScrollReveal once:false | ✅ 保留，不修改 |

**建议：进入人工验收。**
