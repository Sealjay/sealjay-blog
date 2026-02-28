# Homepage Radical Simplify — Design

**Date:** 2026-02-28
**Status:** Draft

## Goal

Simplify the sealjay.com homepage to reduce cognitive overload, fix text overlap bugs, and improve visual cohesion. No content is deleted — removed sections live on their dedicated pages.

## New Homepage Structure

```
1. Header (unchanged)
2. Hero section (trimmed badges: 3 instead of 6)
3. Section divider
4. Curated 3-column grid (Latest Article | Recent Talks | Featured Projects)
5. Section divider
6. Latest Notes strip (kept, with added context label)
7. Footer
```

### What's removed from homepage (NOT deleted)

- **Activity stream** — filter pills, stream items, client-side filter JS, and the 90-line diversity algorithm. The `/stream` page remains accessible from secondary nav and footer.
- **Stream data fetching** — `allStreamItems`, `diverseStream`, `badgeClasses`, `badgeLabels`, filter script. ~150 lines removed from index.astro.

### What's kept

- **Latest Notes strip** — moved to be the final content section before the footer. Add a brief context label: "Quick thoughts from Mastodon" or similar, so new visitors understand what they're looking at.

## Bug Fixes

### 1. Stream description truncation (text overlap)
- **File:** `index.astro:307` — removed with stream section
- If a similar pattern exists elsewhere, fix `sm:inline truncate` to `sm:inline-block truncate`

### 2. 3-column grid breakpoint too early
- **File:** `index.astro:239`
- **Change:** `md:grid-cols-3` → `lg:grid-cols-3` (or `md:grid-cols-2 lg:grid-cols-3`)
- At `md` (768px), show 2 columns. At `lg` (1024px), show 3 columns.

### 3. "Media Mention" badge wrapping
- **File:** `RecentTalks.astro:46`
- **Add:** `whitespace-nowrap` to event type badge span

### 4. `overflow-hidden` on layout wrapper
- **File:** `IndexLayout.astro:26`
- **Change:** `overflow-hidden` → `overflow-x-hidden` to prevent horizontal scroll while allowing vertical overflow (mobile menu dropdown)

### 5. Mobile menu event listener
- **File:** `Header.astro:124`
- **Change:** `DOMContentLoaded` → `astro:page-load` for View Transitions compatibility

### 6. Above-fold image lazy loading
- **File:** `LatestArticle.astro:35`
- **Change:** Remove `loading="lazy"` (or set `loading="eager"` with `fetchpriority="high"`)

### 7. External links missing screen reader text
- **Files:** `RecentTalks.astro`, `FeaturedProjects.astro`, `IndexSocialLinks.astro`
- **Add:** `<span class="sr-only">(opens in new tab)</span>` to all `target="_blank"` links (matching the pattern already used in `Card.astro`)

### 8. Portrait image loaded twice
- **File:** `index.astro:181-228`
- Use `<picture>` with media queries, or add `loading="lazy"` to the hidden variant

## Visual Polish

### 9. Reduce homepage badges to 3
- Keep: "6x Microsoft MVP in AI", "Doctoral Student, Green AI (UEL, 2022-2027)", "OpenUK New Year's Honours 2025/26 Recipient"
- Remove from homepage: "Contributor, ISO/IEC 21031:2024", "OpenUK Ambassador", "Securing the Realm"
- Full list remains on the About page

### 10. Unify card border-radius
- Change `RecentTalks.astro` and `FeaturedProjects.astro` card items from `rounded-lg` to `rounded-xl`
- All cards on homepage: `rounded-xl`

### 11. Remove redundant backdrop-blur from inner cards
- Inner cards (LatestArticle, RecentTalks, FeaturedProjects, LatestNotes, stream items) sit inside the `backdrop-blur-md` layout container — their own `backdrop-blur` is redundant
- Remove `backdrop-blur` from all inner card elements

### 12. Normalise ring opacity
- Standardise all card rings to `ring-zinc-200/60 dark:ring-zinc-700/40`
- Social links currently use `/70` — change to `/60`

### 13. Use `.section-divider` class
- Replace inline gradient dividers in `index.astro` with the `.section-divider` class from `global.css`

### 14. Reduce animated wave backgrounds
- Reduce from 4 SVGs to 2 (remove the two lower-opacity ones)
- Minimal visual difference, measurable perf improvement on mobile

### 15. Clean up dead CSS utilities
- Remove `.line-clamp-2`, `.text-balance`, `.aspect-w-16`/`.aspect-h-9` from global.css (duplicates of Tailwind built-ins)

### 16. Remove dead import
- `index.astro:11` — `formerRoles` imported but unused

## What This Does NOT Change

- No changes to the About page, Blog, Speaking, Projects, Notes, or any other page
- No changes to the navigation structure (header nav items stay the same)
- No font, colour palette, or design system changes
- No changes to dark mode behaviour
- The `/stream` page remains intact and linked from footer/secondary nav

## Success Criteria

- Homepage loads with hero + curated grid + notes strip + footer
- No text overlaps at any viewport width (320px to 2560px)
- 3-column grid transitions smoothly: 1 col → 2 col (md) → 3 col (lg)
- All interactive elements have visible focus states
- All external links announce "(opens in new tab)" to screen readers
- Mobile menu works correctly after navigation
- Lighthouse accessibility score maintained or improved
