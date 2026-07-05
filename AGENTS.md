# Repository Guidelines

## Project Overview

这是一个纯客户端个人数字日志，使用 React 19、TypeScript、Vite 8、Framer Motion、GSAP、Three.js、Supabase Auth、Cloudflare Worker 和 Supabase PostgreSQL。启动链路为 `index.html` → `src/main.tsx` → `src/App.tsx`；`App.tsx` 根据 URL hash（如 `#/archive`、`#/gallery`、`#/motion-lab`、`#/profile`）切换页面。`npm run build` 将静态站点输出到 `dist/`；`.github/workflows/deploy.yml` 会在推送到 `main` 后使用 Node 22 构建并部署到 GitHub Pages。

## Project Structure & Module Organization

- `src/pages/`：首页、Archive 子页面、Gallery、Motion Lab、Auth、Profile。
- `src/components/sections/`：首页章节；`ui/`：共享界面组件（Header、AccountMenu、DesktopOnly 等）；`profile/`：Profile 相关组件（ProfileHero、ActivityStats、EditProfileSurface、focusTrap）。
- `src/components/motion/`、`effects/`：动效、WebGL 效果及 React Bits 组件；修改时保留降级与 reduced-motion 行为。
- `src/data/`：个人资料、链接、文字、效果清单、视觉档案和头像配置（profileAvatars.ts）。
- `src/styles/tokens.css`：设计变量；`global.css` 与各页面/组件 CSS：全局及局部样式。
- `src/assets/`：由代码导入的资源；`public/`：按原路径直接发布的图片、演示和视觉档案。
- `src/auth/`：AuthContext 和相关路由工具。
- `src/profile/`：ProfileContext 和状态管理（ProfileContext.tsx、profileState.ts）。
- `src/lib/`：工具函数（authRoutes.ts、profile.ts、profileApi.ts、interactions.ts、env.ts、supabase.ts）。
- `scripts/trace-image.mjs`：图片引用追踪脚本。测试与被测模块相邻，命名为 `*.test.ts`。

## Architecture Notes

应用没有 React Router，而由 `App.tsx` 集中解析 hash；新增或变更路由应同步检查导航和旧地址兼容。站点部署基路径固定为 `/seiya-digital-journal/`，引用 `public/` 资源时使用 `import.meta.env.BASE_URL`。

当前路由：
- `#/` 或 `#home`：首页
- `#/auth`：认证页面
- `#/profile`：个人空间（受保护路由）
- `#/lab` 或 `#/motion-lab`：Motion Lab
- `#/archive`：Archive 主页
- `#/archive/images`：Image Vault
- `#/archive/notes`：Notes Vault
- `#/archive/notes/:id`：Note 详情
- `#/archive/projects`：Project Vault
- `#/gallery`：Gallery
- `#/archive/collections`：重定向到 `#/archive/images`

## Build, Test & Development Commands

```powershell
npm ci          # 按 package-lock.json 安装依赖，适合干净环境/CI
npm run dev     # 启动 Vite 开发服务器
npm test        # 用 Node 内置测试运行器执行 src/**/*.test.ts
npm run lint    # 使用 Oxlint 检查 React 与 TypeScript
npm run build   # TypeScript 项目检查后生成 dist/
npm run preview # 本地预览生产构建
```

单独运行数据测试：`node --experimental-strip-types --test src/data/content.test.ts`。部署、发布、迁移、commit、push、Release 和任何数据库写操作只能在用户明确授权后执行；尤其注意 push 到 `main` 会触发部署。

## Coding Style & Naming Conventions

遵循相邻代码：两空格缩进、单引号、不写分号。React 组件和组件文件使用 `PascalCase`，函数、变量和数据使用 `camelCase`，CSS 类名应表达用途。优先复用现有组件和 `tokens.css`，不要新增依赖或硬编码可复用的颜色、间距、动效时长。保持 TypeScript 严格检查、无障碍属性、触摸设备和 reduced-motion 兼容。

