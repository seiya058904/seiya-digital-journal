# Visual Archive — Image Entry Specification

Review existing Visual Archive entries against this specification and, when available, their source images.

---

## 1. Task

For each entry:

1. Validate every field.
2. Fix only fields that are invalid, inconsistent, or clearly unsupported.
3. Preserve valid content exactly whenever possible.
4. Output only the final entry blocks.

If an entry is already valid, output it unchanged.

### Non-negotiable rules

- Do **not** rewrite valid wording merely because another version seems better.
- Do **not** invent facts not visible in the image or explicitly provided by the user.
- Never guess user ownership, city, exact location, identity, artist, brand, event, building, artwork name, medium, or style.
- If a source image is unavailable, preserve valid image-dependent fields instead of guessing.

---

## 2. Exact Output Format

```ts
// 中文名：{图片的中文文件名，不含扩展名}
{
  id: '{category}-{NNN}',
  category: '{category}',
  city: {city or null},
  title: '{title}',
  caption: '{caption}',
  note: '{note}',
  image: '{derived image path}',
  thumb: '/visual-archive/thumbs/{id}-thumb.webp',
  mediaType: 'image',
  aspect: '{portrait|landscape|square}',
  tags: ['tag-1', 'tag-2', 'tag-3'],
  featured: {true|false},
  alt: '{alt}',
},
```

Output rules:

- Preserve the `// 中文名：` comment and source filename when available.
- Never add, remove, rename, or reorder fields.
- Use single-quoted TypeScript strings; escape internal apostrophes as `\'`.
- Keep trailing commas exactly as shown.
- For multiple entries, output blocks consecutively with no text between them.
- Output no explanations, warnings, headings, commentary, or Markdown fences.

---

## 3. Field Rules

### `id`

Format: `{category}-{NNN}`, where `NNN` is exactly three digits.

- Preserve any existing valid ID whose prefix matches the corrected `category`.
- Never renumber a valid ID merely because the batch starts elsewhere.
- Replace an ID only if missing, malformed, duplicated within the output batch, or incompatible with a corrected category.
- Replacement placeholders start at `001` separately per category, increase in output order, and skip numbers already used in the batch.
- Do not infer archive-wide numbering.

### `category`

Allowed values only:

- `editorial` — real-world photography not qualifying as `memory`; objects, still life, daily life, generic places, architecture
- `memory` — a real travel photo personally taken by the user in an allowed city; primary subject is place, street, landmark, scenery, or travel moment
- `illustration` — digital art, anime, fan art, pixel art, concept art, sketches
- `art` — traditional or fine art as the primary work or subject, including paintings and sculpture
- `design` — graphic design, posters, typography, product design

For ambiguous cases, use this precedence:

`design` → `illustration` → `art` → `memory` → `editorial`

`memory` requires known user ownership **and** a supported city. Downloaded, stock, found, historical, or AI-generated city images are never `memory`. A recognizable city alone is insufficient. If ownership or supported city is uncertain, use `editorial` rather than guessing.

### `city`

Allowed values only:

```ts
'Chongqing' | 'Chengdu' | 'Wuhan' | 'Kaifeng' | 'Tianjin' | 'Emeishan' | 'Venice' | null
```

- `memory` requires one allowed non-null city.
- Every non-`memory` entry requires `null`.
- Never infer a city from vague resemblance.

### `title`

- 2–4 English words
- Title Case for major words
- short, poetic, evocative
- expresses mood, metaphor, tension, memory, or abstraction
- must not merely name visible objects or restate the scene

Good: `Quiet Float`, `Vivid Mortality`, `Underground Current`.

Bad: `Yellow Duck in Pool`, `Panda Eating Bamboo`.

### `caption`

- exactly one English sentence
- 10–20 words
- complete subject + verb
- ends with a period
- reflective, philosophical, or journal-like
- describes meaning, not merely visible content
- third-person or universal perspective
- no first person (`I`, `we`, `my`, `our`)
- no framing such as `This image shows...` or `This is...`
- em dash (`—`) allowed

### `note`

Use exactly one approved value; never invent new notes:

