# Visual Archive — Image Entry Specification

This document tells an AI how to look at an image and write a data entry for the Visual Archive.

---

## Task

You will receive a batch of data entries written by the user. Review each entry against the format rules below. Fix any errors you find. Output only the corrected entries — no explanations, no commentary.

If all entries are correct, output them unchanged.

---

## Output Format

For each entry, output exactly this block. Fix any issues found, or output unchanged if correct:

```ts
{
  id: '{category}-{NNN}',
  category: '{category}',
  city: {city or null},
  title: '{title}',
  caption: '{caption}',
  note: '{note}',
  image: '/visual-archive/{path}/{id}.webp',
  thumb: '/visual-archive/thumbs/{id}-thumb.webp',
  mediaType: 'image',
  aspect: '{portrait|landscape|square}',
  tags: [{tags}],
  featured: {true|false},
  alt: '{alt}',
},
```

If processing multiple entries, output all blocks consecutively with no text between them.

---

## Field Rules

### id

Format: `{category}-{3-digit number}`

You will be told the next available number for each category. Use it and increment for each subsequent image.

Examples: `editorial-043`, `illustration-030`, `art-012`

### category

One of exactly these values:
- `editorial` — photography of non-specific places, still life, objects, daily life, architecture not tied to a specific city
- `memory` — **user's own travel photos** of specific cities (landmarks, streets, scenery the user personally visited and photographed). Requires `city` field
- `illustration` — digital art, anime, fan art, pixel art, concept art, sketches
- `art` — traditional paintings (oil, watercolor, acrylic), fine art, sculptures photographed
- `design` — graphic design, posters, product design, typography work

**Important:** `memory` is NOT for any photo that happens to depict a city. It is exclusively for photos the user took during their own travels. If a photo shows a city but was not taken by the user (e.g., a stock photo, artwork, or found image), use `editorial` instead.

### city

- Set to a city name **only** when `category` is `memory` AND the photo was taken by the user in that city
- Allowed values: `'Chongqing'`, `'Chengdu'`, `'Wuhan'`, `'Kaifeng'`, `'Tianjin'`, `'Emeishan'`, `'Venice'`, or `null`
- If the category is not `memory`, always set to `null` — even if the image depicts a recognizable city
- If you don't recognize the city, set to `null` and flag it

### title

**Style:** Short, poetic, evocative. Think of it as a gallery label.

**Rules:**
- 2–4 words
- Title Case (capitalize first letter of each major word)
- NEVER describe the image literally
- Use metaphor, mood, or abstract concept instead

**Good examples:**
- Image shows a rubber duck in a pool → `Quiet Float`
- Image shows a skull painting → `Vivid Mortality`
- Image shows a London subway → `Underground Current`
- Image shows a panda eating bamboo → `Bamboo Pause`

**Bad examples:**
- `Yellow Duck in Swimming Pool` (too literal)
- `Colorful Skull Oil Painting` (too descriptive)
- `London Underground Station` (not poetic)
- `Panda Eating Bamboo` (just restating the image)

### caption

**Style:** One complete English sentence. Philosophical, reflective, as if writing in a personal journal.

**Rules:**
- Must be a complete sentence (subject + verb)
- Must end with a period
- 10–20 words
- Write about what the image MEANS, not what it SHOWS
- Third person or universal truth — never "I saw..." or "This is..."
- Can use em dash (—) to connect imagery to meaning

**Good examples:**
- "Stillness looks different when it refuses to sink."
- "Friendship has no rules about matching."
- "Every city moves in tunnels before it learns to breathe in light."
- "Even the faintest remains can wear the brightest colors."

**Bad examples:**
- "A yellow rubber duck floating in a pool" (just describing, not reflecting)
- "This image shows a skull" (too literal)
- "I think this is beautiful" (first person, no depth)

### note

**Rules:**
- Exactly 1–2 Chinese characters
- Choose from the table below based on the image's emotional tone

| Note | Use When |
|------|----------|
| 安静 | Peaceful, calm, still scenes |
| 远方 | Distance, mountains, travel, aspiration |
| 信念 | Warriors, conviction, determination, faith |
| 温柔 | Soft, gentle, caring, cute imagery |
| 烟火 | Food, warmth, social life, daily joy |
| 城市 | Urban landscapes, city architecture |
| 凝视 | Portraits, looking, being watched |
| 黄昏 | Sunset, evening, dusk scenes |
| 力量 | Powerful, intense, strong subjects |
| 回声 | Heritage, ruins, old buildings, nostalgia |
| 片刻 | Fleeting beauty, small details, brief moments |
| 观察 | Architecture, urban observation |
| 夜色 | Night scenes, city lights, darkness |
| 旅途 | Journey, travel, movement |
| 信仰 | Temples, spiritual, sacred places |
| 深渊 | Dark fantasy, deep, heavy themes |
| 治愈 | Comforting, healing, cute animals |
| 灵感 | Creative, surreal, imaginative |
| 幻想 | Fantasy, imaginary, otherworldly |
| 经典 | Timeless, classic, iconic subjects |
| 静谧 | Serene, meditative, wine, still life |
| 探索 | Discovery, space, science, unknown |

