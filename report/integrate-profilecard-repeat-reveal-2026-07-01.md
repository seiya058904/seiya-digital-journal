# 集成 ProfileCard + 重复滚动动效 — 完工报告

**日期：** 2026-07-01
**分支：** `codex/integrate-profilecard-repeat-reveal`
**Commit：** `4690001`

---

## 完成项

### 1. ProfileCard 真接入（React Bits 源码）

- 从 `React bits/10.txt` 提取原始源码，适配 TypeScript
- 保留核心 tilt engine（requestAnimationFrame + CSS 自定义属性追踪）
- 保留 holographic shine / glare / behind glow 效果
- **移除** `DeviceOrientationEvent` 相关代码（隐私合规）
- **新建组件：** `src/components/effects/react-bits/ProfileCard.tsx` + `ProfileCard.css`

### 2. 旧仿制版清理

- 删除 `src/components/effects/cards/ProfileCard.tsx`（旧的 Framer Motion 仿制版）
- 删除 `src/components/effects/cards/ProfileCard.css`
- 两文件未被任何组件引用，删除无影响

### 3. Hero 右侧卡片替换

| 修改前 | 修改后 |
|---|---|
| `GradientBorder` + `<img>`（大尺寸） | `<ProfileCard>`（真实 React Bits 组件） |
| 宽度 `35rem`（~560px） | 宽度 `22rem`（~352px） |
| 网格无 `column-gap` | 增加 `column-gap: 2rem` |
| 卡片 `max-height` 无约束 | `max-height: 440px` |
| 名称/标题大尺寸 | 名称 `min(4svh, 1.8em)`，标题 `13px` |

### 4. 移动端 ProfileCard 处理

| 断点 | 行为 |
|---|---|
| `< 560px`（手机） | `display: none` 完全隐藏 |
| `560-820px`（平板） | `max-height: 380px`，`opacity: 0.75` |
| `> 820px`（桌面） | 正常显示，迷你尺寸 |

### 5. 滚动重复动效修复

**`ScrollReveal.tsx`（Framer Motion 版）：**
```
viewport: { once: true, amount }  →  viewport: { once: false, amount }
```
离开视口 → 恢复 `initial` 状态 → 重新进入时再次播放。

**`AnimatedContent.tsx`（GSAP 版）：**
```
once: true  →  toggleActions: 'play reverse play reverse'
```
离开视口时反向播放还原 → 重新进入时正向播放。

**应用范围：**
| Section | 组件 | 是否改为 repeat |
|---|---|---|
| About | `AnimatedContent` × 2 | ✅ |
| Interests | `ScrollReveal` | ✅ |
| Gallery | `ScrollReveal` × 6 | ✅ |
| Thoughts | `ScrollReveal` × 5 | ✅ |
| Journey | `ScrollReveal` × 4 | ✅ |
| Contact | `ScrollReveal` × 2 | ✅ |
| Hero | `motion.div`（`initial`+`animate`） | ❌ 用户指定保持稳定 |
| Motion Lab | demo 自逻辑 | ❌ 用户指定 demo 自控制 |

### 6. 状态标记更新

| 效果 | 之前 | 现在 |
|---|---|---|
| ProfileCard | metadata-only | **real demo** / homepage yes |
| Lanyard | planned | **intentionally skipped** |
| CardNav | planned | **intentionally skipped** |

### 7. 卡片拥挤度轻量修复

- Hero 网格增加 `column-gap: 2rem`
- Hero 卡片宽度 `35rem → 22rem`
- Gallery 图片 hover scale `1.035 → 1.025`
- Gallery GlareOpacity `0.22 → 0.16`
- Motion Lab card grid gap `1.25rem → 1.5rem`

---

## 验证结果

| 检查项 | 结果 |
|---|---|
| `npm run lint` | ✅ 通过 |
| `npm run build` | ✅ 通过（tsc + vite build） |
| vite.config.ts 未修改 | ✅ |
| GitHub Actions 未修改 | ✅ |
| 隐私关键词（face-api/getUserMedia/DeviceOrientationEvent 等） | ✅ 0 出现 |
| GridScan shader 未修改 | ✅ |
| 无 force push | ✅ |
| 无 `git add .` | ✅ |

---

## 文件变更清单

```
src/components/effects/react-bits/ProfileCard.tsx      + (新建) 真实 React Bits 组件
src/components/effects/react-bits/ProfileCard.css       + (新建) 完整 CSS
src/components/effects/react-bits/AnimatedContent.tsx   M 改为 repeat reveal
src/components/lab/ReactBitsDemo.tsx                    M 添加 ProfileCard demo
src/components/lab/ReactBitsDemo.css                    M demo card 样式
src/components/motion/ScrollReveal.tsx                  M once:true → once:false
src/components/sections/Hero.tsx                        M 替换为 ProfileCard
src/components/sections/Gallery.tsx                     M 降低 glare opacity
src/data/effects.ts                                     M ProfileCard 标记更新
src/pages/MotionLabPage.css                             M gap 调整
src/styles/global.css                                   M Hero 尺寸 + 拥挤修复
src/components/effects/cards/ProfileCard.tsx             D 旧仿制版删除
src/components/effects/cards/ProfileCard.css             D 旧仿制版删除
```