## Testing & Verification

非平凡数据规则或逻辑变更应添加一个聚焦的回归测试，使用 `node:test` 与 `node:assert/strict`。提交前通常运行 `npm test`、`npm run lint`、`npm run build`。不要掩盖失败，也不要修改无关行为来强行通过。除非用户明确要求，不使用浏览器预览、Playwright 或自动截图；UI 变更应交由用户手动检查首页、相关 hash 页面、移动端和 reduced-motion。最后用 `git status --short`、`git diff --stat` 和目标文件差异排查意外产物。

最近一次 Profile release 验证为 65 tests；未来必须以实际 test output 为准。

## Commit & Pull Request Guidelines

近期历史采用 `feat:`、`fix:`、`refactor:`、`perf:`、`style:`、`chore:` 等 Conventional Commit 前缀。每个提交保持单一目的，摘要简短且明确。。PR 应说明可见行为、复现或验证结果及未运行的检查；UI 变更附前后截图。不得提交 `dist/`、`node_modules/`、日志、缓存、原始图片目录、敏感文件或无关改动。

## Security & Configuration

不要提交环境变量文件、密钥、token、密码、私钥、数据库连接信息或本地配置；不要在客户端暴露服务端凭据，也不要把 secrets 写入文档、回复、日志或提交信息。遵守 `.gitignore`，不提交构建目录、缓存或临时文件。修改认证、权限、数据库、签名、生产配置、GitHub Pages 权限或计费相关内容前，先说明风险并获得用户授权。

Worker secrets（名称，不记录值）：
- SUPABASE_URL
- SUPABASE_PUBLISHABLE_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ALLOWED_ORIGINS

## Agent-Specific Instructions

修改前读取相关文件并给出简短计划；优先最小、可审查的改动。不得顺手修改无关内容、覆盖用户未提交修改，或擅自改变功能、规则、数值、路由及兼容行为。不要编造命令、目录、接口或部署流程；不确定时停止并说明风险。未经授权，不安装依赖、不运行自动修复或全仓库格式化，不 commit、push、deploy、publish、创建 Release 或操作数据库。涉及生产、权限、secrets、数据完整性、签名或计费必须先获授权。测试失败或未运行时如实报告。

### Notes Vault Content Guidelines

When working on Archive Notes content:
- Follow length-based formatting rules:
  - **Short notes (150–500 words)**: Use chapter card layout
  - **Medium notes (500–1200 words)**: Can use chapter cards with a mini table of contents
  - **Long notes (1200+ words)**: Switch to article reading layout - avoid wrapping each paragraph in large cards
- Keep notes focused on identity, growth, thoughts, interests, and visual storytelling
- Match the existing glass tile UI pattern for
 folder display
- When adding new notes to `src/data/notes.ts`, ensure consistency with existing metadata structure

### Glass Tile UI Styling

For glass tile components in the Archive Notes:
- **Label positioning**: Set `left: 60%` with `transform: translateX(-50%)` for perfect center alignment
- **Hover effect**: Labels should float up from the centered position with smooth animation
- **Glass effect**: Maintain the 3D rotation and blur effects from GlassIcons.css
- **Color gradients**: Use the predefined gradient mapping (blue, purple, orange) for different categories

## Pre-Commit Checklist

- 检查 `git status --short`、`git diff` 和 `git diff --stat`。
- 确认只包含当前任务修改，没有 secrets、调试日志、缓存或意外生成文件。
- 运行必要测试、Lint 和构建；明确说明未运行项。
- commit 或 push 前确认已获得用户明确授权。

## Current Production Snapshot

**注意：以下为当前状态快照，未来 AI 操作前必须重新验证。**

### Git
- 当前 main HEAD：`d749261` (fix: handle profile API error state in Header)
- 最近 PR：#6 (feat: add Personal Space profile experience) 已合并
- Merge commit：`2d4b81a`

