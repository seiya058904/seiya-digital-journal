# Repository Guidelines

## Project Overview

这是一个纯客户端个人数字日志，使用 React 19、TypeScript、Vite 8、Framer Motion 和 Three.js 相关库。启动链路为 `index.html` → `src/main.tsx` → `src/App.tsx`；`App.tsx` 根据 URL hash（如 `#/archive`、`#/gallery`、`#/motion-lab`）切换页面。`npm run build` 将静态站点输出到 `dist/`；`.github/workflows/deploy.yml` 会在推送到 `main` 后使用 Node 22 构建并部署到 GitHub Pages。

## Project Structure & Module Organization

- `src/pages/`：首页、Archive 子页面、Gallery 和 Motion Lab。
- `src/components/sections/`：首页章节；`ui/`：共享界面组件。
- `src/components/motion/`、`effects/`：动效、WebGL 效果及 React Bits 组件；修改时保留降级与 reduced-motion 行为。
- `src/data/`：个人资料、链接、文字、效果清单和视觉档案等结构化内容。
- `src/styles/tokens.css`：设计变量；`global.css` 与各页面/组件 CSS：全局及局部样式。
- `src/assets/`：由代码导入的资源；`public/`：按原路径直接发布的图片、演示和视觉档案。
- `scripts/trace-image.mjs`：图片引用追踪脚本。测试与被测模块相邻，命名为 `*.test.ts`。

## Architecture Notes

应用没有 React Router，而由 `App.tsx` 集中解析 hash；新增或变更路由应同步检查导航和旧地址兼容。站点部署基路径固定为 `/seiya-digital-journal/`，引用 `public/` 资源时使用 `import.meta.env.BASE_URL`。当前仓库未发现服务端、数据库或迁移系统；不要把服务端凭据加入客户端代码。

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

## Commit & Pull Request Guidelines

近期历史采用 `feat:`、`fix:`、`refactor:`、`perf:`、`style:`、`chore:` 等 Conventional Commit 前缀。每个提交保持单一目的，摘要简短且明确。PR 应说明可见行为、复现或验证结果及未运行的检查；UI 变更附前后截图。不得提交 `dist/`、`node_modules/`、日志、缓存、原始图片目录、敏感文件或无关改动。

## Security & Configuration

不要提交环境变量文件、密钥、token、密码、私钥、数据库连接信息或本地配置；不要在客户端暴露服务端凭据，也不要把 secrets 写入文档、回复、日志或提交信息。遵守 `.gitignore`，不提交构建目录、缓存或临时文件。修改认证、权限、数据库、签名、生产配置、GitHub Pages 权限或计费相关内容前，先说明风险并获得用户授权。

## Agent-Specific Instructions

修改前读取相关文件并给出简短计划；优先最小、可审查的改动。不得顺手修改无关内容、覆盖用户未提交修改，或擅自改变功能、规则、数值、路由及兼容行为。不要编造命令、目录、接口或部署流程；不确定时停止并说明风险。未经授权，不安装依赖、不运行自动修复或全仓库格式化，不 commit、push、deploy、publish、创建 Release 或操作数据库。涉及生产、权限、secrets、数据完整性、签名或计费必须先获授权。测试失败或未运行时如实报告。

### Notes Vault Content Guidelines

When working on Archive Notes content:
- Follow length-based formatting rules:
  - **Short notes (150–500 words)**: Use chapter card layout
  - **Medium notes (500–1200 words)**: Can use chapter cards with a mini table of contents
  - **Long notes (1200+ words)**: Switch to article reading layout - avoid wrapping each paragraph in large cards
- Keep notes focused on identity, growth, thoughts, interests, and visual storytelling
- Match the existing glass tile UI pattern for folder display
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