If none fit perfectly, pick the closest. Do NOT invent new notes.

### image

Format: `/visual-archive/{category}/{id}.webp`

For memory category: `/visual-archive/memory/{city}/{id}.webp`

### thumb

Format: `/visual-archive/thumbs/{id}-thumb.webp`

Always in `thumbs/`, never in category subdirectory.

### mediaType

Always `'image'`. Do not change this.

### aspect

Look at the image dimensions:
- Taller than wide → `portrait`
- Wider than tall → `landscape`
- Roughly equal → `square`

### tags

**Rules:**
- 3–6 tags total
- All lowercase
- Hyphenated multi-word tags (e.g., `dark-fantasy`, not `dark fantasy`)
- First tag should be the primary subject
- Last tag should be the category name (`editorial`, `illustration`, `art`, `design`, or city name for memory)
- Include relevant descriptors: medium, style, mood, subject

**Examples by category:**

| Category | Tag Pattern |
|----------|------------|
| editorial | `['subject', 'style', 'mood', 'editorial']` |
| memory | `['subject', 'city-lowercase', 'editorial']` or `['subject', 'city-lowercase']` |
| illustration | `['subject', 'style', 'illustration']` |
| art | `['subject', 'medium', 'art']` |
| design | `['subject', 'style', 'design']` |

**Example tags:**
- Rubber duck in pool: `['rubber-duck', 'pool', 'minimal', 'summer', 'editorial']`
- Skull painting: `['skull', 'oil-painting', 'colorful', 'dark', 'art']`
- Anime character: `['rem', 're-zero', 'anime', 'portrait', 'illustration']`

### featured

Set to `true` for images that are:
- Visually striking or unique
- Strong emotional impact
- High-quality composition
- First of a new subject type in the archive

Set to `false` for images that are:
- Similar to existing entries
- Simpler composition
- Less visually distinctive

**Rule of thumb:** When in doubt, set to `true`. About 50–60% of entries should be featured.

### alt

**Style:** Objective, descriptive, present-tense. For screen readers / accessibility.

**Rules:**
- Describe what is VISIBLE in the image
- 8–15 words
- Present tense
- Neutral tone (NOT poetic — that's what caption is for)
- Include key visual elements: subject, setting, colors, composition

**Good examples:**
- "Yellow rubber duck floating in a turquoise tiled swimming pool with water ripples."
- "Vibrant oil painting of a skull in pink, yellow, and blue brushstrokes against a dark background."
- "London Underground station with curved tiled walls and a train approaching the platform."

**Bad examples:**
- "Stillness in blue" (too poetic, not descriptive)
- "A duck" (too vague)
- "This is a painting of a skull with colorful brush strokes" (conversational, not descriptive)

---

## Quality Checklist

Before outputting each entry, verify:

- [ ] id uses the correct next number
- [ ] category is one of the 5 allowed values
- [ ] city is null unless category is memory AND the photo was taken by the user
- [ ] title is 2–4 words, Title Case, NOT literal
- [ ] caption is a complete sentence ending with period, 10–20 words
- [ ] note is exactly 1–2 Chinese characters from the approved list
- [ ] image path matches the format `/visual-archive/{category}/{id}.webp`
- [ ] thumb path matches `/visual-archive/thumbs/{id}-thumb.webp`
- [ ] mediaType is always `'image'`
- [ ] aspect matches actual image dimensions
- [ ] tags are 3–6, lowercase, hyphenated, include category tag
- [ ] featured is true or false (not string)
- [ ] alt is descriptive, objective, 8–15 words, present tense

---

## Example

**Input:** User provides this entry for review:

```ts
{
  id: 'editorial-041',
  category: 'editorial',
  city: null,
  title: 'Evening Original',
  caption: 'Some tastes carry the weight of a whole evening.',
  note: '烟火',
  image: '/visual-archive/editorial/editorial-041.webp',
  thumb: '/visual-archive/thumbs/editorial-041-thumb.webp',
  mediaType: 'image',
  aspect: 'portrait',
  tags: ['coca-cola', 'sunset', 'still-life', 'moody', 'editorial'],
  featured: false,
  alt: 'Classic Coca-Cola glass bottle held against a deep blue and orange sunset sky.',
},
```

**Output:** Entry passes all checks — output unchanged.
