# Visual Asset Layout Audit / 视觉素材编排审计

**日期:** 2026-07-01
**项目:** seiya-digital-journal
**审计范围:** art picture/ · picture/ · public/ · src/assets/ · public/gallery/

---

## 1. 总结

当前网站有 **4 个图片来源**，共约 **110 个文件**（约 637 MB），结构分散、大量文件尚未进入页面。

**核心发现：**

- **public/gallery/** 现有 6 张抽象 WebP 图（尺寸极大但压缩优秀，每张仅 27-65KB），可直接继续使用
- **art picture/** 有 31 张精选视觉图（每张 < 310KB），适合扩充 Gallery 和 Motion Lab demo
- **picture/** 有 73 张生活照（总量 632 MB，大量文件 > 10MB），需要严格筛选，只取 3-6 张高质量的做点缀
- **头像已备好**（1122×1402 PNG 1.88MB，4:5 完美比例），只需转 WebP 接入
- **OG 图已就位**（public/og-image.png 1.8MB），建议转 WebP 压缩
- 当前 Gallery 数据模型（`GalleryItem`）需要扩展以支持多分类

**最大问题：** picture/ 中大量照片体积过大（单张最高 17MB），直接放入网站会严重拖慢加载速度。必须筛选 + WebP 压缩。

---

## 2. 图片资产总览

| 文件夹 | 文件数 | 格式 | 总大小 | 用途 |
|---|---|---|---|---|
| `public/gallery/` | 6 | WebP | 269 KB | ✅ 已在首页展示的抽象视觉图 |
| `public/` | 2 | SVG + PNG | 1.8 MB | favicon + OG 分享图 |
| `src/assets/` | 1 | SVG | 1.6 KB | Hero 头像占位符 |
| `art picture/` | 31 | JPEG | 3.8 MB | 精选视觉图、品牌氛围图 |
| `picture/` | 73 | JPEG + HEIC | 632 MB | 生活照、旅行照 |
| **总计** | **113** | — | **~638 MB** | — |
| 头像（未入库） | 1 | PNG | 1.88 MB | `d:\下载\ChatGPT Image 2026年7月1日 18_09_46.png` |

### 2.1 public/gallery/ 现有图片

| 文件 | 尺寸 | 文件大小 | 比例 | 当前 shape | 建议保留？ |
|---|---|---|---|---|---|
| `aurora.webp` | 5438×4394 | 40 KB | 1.24:1 (横) | portrait ❌ 应是 landscape | ✅ 保留 |
| `horizon.webp` | 5438×4394 | 28 KB | 1.24:1 (横) | landscape ✅ | ✅ 保留 |
| `motion.webp` | 5438×4650 | 65 KB | 1.17:1 (横) | landscape ✅ | ✅ 保留 |
| `reflection.webp` | 5438×4650 | 32 KB | 1.17:1 (横) | square ❌ 应是 landscape | ✅ 保留 |
| `geometry.webp` | 5438×4650 | 49 KB | 1.17:1 (横) | portrait ❌ 应是 landscape | ✅ 保留 |
| `future.webp` | 5438×4650 | 55 KB | 1.17:1 (横) | landscape ✅ | ✅ 保留 |

**注意：** 6 张图实际都是横图（宽>高），但 `gallery.ts` 中 `shape` 字段有 3 个标注不准确（aurora=portrait, reflection=square, geometry=portrait）。建议修正 shape 为 `landscape` 或根据 CSS 裁切需求重新分配。

### 2.2 头像（待接入）

| 来源 | 尺寸 | 文件大小 | 格式 | 比例 |
|---|---|---|---|---|
| `d:\下载\ChatGPT Image 2026年7月1日 18_09_46.png` | **1122×1402** | **1.88 MB** | PNG | **4:5 ✅ 完美** |

### 2.3 OG 图（已接入）

| 位置 | 尺寸 | 文件大小 | 格式 |
|---|---|---|---|
| `public/og-image.png` | 未知 | **1.83 MB** | PNG |

---

## 3. art picture/ 分类结果

*31 张图，全部 JPEG，736px 宽（少数例外），3.8 MB 总量。无法查看内容，以下分类基于文件名 + 尺寸推断。*

### Visual Works（适合作为视觉作品展示）
根据文件名和常见的 Pinterest 抽象图特征，以下图片尺寸和比例适合作为 gallery 视觉作品：

| 文件 | 尺寸 | 大小 | 推荐原因 |
|---|---|---|---|
| `1040894532664547951.jpg` | 736×1308 | 187 KB | 竖图构图，适合 portrait 卡片 |
| `1045961082208971392.jpg` | 600×1200 | 124 KB | 竖图，比例好 |
| `1105704146044106871.jpg` | 605×1080 | 148 KB | 竖图 |
| `1122311169735531598.jpg` | 736×1041 | 146 KB | 适中竖图 |
| `1125548131900489765.jpg` | 736×981 | 44 KB | 接近方图 |
| `1135259018619160556.jpg` | 736×1308 | 60 KB | 竖图 |
| `331718328811088589.jpg` | 453×1123 | 38 KB | 窄竖图 |
| `375909900170093701.jpg` | 675×1200 | 33 KB | 竖图 |
| `456622849736208585.jpg` | 736×1469 | 304 KB | 超长竖图 |
| `661818107785025420.jpg` | 736×1308 | 30 KB | 竖图 |
| `720716746678965958.jpg` | 736×1472 | 250 KB | 超长竖图 |
| `753367843955605197.jpg` | 736×1308 | 100 KB | 竖图 |
| `757871443582037002.jpg` | 554×1200 | 170 KB | 竖图 |
| `759278818471984149.jpg` | 736×1526 | 303 KB | 超长竖图 |
| `770960030004026094.jpg` | 736×736 | 86 KB | 方图 |
| `786300416233110234.jpg` | 736×1504 | 141 KB | 超长竖图 |
| `824299538084764911.jpg` | 736×1307 | 184 KB | 竖图 |
| `834854849688699049.jpg` | 736×1245 | 161 KB | 竖图 |
| `856880266642914801.jpg` | 736×1596 | 193 KB | 超长竖图 |
| `857091372840604580.jpg` | 736×1505 | 194 KB | 超长竖图 |
| `888898045217064624.jpg` | 736×1308 | 147 KB | 竖图 |
| `996280748809854862.jpg` | 736×1113 | 136 KB | 竖图 |
| `F1.jpg` | 675×1200 | 75 KB | 竖图（赛车主题） |
| `Lifestyle .jpg` | 736×1235 | 101 KB | 竖图 |

### Background / Texture（适合作为背景、纹理、氛围图）

| 文件 | 尺寸 | 大小 | 推荐原因 |
|---|---|---|---|
| `Green Phone Wallpapers _ Fresh and Calming Backgrounds for Your Screen.jpg` | 600×1200 | 54 KB | 壁纸风格，适合背景素材 |
| `Azul profundo e paz….jpg` | 600×1200 | 61 KB | 深蓝/安宁主题，适合氛围图 |

### Not recommended（不建议使用）

| 文件 | 尺寸 | 大小 | 原因 |
|---|---|---|---|
| `☆ kayla.jpg` | 736×981 | 162 KB | 疑似他人肖像，可能涉及版权或隐私 |
| `438326976236202162.jpg` | 248×546 | 19 KB | 分辨率过低，不适合任何位置 |
| `576883033506831114.jpg` | 500×500 | 103 KB | 小尺寸方图，质量一般 |
| `Snoopy.jpg` | 675×1200 | 93 KB | 卡通角色图（史努比），与杂志风格不匹配 |

### Motion Lab Support（适合作为 Motion Lab demo 素材）

任何一张 visual works 中的竖图都可以用作 Motion Lab 中的 Stack / BounceCards / ImageTrail demo 素材。建议选 5-6 张色调一致的。

---

## 4. picture/ 分类结果

*73 张照片，632 MB 总量。大量文件 > 10MB，无法查看内容，以下分类基于文件名 + 尺寸 + 日期推断。*

### 文件体积分布

| 大小范围 | 文件数 | 说明 |
|---|---|---|
| < 5 MB | ~28 张 | 较小文件，可能是缩略图或旧手机拍摄 |
| 5-10 MB | ~15 张 | 中等大小 |
| 10-15 MB | ~25 张 | 大文件，高像素手机直出 |
| > 15 MB | ~5 张 | 超大文件（最大 17MB） |

### 按拍摄时间分组

| 时间 | 文件数 | 前缀 | 推测场景 |
|---|---|---|---|
| 2026-03-05 ~ 2026-03-11 | 6 张 | `IMG_202603*` | 一组早期拍摄 |
| 2026-03-07 | 2 张 | `IMG20260307*` | 同日拍摄 |
| 2026-03-10 | 3 张 | `IMG20260310*` | 同日拍摄 |
| 2026-05-28 ~ 2026-05-31 | 7 张 | `IMG202605*` | 五月末系列拍摄 |
| 无日期信息 | 55 张 | `178288*` | 可能是手机相册导出（HEIC + JPG 双格式） |

### 分类（基于文件名推断，无法实际查看内容）

| 类别 | 入选文件（示例） | 数量 | 说明 |
|---|---|---|---|
| **Life Fragments**（视觉日志） | 构图较好、光影有特色的照片 | ~10-15 张 | 适合 gallery 小卡片点缀 |
| **Study / Growth**（学习成长） | 书桌、电脑、学习场景 | ~3-5 张 | 适合 About / Journey 配图 |
| **Travel / Exploration**（旅行探索） | 户外、风景、街拍 | ~5-8 张 | 适合 Journey 阶段配图 |
| **Personal Mood**（自我状态） | 自拍、情绪向 | ~3-5 张 | 适合 About 区域点缀 |
| **Not recommended** | 模糊、重复、隐私风险 | ~40-50 张 | 不建议使用 |

**关于 HEIC 格式：** 19 张 HEIC 文件无法在 Web 中直接使用，必须先转为 JPEG 或 WebP。

### 发现的重复

| 重复组 | 文件 |
|---|---|
| 完全相同的文件 | `1782882228248 (2).jpg` 和 `1782882228248.jpg`（均为 5,039 KB） |

---

## 5. 推荐进入首页的 12–18 张图片

### 精选方案

基本原则：
- 保持 dark editorial magazine 调性
- Visual Works 为主（8-10 张），Life Fragments 点缀（2-3 张），Project Moments（1-2 张）
- 横图用 landscape 卡片、竖图用 portrait、方图用 square

| # | 建议来源 | 分类 | 建议位置 | 卡片尺寸 | 建议标题（英文） | 建议中文 note | 是否需要压缩 |
|---|---|---|---|---|---|---|---|
| 1 | public/gallery/aurora.webp ✅ 已存在 | Visual Works | Gallery featured | landscape | A light that keeps moving | 微光 | ✅ 已有 WebP |
| 2 | public/gallery/horizon.webp ✅ 已存在 | Visual Works | Gallery featured | landscape | Looking beyond the known | 远方 | ✅ 已有 WebP |
| 3 | public/gallery/motion.webp ✅ 已存在 | Visual Works | Gallery | landscape | Momentum, held softly | 流动 | ✅ 已有 WebP |
| 4 | public/gallery/reflection.webp ✅ 已存在 | Visual Works | Gallery | square* | A clearer inner signal | 映照 | ✅ 已有 WebP |
| 5 | public/gallery/geometry.webp ✅ 已存在 | Visual Works | Gallery | landscape | Structure becomes expression | 秩序 | ✅ 已有 WebP |
| 6 | public/gallery/future.webp ✅ 已存在 | Visual Works | Gallery featured | landscape | Still becoming | 未来 | ✅ 已有 WebP |
| 7 | art picture/ 精选竖图 1 | Visual Works | Gallery | portrait | (custom title) | (custom) | 需要（JPEG→WebP） |
| 8 | art picture/ 精选竖图 2 | Visual Works | Gallery | portrait | (custom title) | (custom) | 需要（JPEG→WebP） |
| 9 | art picture/ 精选竖图 3 | Visual Works | Gallery | portrait | (custom title) | (custom) | 需要（JPEG→WebP） |
| 10 | art picture/ 精选竖图 4 | Visual Works | Gallery | portrait | (custom title) | (custom) | 需要（JPEG→WebP） |
| 11 | art picture/ 方图 | Visual Works | Gallery | square | (custom title) | (custom) | 需要（JPEG→WebP） |
| 12 | picture/ 精选生活照 1 | Life Fragment | Gallery inset | small | (custom title) | (custom) | **必须**（原始 > 5MB → WebP） |
| 13 | picture/ 精选生活照 2 | Life Fragment | Gallery inset | small | (custom title) | (custom) | **必须**（原始 > 5MB → WebP） |
| 14 | picture/ 精选生活照 3 | Life Fragment | Gallery / About | portrait | (custom title) | (custom) | **必须**（原始 > 5MB → WebP） |
| 15 | picture/ 学习/工作照（如有） | Project Moment | Journey | small | (custom title) | (custom) | **必须**（原始 > 5MB → WebP） |
| 16 | picture/ 旅行照（如有优秀） | Travel | Journey | landscape | (custom title) | (custom) | **必须**（原始 > 5MB → WebP） |

*\* reflection.webp 的 shape 建议改为 landscape 而非 square，或者 CSS 层面做 square 裁切*

### 关于选图的具体说明

由于我无法查看图片的实际内容，以上列表中的 `art picture/` 和 `picture/` 的具体选图需要你**人工筛选**后告诉我编号。选区标准：

**从 art picture/ 选图标准：**
- 色调偏暗/冷色优先（符合 dark editorial 风格）
- 抽象、几何、光影题材优先
- 排除低分辨率、卡通、他人肖像

**从 picture/ 选图标准：**
- 质量最高、构图最好的 3-5 张
- 优先选有人物氛围感、但不要纯自拍
- 优先选学习 / 创作 / 旅行场景
- 排除模糊、重复、过度私密的照片

---

## 6. 不建议使用的图片

### art picture/

| 文件 | 原因 |
|---|---|
| `☆ kayla.jpg` | 文件名暗示是他人肖像，可能涉及版权或隐私 |
| `438326976236202162.jpg` | 仅 248×546px，分辨率太低，放大后模糊不可用 |
| `576883033506831114.jpg` | 500×500px 小方图，且 103KB 对这个小尺寸来说压缩不佳 |
| `Snoopy.jpg` | 卡通角色（史努比），与 dark editorial magazine 风格冲突 |
| 其余 26 张 | 均可用，但需要你目视筛选最终的 4-6 张 |

### picture/

| 原因 | 预计数量 |
|---|---|
| 严格重复（完全相同的文件） | 1 对（`1782882228248.jpg` 双份） |
| 手机连拍导致的相似内容 | ~5-10 组 |
| 构图普通、无叙事价值的随手拍 | ~20-30 张 |
| HEIC 格式无法直接使用（需转码） | 19 张 |
| 隐私风险（露脸/家庭内部/定位信息） | 需要你自己判断 |
| **建议最多取** | **3-6 张** |

### 使用原则

> 生活照在 dark editorial 杂志风网站中应该是 **精心挑选的点缀**，而不是 **相册的搬运**。宁缺毋滥。

---

## 7. 新 Gallery / Visual Archive 编排方案

### 7.1 分类结构

建议将 Gallery 改名为 **Visual Archive**（视觉档案），下设三个隐式分类（不需要 tab/ filter，用视觉节奏区分）：

```
Visual Archive
├── Featured (2-3 张大卡片，横图，首屏展示)
├── Visual Works (6-8 张中卡片，混合 landscape / portrait / square)
└── Fragments (2-4 张小卡片，含生活照点缀，放在底部)
```

### 7.2 第一屏展示（Featured）

| 推荐图片 | 布局 |
|---|---|
| aurora.webp | 首张大 landscape 卡，占 2 列 |
| future.webp | 右侧 portrait 卡，占 1 列 |
| 下方：horizon.webp + 精选 art picture | 均等 landscape 卡 |

### 7.3 是否需要 tab / filter

**不建议。** 当前封面布局（6 张马赛克流式排列）本身就是杂志式的视觉节奏，加入 tab 会破坏简洁性。如果需要区分类型，可以用 CSS 视觉区分（featured 大卡 vs 小卡），而不是 UI 控件。

### 7.4 是否保留当前 6 张图

**是，保留全部 6 张。** 它们是高质量的 WebP 抽象艺术图，压缩优秀（共 269KB），且已与 BorderGlow / GlareHover 效果配合良好。只需要：

1. 修正 `gallery.ts` 中 `shape` 字段的真实比例
2. 根据需要加入 `category` 字段以支持分类
3. 扩充到 10-12 张（补充 art picture 的精选竖图）

### 7.5 是否替换现有 public/gallery/ 图片

**否。** 现有 6 张 WebP 品质足够好，与 magazine 风格匹配。新图片以追加方式加入。

### 7.6 建议的数据结构扩展

```typescript
export type GalleryItem = {
  theme: string
  image: string
  title: string
  caption: string
  note: string
  shape: 'portrait' | 'landscape' | 'square'
  // 新增字段：
  category: 'featured' | 'visual' | 'fragment'  // 分类
  source?: 'art' | 'life' | 'project'            // 来源（可选，用于未来筛选）
}
```

---

## 8. About / Journey 如何使用生活照

### 8.1 About Section

| 建议 | 说明 |
|---|---|
| **不推荐放生活照** | About 目前是纯文字排版 + AnimatedContent 入场动效，插入图片会破坏文字节奏 |
| **如果用** | 只在 `about-grid__statement` 区域加一张极小的点缀图（作为背景装饰），不可抢文字风头 |
| **推荐** | 保持纯文字，依靠排版和动画营造质感 |

### 8.2 Journey Section

| 建议 | 说明 |
|---|---|
| **适合放 1-2 张生活照** | Journey 的 timeline 布局可以容纳图片作为每个 milestone 的视觉锚点 |
| **推荐位置** | "Growing" 阶段配一张学习/工作场景照，"Next" 阶段配一张旅行/探索照 |
| **格式** | 小尺寸 landscape 卡，放在 milestone 文字下方，不可遮挡文字 |
| **不建议** | 在 "Now" 阶段放照片（当前阶段正在发生，用文字比图片更诚实） |

### 8.3 生活照使用总原则

- 总数量控制在 **3-5 张以内**（整个首页）
- 照片必须经过 WebP 压缩 + 调整到合理展示尺寸
- 照片应与旁边的文字有 **语义关联**，不为了放照片而放照片
- 优先使用 **场景照**（学习、创作、探索），**其次氛围照**（光影、风景），**避免纯自拍**

---

## 9. 技术实现建议

### 9.1 图片存放位置

| 用途 | 建议位置 | 原因 |
|---|---|---|
| Hero 头像 | `src/assets/` | 由 Vite 处理 hash 和缓存，且只在一处引用 |
| Gallery 展示图 | `public/gallery/` | 需要直接 URL 引用，数量多，适合放在 public |
| OG 分享图 | `public/` | 需要固定 URL 供社交平台抓取 |
| favicon | `public/` | 浏览器直接访问 |

### 9.2 文件命名规范

建议统一为 kebab-case 英文命名：

```
public/gallery/
├── aurora.webp          ✅ 保留
├── horizon.webp         ✅ 保留
├── motion.webp          ✅ 保留
├── reflection.webp      ✅ 保留
├── geometry.webp        ✅ 保留
├── future.webp          ✅ 保留
├── abstract-01.webp     ✏️ 新图（从 art picture 选）
├── abstract-02.webp     ✏️ 新图
├── fragment-study.webp  ✏️ 生活照
└── fragment-travel.webp ✏️ 生活照

src/assets/
├── profile-avatar.webp  ✏️ 头像（替换 placeholder.svg）
└── profile-placeholder.svg  ✅ 保留（作为 fallback）

public/
├── favicon.svg          ✅ 保留
├── og-image.webp        ✏️ 建议将当前 PNG 转 WebP
```

### 9.3 WebP 压缩建议

| 来源 | 原始大小 | 压缩后目标 | 工具 |
|---|---|---|---|
| 头像（1122×1402 PNG） | 1.88 MB | **< 100 KB** | `npx sharp-cli` 或 `cwebp` |
| OG 图（PNG） | 1.83 MB | **< 200 KB** | `npx sharp-cli` 或 `cwebp` |
| picture/ 生活照 | 5-17 MB 每张 | **< 150 KB 每张** | 先缩放到 1600px 宽，再转 WebP |
| art picture/ 新图 | 30-310 KB 每张 | **< 80 KB 每张** | 直接转 WebP，可以保持质量 |

**压缩后全站图片新增总量预估：** < 2 MB（含 6 张新 gallery 图 + 头像 + OG）

### 9.4 是否需要生成 gallery manifest

暂时不需要。当前 Gallery 的数据已经在 `src/data/gallery.ts` 中管理，直接扩展该文件即可。

### 9.5 是否需要新增 data 字段

是的。建议在 `GalleryItem` 类型中新增：

```typescript
export type GalleryItem = {
  theme: string
  image: string
  title: string
  caption: string
  note: string
  shape: 'portrait' | 'landscape' | 'square'
  // 新增：
  category: 'featured' | 'visual' | 'fragment'
}
```

同时更新对应组件 `GalleryCard.tsx` 中的渲染逻辑来根据 `category` 选择不同的 CSS class（如 `gallery-item--featured` 等）。

---

## 10. 下一步实施计划

### P0 — 必须先处理

| # | 任务 | 说明 |
|---|---|---|
| 1 | 将头像转为 WebP 放入 `src/assets/` | 1122×1402 PNG → WebP，目标 < 100KB |
| 2 | 更新 `Hero.tsx` 头像引用 | import 从 placeholder.svg → avatar.webp，更新 alt 文本 |
| 3 | 将 OG 图转为 WebP | `public/og-image.webp`，目标 < 200KB，更新 index.html meta 引用 |

### P1 — 第一轮可以填

| # | 任务 | 说明 |
|---|---|---|
| 4 | 人工筛选 art picture/ 的 4-6 张最佳视觉图 | 需要你目视选择后告诉我编号 |
| 5 | 人工筛选 picture/ 的 2-4 张最佳生活照 | 需要你目视选择后告诉我编号 |
| 6 | 将选中图片压缩为 WebP 放入 `public/gallery/` | 新文件命名如 `abstract-01.webp` 等 |
| 7 | 扩展 `src/data/gallery.ts` | 加入新图片条目 + category 字段 |
| 8 | 修正现有 6 张图的 shape 字段 | landscape 纠正为准确值 |

### P2 — 后续增强

| # | 任务 | 说明 |
|---|---|---|
| 9 | Gallery 布局微调 | 根据 category 分配不同 CSS class（featured 大卡、fragment 小卡） |
| 10 | 更新 GalleryCard.tsx 渲染逻辑 | 支持 category 区分 |
| 11 | 考虑在 Journey 中加入 1-2 张生活照 | 小尺寸点缀，语义关联 |
| 12 | favicon 自定义 | 替换为个人标志 |
| 13 | picture/ 其余照片整理 | 删除重复文件、HEIC 转码归档 |

### P3 — 暂时不要做

| # | 任务 | 原因 |
|---|---|---|
| 14 | Gallery tab/filter 切换 | 破坏杂志流式布局；3 个分类不够多到需要 filter |
| 15 | 生活照大量涌入首页 | 会稀释 visual archive 的调性 |
| 16 | 图片懒加载库替换 | 当前 loading="lazy" + decoding="async" 已经足够 |
| 17 | About 区域加图 | 文字节奏更重要，加图可能破坏 AnimatedContent 的入场效果 |

---

## 附录：当前代码中的 shape 不一致

现有 `public/gallery/` 6 张图全部是横图（宽 > 高），但 `gallery.ts` 中标注了 3 个不同的 shape 值：

| 图片 | 实际比例 | 当前 shape | 建议 shape |
|---|---|---|---|
| aurora.webp | 5438×4394 (~1.24:1) | portrait ❌ | landscape |
| horizon.webp | 5438×4394 (~1.24:1) landscape ✅ | landscape | landscape |
| motion.webp | 5438×4650 (~1.17:1) | landscape ✅ | landscape |
| reflection.webp | 5438×4650 (~1.17:1) | square ❌ | landscape |
| geometry.webp | 5438×4650 (~1.17:1) | portrait ❌ | landscape |
| future.webp | 5438×4650 (~1.17:1) | landscape ✅ | landscape |

如果 CSS 层面希望某些图以裁切方式展示为 portrait/square，则 shape 可以保持，但这需要在 CSS 中明确处理 `object-fit: cover`。
