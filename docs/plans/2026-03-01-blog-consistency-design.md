# Blog Page Consistency Fixes

## Problem

The blog listing page and individual blog post pages have inconsistent breadcrumbs, tag rendering, and styling.

## Changes

### 1. Breadcrumbs: Use "Writing" everywhere

- `BlogPostLayout.astro`: Change breadcrumb link text from "Blog" to "Writing" (keep `href="/blog"`)
- `BlogPostLayout.astro`: Update breadcrumb JSON-LD `name` from "Blog" to "Writing"
- `BlogPostLayout.astro`: Change breadcrumb font from `--font-body` to `--font-heading` to match PageHeader
- `blog/tag/[tag].astro`: Change breadcrumb label from "Blog" to "Writing"

### 2. Blog card tags: Match post page style

- `blog/index.astro`: Show up to 3 tags per card (matching post page) instead of just 1
- `blog/index.astro`: Update `.blog-card__tag` CSS to match `.article-tag` padding/font/styling
- `blog/index.astro`: Add `.blog-card__tags` flex-wrap container
- `blog/tag/[tag].astro`: Apply same card tag changes

### Files affected

| File | Changes |
|------|---------|
| `src/src/layouts/BlogPostLayout.astro` | Breadcrumb text, JSON-LD, font |
| `src/src/pages/blog/index.astro` | Card tag rendering + CSS |
| `src/src/pages/blog/tag/[tag].astro` | Breadcrumb text + card tag rendering + CSS |
