# Design: rehype-mvp-url plugin for sealjay-blog

**Date:** 2026-02-28
**Status:** Approved

## Purpose

Automatically append `?WT.mc_id=AI-MVP-5004204` to all `*.microsoft.com` links in MDX content, ensuring MVP tracking is never forgotten.

## Approach

Simplified port of the securing.quest `rehype-mvp-url.ts` plugin. Single hardcoded MVP ID (no multi-author hashing). Registered on the MDX integration only (not site-wide).

## Design

### New file: `src/src/plugins/rehype-mvp-url.ts`

- Export a rehype plugin function returning a hast tree transformer
- Use `unist-util-visit` to walk `element` nodes with tagName `a`
- For each anchor with an `href`:
  1. Parse the URL; skip if not `*.microsoft.com`
  2. Strip any existing `WT.mc_id` param (case-insensitive)
  3. Append `WT.mc_id=AI-MVP-5004204`
  4. Replace the href

### Registration: `src/astro.config.mjs`

Import the plugin and add to the MDX integration's `rehypePlugins` array.

### Dependency

Add `unist-util-visit` explicitly to `package.json` (already a transitive dep).

## Alternatives considered

1. **Remark plugin (mdast)** — would miss raw HTML links in MDX
2. **Astro integration with content hook** — over-engineered for this use case