### Supabase
- Project ref：`fgeiygcycxjlqgbczrfs`
- 已应用 migrations：
  - `20260704224500_create_interactions.sql`
  - `20260705000100_create_profiles.sql`
- `public.profiles` 表结构：
  - `user_id` (PK, FK auth.users)
  - `display_name` (not null, 1-80 chars)
  - `avatar_key` (not null, regex `^avatar-[0-9]{2}$`)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
- RLS：enabled，anon/authenticated 无表权限
- Triggers：`profiles_sync_comment_author_name` (sync comment author names on profile update)

### Worker
- Name：`seiya-digital-journal-api`
- Production URL：`https://seiya-digital-journal-api.seiya-api.workers.dev`
- 最近部署版本：`e5cdfd1f-7be4-4978-923c-189916573978`
- 当前 endpoints：
  - `GET /api/health`
  - `GET /api/comments` (with targetType, targetId, limit)
  - `POST /api/comments` (authenticated)
  - `DELETE /api/comments/:id` (authenticated)
  - `GET /api/likes/count` (with targetType, targetId)
  - `GET /api/likes/me` (authenticated, with targetType, targetId)
  - `PUT /api/likes` (authenticated)
  - `DELETE /api/likes` (authenticated)
  - `GET /api/profile/me` (authenticated)
  - `PATCH /api/profile/me` (authenticated)

### Profile / Personal Space
- Protected route：`#/profile`
- `ProfileProvider`：全局状态管理
- `GET /api/profile/me`：返回 profile + stats
- `PATCH /api/profile/me`：更新 display_name 和 avatar_key
- Avatar keys：`avatar-01` 到 `avatar-09`，默认 `avatar-01`
- Canonical identity source：`profiles.display_name`（不是 `user.user_metadata.display_name`）
- Lazy bootstrap：duplicate-safe / idempotent（SELECT → missing → conflict-safe INSERT → re-SELECT）
- Comment display-name sync：通过 `profiles_sync_comment_author_name` trigger 同步历史 comments
- Header behavior：
  - Loading：neutral placeholder（不是 avatar-01）
  - Loaded：real saved avatar
  - Error：neutral placeholder（不是永久 skeleton）
- Back button：`history.back()` with `#/` fallback（简单 history behavior）

### Account Menu
- Desktop：account chip with popover（使用 `aria-expanded`、`aria-controls`，非 ARIA menu pattern）
- Mobile：account summary with Profile/Sign out buttons
- Avatar picker：`role="group"` with `aria-pressed`（非 `role="listbox"`）

### Sign-out Flow
- 从 protected `#/profile` 显式 sign out：
  1. 离开 protected route（`window.location.hash = preSignOutRoute`）
  2. 清 auth return target
  3. `signOut()`
- 不依赖 `await requestAnimationFrame(...)` 作为 correctness 前提

### High-Risk Areas

- Auth return target：确保在 sign-out 前正确保存和清空
- ProfileProvider race protection：不要破坏 `requestIdRef`、`updateRequestIdRef`、`activeUserIdRef`
- Canonical display name：确保 runtime identity 使用 `profiles.display_name`
- Lazy bootstrap concurrency：保持 duplicate-safe / idempotent
- Service role：绝不能把 `SUPABASE_SERVICE_ROLE_KEY` 暴露到 frontend
- Migration history：不要重复应用已存在的 migrations
- GitHub Pages base path：保持 `/seiya-digital-journal/`

### Current Known Non-Blocking Issues

- Large JS chunk warning：与 Three.js / bundle 相关，非 Profile blocker

### Visual / Browser Verification Rules

- UI 变更必须由用户手动检查
- 不要声称已执行但未实际执行的命令
- 不要声称已验证但未实际打开浏览器的检查
- 区分 user-performed manual verification 和 Claude-performed automated verification
