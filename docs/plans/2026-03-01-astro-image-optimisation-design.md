# Astro Image Optimisation Migration

## Overview

Migrate the blog from plain `<img>` tags with manually pre-generated size variants to Astro's built-in `<Image>` and `<Picture>` components from `astro:assets`. This gives us automatic WebP/AVIF generation, responsive `srcset`, and lazy loading with zero manual image processing.

## Decisions

| Decision | Choice |
|----------|--------|
| Inline MDX images | Remark plugin to rewrite paths automatically — no MDX file changes needed for inline images |
| heroImage schema | Astro `image()` helper — full type-safe image metadata at build time |
| Output formats | AVIF + WebP + original fallback via `<Picture>` |
| Layout strategy | `full-width` for heroes, `constrained` for cards, `fixed` for avatars/icons |

## Directory structure

Move images from `public/` to `src/assets/` so Astro can process them:

```
src/src/assets/
├── images/
│   ├── acknowledgements/
│   ├── 2021/
│   ├── 2022/
│   └── 2026/
└── chris/
    ├── avatar.jpg
    └── portrait.jpg
```

Delete `public/images/size/` (w100–w2400 Ghost-era variants).
Keep favicons and apple-touch-icon in `public/`.

## Schema changes

```ts
// content/config.ts
schema: ({ image }) => z.object({
  heroImage: image().optional(),
  // ...
})
```

Same for project `heroImage` and speaking `thumbnail`. Acknowledgement `image` stays as `z.string()`.

## Component changes

| Component | Approach |
|-----------|----------|
| BlogPostLayout hero | `<Picture>` full-width, formats=['avif','webp'] |
| Blog index/tag cards | `<Picture>` constrained for real heroes, `<img>` for OG fallbacks |
| ProfileSection | `<Image>` fixed 160×160 |
| speaking/kit headshot | `<Image>` fixed |
| acknowledgements icons | `<Image>` fixed 32×32 via import.meta.glob |
| projects cards | `<Picture>` constrained |
| SocialEmbed | Keep `<img>` (external URLs) |
| BaseHead OG tags | No change (plain URL strings) |

## Remark plugin

A remark plugin (~15 lines) rewrites `![alt](/images/foo.png)` to `![alt](../../assets/images/foo.png)`. Astro's MDX pipeline then optimises automatically.

## Phases

1. Move images to `src/assets/`, delete `size/` variants
2. Update content schemas (`image()` helper)
3. Update blog post frontmatter heroImage paths
4. Update component layer
5. Write remark plugin, register in astro.config.mjs
6. Build verification + cleanup