| Note | Primary cue |
|---|---|
| 安静 | calm, stillness |
| 远方 | distance, mountains, aspiration |
| 信念 | conviction, determination, warriors |
| 温柔 | softness, care, gentle imagery |
| 烟火 | food, warmth, social life, daily joy |
| 城市 | urban landscape, city architecture |
| 凝视 | portrait, gaze, being watched |
| 黄昏 | sunset, evening, dusk |
| 力量 | intensity, power, strength |
| 回声 | heritage, ruins, age, nostalgia |
| 片刻 | fleeting beauty, brief detail |
| 观察 | architecture, visual observation |
| 夜色 | night, darkness, city lights |
| 旅途 | journey, travel, movement |
| 信仰 | temple, sacred, spiritual |
| 深渊 | dark fantasy, heavy darkness |
| 治愈 | comfort, healing, cute animals |
| 灵感 | creativity, surreal invention |
| 幻想 | fantasy, imaginary worlds |
| 经典 | timeless, iconic feeling |
| 静谧 | serene, meditative still life |
| 探索 | discovery, science, space, unknown |

Choose the closest cue when no option is perfect.

### `image`

Deterministic from corrected values:

- non-`memory`: `/visual-archive/{category}/{id}.webp`
- `memory`: `/visual-archive/memory/{city}/{id}.webp`

If `category`, `city`, or `id` changes, update `image`.

### `thumb`

Always:

`/visual-archive/thumbs/{id}-thumb.webp`

If `id` changes, update `thumb`.

### `mediaType`

Always `'image'`.

### `aspect`

Use source dimensions when available:

- `portrait` if `height / width > 1.10`
- `landscape` if `width / height > 1.10`
- `square` otherwise

If exact dimensions are unavailable but the image is visible, use the visible frame. If neither is available, preserve an existing valid value.

### `tags`

- 3–6 unique tags
- lowercase only
- multi-word tags use hyphens, never spaces
- first tag = primary visible subject
- middle tags = grounded subject, medium, style, setting, or mood descriptors
- last tag = exact taxonomy anchor:
  - non-`memory`: category name
  - `memory`: lowercase city name
- use only visible or explicitly provided information
- avoid generic tags: `image`, `photo`, `picture`, `beautiful`, `nice`, `artwork`, `visual`

Examples:

```ts
['rubber-duck', 'pool', 'minimal', 'summer', 'editorial']
['skull', 'oil-painting', 'colorful', 'dark', 'art']
['street', 'night', 'neon', 'chongqing']
```

### `featured`

Boolean only: `true` or `false`.

Use `true` for clear standouts in composition, emotional impact, uniqueness, visual quality, or meaningful variety. Use `false` for repetitive, simple, weaker, or less distinctive images.

About 50–60% `true` is a **soft batch target, not a quota**. Do not change a reasonable existing value solely to force the ratio. When genuinely balanced, choose the value that improves batch variety rather than defaulting all entries the same way.

### `alt`

- 8–15 English words
- objective, neutral, concrete
- present-tense description of visible content only
- include the main subject plus important setting, color, action, or composition details
- no symbolism, interpretation, emotional judgment, or inferred backstory
- avoid openings such as `Image of`, `Photo of`, `Picture of`, or `This is`

Good: `Yellow rubber duck floats in a turquoise tiled pool with water ripples.`

---

## 4. Required Consistency

After correction, enforce all relationships:

- `id` prefix = `category`
- IDs unique within output batch
- `memory` → allowed non-null `city`
- non-`memory` → `city: null`
- `image` derived from corrected `category`, `city`, and `id`
- `thumb` derived from corrected `id`
- non-`memory` → final tag = category
- `memory` → final tag = lowercase city
- `mediaType: 'image'`

Dependent fields must be updated whenever their source field changes.

---

## 5. Silent Final Check

Before outputting, verify silently:

- exact syntax, field order, comment, and trailing commas
- valid category/city relationship and unique ID
- title: 2–4 words, Title Case, non-literal
- caption: 10–20 words, one complete reflective sentence ending with `.`
- approved note only
- deterministic `image` and `thumb` paths
- correct `mediaType`
- evidence-based aspect
- 3–6 unique lowercase hyphenated tags with correct final anchor
- boolean `featured`
- alt: 8–15 words, objective visible content
- no unsupported invented facts
- no extra output text
