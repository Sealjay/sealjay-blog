# Indigo Ink Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign sealjay.com with the Indigo Ink visual system - deep indigo backgrounds, editorial typography (Bricolage Grotesque + Source Serif 4), CSS custom property theming, full-width layout.

**Architecture:** Replace Tailwind `dark:` class theming with CSS custom properties via `data-theme` attribute. Remove floating card layout wrapper in favour of full-width section backgrounds. Rename layouts to match spec (IndexLayout→BaseLayout, BaseLayout→BlogPostLayout). All colours reference CSS variables, not hardcoded values.

**Tech Stack:** Astro 5, Tailwind CSS 3 with @tailwindcss/typography, Bun, Biome, Google Fonts (Bricolage Grotesque, Source Serif 4, IBM Plex Mono), satori + resvg-js for OG images.

**Design doc:** `docs/plans/2026-02-28-indigo-ink-redesign-design.md`
**Full spec:** See the user's original message in the conversation for the complete 500+ line specification.

---

## Task 1: Branch Creation and Layout Rename

**Files:**
- Rename: `src/src/layouts/IndexLayout.astro` → `src/src/layouts/BaseLayout.astro`
- Rename: `src/src/layouts/BaseLayout.astro` → `src/src/layouts/BlogPostLayout.astro`
- Modify: Every file that imports either layout

**Step 1: Create the redesign branch**

```bash
cd /Users/chris.lloyd-jones/git/sealjay-blog
git checkout -b redesign/indigo-ink
```

**Step 2: Rename layout files**

Rename `IndexLayout.astro` to `BaseLayout.astro` and `BaseLayout.astro` to `BlogPostLayout.astro`. Since both exist, use a temp name:

```bash
cd src/src/layouts
mv BaseLayout.astro BlogPostLayout.astro
mv IndexLayout.astro BaseLayout.astro
```

**Step 3: Update all imports referencing the old names**

Search for every file importing these layouts and update:
- `import PageLayout from "./IndexLayout.astro"` → `import PageLayout from "./BaseLayout.astro"` (in BlogPostLayout.astro)
- `import IndexLayout from "../layouts/IndexLayout.astro"` → `import BaseLayout from "../layouts/BaseLayout.astro"` (in all pages)
- `import BaseLayout from "../layouts/BaseLayout.astro"` → `import BlogPostLayout from "../layouts/BlogPostLayout.astro"` (in blog/[...slug].astro and notes/[...slug].astro)

Files to update (grep for `IndexLayout` and `BaseLayout` across all `.astro` files):
- `src/src/layouts/BlogPostLayout.astro` (imports from ./IndexLayout → ./BaseLayout)
- `src/src/pages/index.astro`
- `src/src/pages/about.astro`
- `src/src/pages/blog/index.astro`
- `src/src/pages/blog/[...slug].astro`
- `src/src/pages/blog/tag/[tag].astro`
- `src/src/pages/speaking/index.astro`
- `src/src/pages/speaking/kit.astro`
- `src/src/pages/projects/index.astro`
- `src/src/pages/notes/index.astro`
- `src/src/pages/notes/[...slug].astro`
- `src/src/pages/shorts/index.astro`
- `src/src/pages/stream/index.astro`
- `src/src/pages/privacy.astro`
- `src/src/pages/acknowledgements.astro`
- `src/src/pages/404.astro`

**Step 4: Verify build passes**

```bash
cd /Users/chris.lloyd-jones/git/sealjay-blog/src
bun run build
```

Expected: Build completes with zero errors.

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor: rename layouts - IndexLayout→BaseLayout, BaseLayout→BlogPostLayout"
```

---

## Task 2: Design System Foundation - Tailwind Config

**Files:**
- Modify: `src/tailwind.config.cjs`

**Step 1: Update tailwind.config.cjs**

Replace the entire theme extension with the Indigo Ink token system. Key changes:
- Change `darkMode: 'class'` to `darkMode: ['selector', '[data-theme="dark"]']`
- Replace `accent` colour palette with full `ink`, `indigo`, `rose`, `emerald` palettes
- Replace `fontFamily` with heading (Bricolage Grotesque), body (Source Serif 4), code (IBM Plex Mono)
- Add custom `fontSize` entries: display, display-mobile, h2, h2-mobile, h3, h3-mobile, body, body-sm, tag, overline, code, code-mobile
- Add custom `borderRadius`: sm (8px), md (12px), lg (16px), xl (20px)
- Add custom `maxWidth`: content (720px), layout (1120px)
- Add `transitionTimingFunction`: out-expo, spring
- Add keyframes and animations: fade-in-up, fade-slide-in
- Keep the `@tailwindcss/typography` plugin but update its prose theme to use the new CSS variables

The full token values are in the spec under Phase 1.1. The typography plugin configuration should reference CSS variables for prose colours (body, headings, links, code, etc.) so they automatically switch with the theme.

**Step 2: Verify build passes**

```bash
cd /Users/chris.lloyd-jones/git/sealjay-blog/src
bun run build
```

Note: Build may have warnings about unused classes. That's expected at this stage.

**Step 3: Commit**

```bash
git add src/tailwind.config.cjs
git commit -m "feat: add Indigo Ink design tokens to Tailwind config"
```

---

## Task 3: Design System Foundation - Global CSS and Fonts

**Files:**
- Modify: `src/src/styles/global.css`
- Modify: `src/src/styles/markdown.css`
- Modify: `src/package.json` (remove @fontsource packages)

**Step 1: Replace global.css**

Rewrite `global.css` with:
- Remove `@import './prism.css'` (will be replaced by custom code block styling)
- Keep `@import './markdown.css'`
- Keep Tailwind directives: `@tailwind base; @tailwind components; @tailwind utilities;`
- Add CSS custom properties in `:root` (light mode) and `[data-theme="dark"]` (dark mode) - full list in spec Phase 1.2
- Add `@media (prefers-reduced-motion: reduce)` block
- Add `:focus-visible` global styling
- Add `.skip-link` styling
- Add base `body` styling using CSS variables
- Add heading and code font-family rules
- Add `::selection` colour
- Add scrollbar styling for dark mode
- Remove all existing `dark:` prefixed rules from base layer
- Keep the `h-screen-safe` utility

**Step 2: Update markdown.css**

Replace all `.dark` selector overrides with `[data-theme="dark"]` selector. Update all colour values to use CSS custom properties (`var(--color-text)`, `var(--color-primary)`, etc.) instead of hardcoded hex values or zinc references.

Key markdown.css updates:
- `:root` variables → use `var(--color-*)` from global.css
- `.dark` selector → `[data-theme="dark"]` selector
- All heading colours → `var(--color-text)`
- All link colours → `var(--color-primary)`
- All code colours → CSS variable references
- Blockquote border → `var(--color-primary)`
- Blockquote background → `var(--color-primary-muted)`

**Step 3: Remove @fontsource packages**

```bash
cd /Users/chris.lloyd-jones/git/sealjay-blog/src
bun remove @fontsource/inter @fontsource/manrope
```

**Step 4: Remove @fontsource imports from any files that import them**

Search for `@fontsource` across the codebase and remove those import statements. They may be in global.css or a layout file.

**Step 5: Verify build passes**

```bash
bun run build
```

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Indigo Ink CSS custom properties and fonts, remove @fontsource"
```

---

## Task 4: BaseHead and Dark Mode Script

**Files:**
- Modify: `src/src/components/partials/BaseHead.astro`

**Step 1: Update BaseHead.astro**

Key changes:
- Add inline dark mode script in `<head>` that reads localStorage/prefers-color-scheme and sets `data-theme` attribute BEFORE CSS loads (prevents flash)
- Replace Google Fonts import: remove Inter + Manrope, add Bricolage Grotesque (400-800) + Source Serif 4 (400-700, italic 400-500) + IBM Plex Mono (400, 500)
- Add font preload hints for critical fonts
- Update `theme-color` meta tags to match new palette (#F8F9FC for light, #0C0A1D for dark)
- Keep ALL existing meta tags, structured data, identity verification links, webmention endpoints, feed discovery links, Plausible analytics, and mobile optimisation

The dark mode inline script (must be `is:inline` for Astro):
```html
<script is:inline>
  (function() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  })();
</script>
```

**Step 2: Verify build passes**

```bash
bun run build
```

**Step 3: Commit**

```bash
git add src/src/components/partials/BaseHead.astro
git commit -m "feat: update BaseHead with Indigo Ink fonts and dark mode script"
```

---

## Task 5: DarkModeToggle Component

**Files:**
- Modify: `src/src/components/partials/DarkModeToggle.astro`

**Step 1: Rewrite DarkModeToggle.astro**

Replace the current toggle switch implementation. Key changes:
- Switch from `.dark` class to `data-theme` attribute toggling on `document.documentElement`
- Update `updateHTMLTheme()` to use `setAttribute('data-theme', mode)` instead of class toggling
- Update `theme-color` meta tag values: light = `#F8F9FC`, dark = `#0C0A1D`
- Use sun/moon SVG icons (20px) with rotation + opacity transition on swap
- Button: 44x44px min touch target, no visible border, subtle hover background using `var(--color-primary-muted)`
- Dynamic `aria-label`: "Switch to dark mode" / "Switch to light mode"
- Keep Plausible analytics event
- Replace all `dark:` Tailwind prefixes with CSS variable references
- Style using `var(--color-text-muted)` for icon colour, `var(--color-primary)` on hover

**Step 2: Verify build passes and toggle works**

```bash
bun run build
```

**Step 3: Commit**

```bash
git add src/src/components/partials/DarkModeToggle.astro
git commit -m "feat: rewrite DarkModeToggle for data-theme CSS variable system"
```

---

## Task 6: Root Layout (BaseLayout.astro)

**Files:**
- Modify: `src/src/layouts/BaseLayout.astro` (was IndexLayout.astro)

**Step 1: Rewrite BaseLayout.astro**

This is the root layout wrapping every page. Key changes:
- Remove the floating card wrapper (`bg-white/90 backdrop-blur-md ring-1 ring-zinc-100 dark:bg-zinc-900/80 rounded-2xl shadow-xl`)
- Use full-width page layout: `body` with `bg-[var(--color-bg)] text-[var(--color-text)] font-body`
- Add skip-to-content link with `.skip-link` class
- Keep `<Waves />` component (positioned absolute behind hero)
- Structure: `<Header />` → `<main id="main-content">` with slot → `<Footer />`
- Keep iOS Safari viewport height fix script
- Replace all `dark:` classes with CSS variable references
- Keep all existing props passthrough to BaseHead

**Step 2: Verify build passes**

```bash
bun run build
```

**Step 3: Commit**

```bash
git add src/src/layouts/BaseLayout.astro
git commit -m "feat: restructure BaseLayout with full-width Indigo Ink design"
```

---

## Task 7: Header Component

**Files:**
- Modify: `src/src/components/partials/Header.astro`
- Modify: `src/src/components/partials/HeaderLink.astro`

**Step 1: Rewrite Header.astro**

Key changes:
- Sticky header: `position: sticky; top: 0; z-index: 100`
- Blurred background: `backdrop-filter: blur(12px); background-color` at 85% opacity using CSS variable
- Bottom border: `1px solid var(--color-border)`
- Left: Logo mark (gradient indigo square 28x28px with "S", border-radius 8px) + "sealjay" wordmark
- Right desktop: nav links + DarkModeToggle + search button
- Right mobile: DarkModeToggle + hamburger (44x44px)
- Nav links: Blog, Speaking, Projects, Notes, About
- Mobile menu: full-screen overlay, staggered fade, `role="menu"`, `aria-expanded`
- Replace ALL `dark:` classes with CSS variable references
- `<nav role="navigation" aria-label="Main navigation">`

**Step 2: Rewrite HeaderLink.astro**

- Font: `font-body`, 14px, weight 500, `color: var(--color-text-muted)`
- Padding: `6px 12px`, min 44px touch height
- Hover: `color: var(--color-primary); background: var(--color-primary-muted)`
- Active: same as hover (current page detection via pathname match)
- Transition: `all var(--duration-fast) var(--ease-out)`
- Replace all `dark:` classes

**Step 3: Verify build passes**

```bash
bun run build
```

**Step 4: Commit**

```bash
git add src/src/components/partials/Header.astro src/src/components/partials/HeaderLink.astro
git commit -m "feat: redesign Header and HeaderLink with Indigo Ink styling"
```

---

## Task 8: Footer Component

**Files:**
- Modify: `src/src/components/partials/Footer.astro`

**Step 1: Rewrite Footer.astro**

Key changes:
- Background: `var(--color-bg-alt)`
- Top border: `1px solid var(--color-border)`
- Two-column flex on desktop, stacked on mobile
- Left: "sealjay" wordmark in `font-heading var(--color-primary)`, copyright, "Built with Astro" text
- Right: link groups (Navigate, Social, Feeds) in columns
- All links: `font-body body-sm var(--color-text-muted)`, hover `var(--color-primary)`
- `<footer role="contentinfo">`
- Replace all `dark:` classes

**Step 2: Verify build passes**

```bash
bun run build
```

**Step 3: Commit**

```bash
git add src/src/components/partials/Footer.astro
git commit -m "feat: redesign Footer with Indigo Ink styling"
```

---

## Task 9: Core UI Components (Card, Badge, Button, FormattedDate, PageHeader)

**Files:**
- Modify: `src/src/components/partials/Card.astro`
- Modify: `src/src/components/partials/Badge.astro`
- Modify: `src/src/components/partials/Button.astro`
- Modify: `src/src/components/partials/FormattedDate.astro`
- Modify: `src/src/components/partials/PageHeader.astro`

**Step 1: Rewrite Card.astro**

- Background: `var(--color-surface)`
- Border: `1px solid var(--color-border)`, radius `var(--radius-lg)` (16px)
- Shadow: `var(--color-card-glow)`
- Hover (if enabled): border brightens, `translateY(-2px)`
- If `href`: render as `<a>`, cursor pointer
- Replace all `dark:` classes

**Step 2: Rewrite Badge.astro**

- Pill shape: `border-radius: var(--radius-full)`
- Variants: default (indigo), warm (rose), success (emerald), subtle (transparent)
- Font: `font-heading`, 11px, weight 500
- Replace all `dark:` classes

**Step 3: Rewrite Button.astro**

- Variants: primary, secondary, ghost
- Sizes: sm, md
- Primary: `background: var(--color-primary); color: #FFFFFF`
- Secondary: transparent with primary border
- Ghost: transparent, no border
- Min-height 44px, `font-heading` weight 600
- Replace all `dark:` classes

**Step 4: Update FormattedDate.astro**

- `<time datetime="YYYY-MM-DD">` format "28 Feb 2026"
- Styled: `font-body body-sm`, `color: var(--color-text-muted)`
- Replace any `dark:` classes

**Step 5: Rewrite PageHeader.astro**

- Props: title, subtitle, breadcrumbs array
- Breadcrumbs: `<nav aria-label="Breadcrumb">` with `<ol>`, "/" separators
- Title: H1 in `font-heading text-display` / `text-display-mobile`
- Subtitle: `font-body text-body var(--color-text-muted)`
- Replace all `dark:` classes

**Step 6: Verify build passes**

```bash
bun run build
```

**Step 7: Commit**

```bash
git add src/src/components/partials/Card.astro src/src/components/partials/Badge.astro src/src/components/partials/Button.astro src/src/components/partials/FormattedDate.astro src/src/components/partials/PageHeader.astro
git commit -m "feat: redesign Card, Badge, Button, FormattedDate, PageHeader components"
```

---

## Task 10: Container Components

**Files:**
- Modify: `src/src/components/containers/Container.astro`
- Modify: `src/src/components/containers/ContentContainer.astro`
- Modify: `src/src/components/containers/Section.astro`
- Modify: `src/src/components/containers/PageIntro.astro` (if exists)

**Step 1: Rewrite Container.astro**

- Max-width: 1120px
- Horizontal padding: 20px mobile, 40px desktop
- Centred: `margin: 0 auto`

**Step 2: Rewrite ContentContainer.astro**

- Max-width: 720px
- Same centring and padding

**Step 3: Rewrite Section.astro**

- Props: bg ("default" | "alt"), id, ariaLabel
- `<section>` with `var(--color-bg)` or `var(--color-bg-alt)`
- Vertical padding: `var(--space-xl)` desktop, `var(--space-lg)` mobile
- Optional border

**Step 4: Update PageIntro.astro**

- Consolidate with PageHeader if they serve the same purpose
- Replace all `dark:` classes

**Step 5: Verify build passes**

```bash
bun run build
```

**Step 6: Commit**

```bash
git add src/src/components/containers/
git commit -m "feat: redesign container components with Indigo Ink tokens"
```

---

## Task 11: Social Icon Components

**Files:**
- Modify: `src/src/components/socialicons/GitHub.astro`
- Modify: `src/src/components/socialicons/LinkedIn.astro`
- Modify: `src/src/components/socialicons/Mastodon.astro`
- Modify: `src/src/components/socialicons/Bluesky.astro`

**Step 1: Update all social icon components**

For each icon:
- Inline SVG with `currentColor` fill/stroke
- Props: `size` (default 24), `class`
- `role="img"` with `aria-label` when standalone
- `aria-hidden="true"` when alongside text
- Remove any `dark:` classes

**Step 2: Update IndexSocialLinks.astro and IndexSociaLink.astro**

- Horizontal row, centred
- Each icon: 24px SVG in 44px touch target anchor
- Colour: `var(--color-text-muted)`, hover: `var(--color-primary)`
- Gap: `var(--space-lg)`
- Replace all `dark:` classes

**Step 3: Verify build passes**

```bash
bun run build
```

**Step 4: Commit**

```bash
git add src/src/components/socialicons/ src/src/components/partials/IndexSocialLinks.astro src/src/components/partials/IndexSociaLink.astro
git commit -m "feat: update social icons for Indigo Ink theming"
```

---

## Task 12: SearchDialog Component

**Files:**
- Modify: `src/src/components/partials/SearchDialog.astro`

**Step 1: Rewrite SearchDialog.astro**

Key changes:
- Modal overlay: `backdrop-filter: blur(8px)`, semi-transparent
- Dialog: centred, max-width 560px, `var(--color-surface)` bg, `var(--radius-xl)` radius, `var(--color-border)` border
- Input: 48px height, `font-body`, `var(--color-primary)` focus ring
- Results: keyboard navigable, type badges
- Focus trap while open
- `role="dialog"`, `aria-modal="true"`, `aria-label="Search"`
- Replace ALL `dark:` classes with CSS variable references
- Keep Fuse.js search logic and Plausible analytics

**Step 2: Verify build passes**

```bash
bun run build
```

**Step 3: Commit**

```bash
git add src/src/components/partials/SearchDialog.astro
git commit -m "feat: redesign SearchDialog with Indigo Ink styling"
```

---

## Task 13: IndexWaves Component

**Files:**
- Modify: `src/src/components/partials/IndexWaves.astro`

**Step 1: Rewrite IndexWaves.astro**

- SVG wave paths using `var(--color-primary)` and `var(--color-accent)` at 5-10% opacity
- Gentle CSS animation: slow horizontal drift, 20-30s, infinite
- `aria-hidden="true"`
- Position absolute, full width, z-index 0
- Respects `prefers-reduced-motion: reduce`
- Replace all `dark:` classes

**Step 2: Verify build passes**

```bash
bun run build
```

**Step 3: Commit**

```bash
git add src/src/components/partials/IndexWaves.astro
git commit -m "feat: redesign IndexWaves with Indigo Ink colours"
```

---

## Task 14: Embed Components

**Files:**
- Modify: `src/src/components/embeds/YouTubeEmbed.astro`
- Modify: `src/src/components/embeds/CodeBlock.astro`
- Modify: `src/src/components/embeds/CodePenEmbed.astro`
- Modify: `src/src/components/embeds/GitHubGistEmbed.astro`
- Modify: `src/src/components/embeds/SocialEmbed.astro`
- Modify: `src/src/components/embeds/TweetEmbed.astro`
- Modify: `src/src/components/embeds/Giscus.astro`

**Step 1: Update YouTubeEmbed.astro**

- Responsive `aspect-ratio: 16/9`, `border-radius: var(--radius-md)`, overflow hidden
- `loading="lazy"`, `title` attribute
- Replace `dark:` classes

**Step 2: Update CodeBlock.astro**

- Background: `var(--color-bg-alt)`, border: `1px solid var(--color-border)`
- `border-radius: var(--radius-md)`, `font-code`
- Copy button: top-right, 44px touch target, "Copied!" feedback
- Language label: top-left, `text-overline`, `var(--color-text-subtle)`
- Custom syntax colours per spec (keywords=indigo, strings=rose, comments=subtle, functions=emerald)
- Replace `dark:` classes

**Step 3: Update Giscus.astro**

- Pass theme based on `data-theme`: "dark" or "light"
- Wrap in `<section aria-label="Comments">` with H2
- Lazy load
- Replace `dark:` classes
- Update the theme detection from `.dark` class to `data-theme` attribute

**Step 4: Update remaining embeds** (CodePen, GitHubGist, Social, Tweet)

- Responsive containers with `var(--radius-md)`
- `loading="lazy"`, fallback links
- Replace all `dark:` classes

**Step 5: Verify build passes**

```bash
bun run build
```

**Step 6: Commit**

```bash
git add src/src/components/embeds/
git commit -m "feat: redesign embed components with Indigo Ink styling"
```

---

## Task 15: Home Section Components

**Files:**
- Modify: `src/src/components/home/LatestArticle.astro`
- Modify: `src/src/components/home/RecentTalks.astro`
- Modify: `src/src/components/home/FeaturedProjects.astro`
- Modify: `src/src/components/home/LatestNotes.astro`

**Step 1: Rewrite LatestArticle.astro**

- Card with Badge (primary tag), title (H3 font-heading), FormattedDate, reading time, excerpt
- Hero image thumbnail or gradient placeholder
- Entire card is link, hover lift
- Use Card.astro as base
- Replace all `dark:` classes

**Step 2: Rewrite RecentTalks.astro**

- 2-3 most recent speaking entries
- Event name bold, talk title, date, location badge
- "Upcoming" badge in warm variant
- Replace all `dark:` classes

**Step 3: Rewrite FeaturedProjects.astro**

- Three-column grid desktop, single mobile
- Each: Card with emoji/icon, project name (H3), one-line description
- Hover lift effect
- Replace all `dark:` classes

**Step 4: Rewrite LatestNotes.astro**

- Horizontal scroll desktop, vertical stack mobile
- Each note card: min-width 280px, scroll-snap, timestamp, truncated content
- Fade gradient on right edge
- Replace all `dark:` classes

**Step 5: Verify build passes**

```bash
bun run build
```

**Step 6: Commit**

```bash
git add src/src/components/home/
git commit -m "feat: redesign home section components with Indigo Ink styling"
```

---

## Task 16: Remaining Partial Components

**Files:**
- Modify: `src/src/components/partials/ProfileSection.astro`
- Modify: `src/src/components/partials/SpeakerUl.astro`
- Modify: `src/src/components/partials/Webmentions.astro`
- Modify: `src/src/components/partials/BlogPostOld.astro`
- Modify: `src/src/components/partials/PageIntro.astro`

**Step 1: Update ProfileSection.astro**

- Two-column on desktop, single mobile
- Photo: max 280px, `border-radius: var(--radius-lg)`, `border: 1px solid var(--color-border)`
- Bio: `font-body text-body`, links in `var(--color-primary)`
- Replace all `dark:` classes

**Step 2: Update SpeakerUl.astro**

- `::marker { color: var(--color-primary); }`
- `font-body text-body`, line-height 1.75
- Replace `dark:` classes

**Step 3: Update Webmentions.astro**

- Group by type: likes (overlapping avatars), reposts (count), replies (threaded cards)
- Empty state: "No webmentions yet" in `var(--color-text-subtle)`
- Replace all `dark:` classes

**Step 4: Update BlogPostOld.astro**

- Gradient fallback for missing hero images
- Standard Card styling
- Replace `dark:` classes

**Step 5: Update PageIntro.astro**

- Title + description wrapper
- Consistent spacing
- Replace `dark:` classes

**Step 6: Verify build passes**

```bash
bun run build
```

**Step 7: Commit**

```bash
git add src/src/components/partials/ProfileSection.astro src/src/components/partials/SpeakerUl.astro src/src/components/partials/Webmentions.astro src/src/components/partials/BlogPostOld.astro src/src/components/partials/PageIntro.astro
git commit -m "feat: redesign remaining partial components with Indigo Ink styling"
```

---

## Task 17: BlogPostLayout (Article Layout)

**Files:**
- Modify: `src/src/layouts/BlogPostLayout.astro` (was BaseLayout.astro)

**Step 1: Rewrite BlogPostLayout.astro**

Key changes:
- Wrap with BaseLayout (new root layout)
- Article header: breadcrumbs, tag badges, H1 in `text-display`, meta row (date + reading time + author)
- Hero image: full content width, `var(--radius-lg)`, `aspect-ratio: 16/9`, `object-fit: cover`
- Article body: ContentContainer wrapping MDX content with prose classes
- Prose styling using CSS variables for all colours
- Webmentions and Giscus sections below
- Keep all microformat/h-entry markup
- Keep JSON-LD structured data
- Replace ALL `dark:` classes

**Step 2: Verify build passes**

```bash
bun run build
```

**Step 3: Commit**

```bash
git add src/src/layouts/BlogPostLayout.astro
git commit -m "feat: redesign BlogPostLayout with Indigo Ink styling"
```

---

## Task 18: Homepage (index.astro)

**Files:**
- Modify: `src/src/pages/index.astro`

**Step 1: Rewrite index.astro**

Sections in order per spec:
1. Hero: expertise badges, H1 "Chris Lloyd-Jones", subtitle (VP role), bio paragraph, bento grid (LatestArticle + next speaking), code signature block
2. Recent Writing: H2, 3 blog post cards, "View all" link
3. Featured Projects: H2 + FeaturedProjects grid
4. Latest Notes: H2 + LatestNotes strip
5. Social links (IndexSocialLinks)

All using CSS variables, no `dark:` prefixes. Staggered fade-in-up animation on hero (disabled for reduced motion).

**Step 2: Verify build passes**

```bash
bun run build
```

**Step 3: Commit**

```bash
git add src/src/pages/index.astro
git commit -m "feat: redesign homepage with Indigo Ink styling"
```

---

## Task 19: Blog Pages

**Files:**
- Modify: `src/src/pages/blog/index.astro`
- Modify: `src/src/pages/blog/[...slug].astro`
- Modify: `src/src/pages/blog/tag/[tag].astro`

**Step 1: Rewrite blog/index.astro**

- PageHeader: "Writing" with subtitle
- Tag filter bar: scrolling Badge row, "All" default active
- Stacked article cards with hero thumbnails or gradient placeholders
- Pagination: "Older" / "Newer" buttons
- Replace all `dark:` classes

**Step 2: Update blog/[...slug].astro**

- Uses BlogPostLayout - verify it passes the right props
- Any page-specific styling should use CSS variables
- Replace `dark:` classes if any

**Step 3: Update blog/tag/[tag].astro**

- Same layout as blog index but filtered
- H1: "Tagged: {tag}"
- Breadcrumbs
- Replace `dark:` classes

**Step 4: Verify build passes**

```bash
bun run build
```

**Step 5: Commit**

```bash
git add src/src/pages/blog/
git commit -m "feat: redesign blog pages with Indigo Ink styling"
```

---

## Task 20: Speaking Pages

**Files:**
- Modify: `src/src/pages/speaking/index.astro`
- Modify: `src/src/pages/speaking/kit.astro`

**Step 1: Rewrite speaking/index.astro**

- PageHeader: "Speaking"
- Upcoming section with warm accent background
- Past talks grouped by year
- CTA card linking to speaker kit
- Replace all `dark:` classes

**Step 2: Rewrite speaking/kit.astro**

- Headshots grid with download buttons
- Bio sections (short/medium/long) with copy buttons
- Technical requirements list (SpeakerUl)
- Replace all `dark:` classes

**Step 3: Verify build passes**

```bash
bun run build
```

**Step 4: Commit**

```bash
git add src/src/pages/speaking/
git commit -m "feat: redesign speaking pages with Indigo Ink styling"
```

---

## Task 21: Projects, Notes, Shorts, Stream Pages

**Files:**
- Modify: `src/src/pages/projects/index.astro`
- Modify: `src/src/pages/notes/index.astro`
- Modify: `src/src/pages/notes/[...slug].astro`
- Modify: `src/src/pages/shorts/index.astro`
- Modify: `src/src/pages/stream/index.astro`

**Step 1: Rewrite projects/index.astro**

- Large Cards with project name, description, tech badges, action buttons
- Two-column grid desktop, single mobile
- Replace all `dark:` classes

**Step 2: Rewrite notes/index.astro**

- Feed layout, max-width 560px centred
- Cards with timestamp, full content, media
- Replace all `dark:` classes

**Step 3: Update notes/[...slug].astro**

- Single note centred, max-width 560px
- Webmentions below
- Replace `dark:` classes

**Step 4: Rewrite shorts/index.astro**

- Three columns desktop, two tablet, one mobile
- Compact Cards
- Replace `dark:` classes

**Step 5: Rewrite stream/index.astro**

- Unified activity feed, reverse chronological
- Type indicators (coloured dots: indigo=blog, rose=note, emerald=short)
- "Load more" button
- Replace all `dark:` classes

**Step 6: Verify build passes**

```bash
bun run build
```

**Step 7: Commit**

```bash
git add src/src/pages/projects/ src/src/pages/notes/ src/src/pages/shorts/ src/src/pages/stream/
git commit -m "feat: redesign projects, notes, shorts, stream pages with Indigo Ink styling"
```

---

## Task 22: Static Pages (About, Privacy, Acknowledgements, 404)

**Files:**
- Modify: `src/src/pages/about.astro`
- Modify: `src/src/pages/privacy.astro`
- Modify: `src/src/pages/acknowledgements.astro`
- Modify: `src/src/pages/404.astro`

**Step 1: Rewrite about.astro**

- PageHeader with breadcrumbs
- ProfileSection: photo + bio two-column
- Credentials bento grid of badge cards
- "What I'm Working On" section
- Replace all `dark:` classes

**Step 2: Update privacy.astro**

- PageHeader with H1
- ContentContainer wrapping prose
- Replace `dark:` classes

**Step 3: Update acknowledgements.astro**

- PageHeader
- Two-column grid of project credits
- Replace `dark:` classes

**Step 4: Rewrite 404.astro**

- Centred: large "404" with gradient text effect
- "This page has wandered off" message
- Search trigger and "Go home" button
- Replace `dark:` classes

**Step 5: Verify build passes**

```bash
bun run build
```

**Step 6: Commit**

```bash
git add src/src/pages/about.astro src/src/pages/privacy.astro src/src/pages/acknowledgements.astro src/src/pages/404.astro
git commit -m "feat: redesign about, privacy, acknowledgements, 404 pages with Indigo Ink styling"
```

---

## Task 23: OG Image Generation

**Files:**
- Modify: `src/src/lib/og-image.ts`
- Modify: `src/src/pages/og/[...slug].png.ts`

**Step 1: Update og-image.ts**

Key changes:
- Replace background gradient with Indigo Ink hero gradient: `linear-gradient(160deg, #0C0A1D 0%, #1E1660 30%, #312E81 55%, #1E1660 80%, #0C0A1D 100%)`
- Replace font loading: Manrope/Inter → Bricolage Grotesque (700, 600) + Source Serif 4 (400)
  - Since @fontsource packages were removed, need to either:
    a. Download font files to `public/fonts/` and load from there
    b. Fetch from Google Fonts CDN at build time
    c. Bundle font files in `src/assets/fonts/`
  - Recommended: bundle in `src/assets/fonts/` for reliability
- Title: Bricolage Grotesque at ~36px, colour #E0E7FF
- Tag pills: styled like Badge (primary variant)
- "sealjay.com" watermark: bottom-right, Source Serif 4, 14px, colour #6670A0
- Update category colour scheme to match Indigo Ink palette

**Step 2: Download font files for satori**

Satori requires actual font file buffers. Download:
- Bricolage Grotesque Bold (700) and SemiBold (600) .ttf files
- Source Serif 4 Regular (400) .ttf file
- Place in `src/src/assets/fonts/` (create directory)

```bash
mkdir -p src/src/assets/fonts
# Download from Google Fonts API or use a direct link
```

**Step 3: Verify OG image generation works**

```bash
bun run build
# Check that dist/og/*.png files are generated
ls dist/og/ | head -5
```

**Step 4: Commit**

```bash
git add src/src/lib/og-image.ts src/src/assets/fonts/ src/src/pages/og/
git commit -m "feat: update OG image generation with Indigo Ink gradient and fonts"
```

---

## Task 24: Prism/Syntax Highlighting Theme

**Files:**
- Modify: `src/src/styles/prism.css` (or create custom theme)

**Step 1: Replace prism.css with Indigo Ink syntax theme**

Create a custom Prism theme using the spec's syntax colours:
- Dark mode: keywords=#818CF8, strings=#F472B6, comments=#6670A0, functions=#34D399, numbers=#A5B4FC, variables=#E0E7FF, punctuation=#9BA3CF
- Light mode: keywords=#4F46E5, strings=#DB2777, comments=#7E7AAA, functions=#059669, numbers=#6366F1, variables=#1E1B3A, punctuation=#4B4772
- Background: `var(--color-bg-alt)`, border: `1px solid var(--color-border)`
- Use `[data-theme="dark"]` selector for dark mode variant

**Step 2: Verify build passes**

```bash
bun run build
```

**Step 3: Commit**

```bash
git add src/src/styles/prism.css
git commit -m "feat: custom Indigo Ink syntax highlighting theme"
```

---

## Task 25: Cleanup and Lint

**Files:**
- Modify: Various files with lint issues

**Step 1: Remove any remaining `dark:` Tailwind prefixes**

```bash
cd /Users/chris.lloyd-jones/git/sealjay-blog
rg 'dark:' src/src/ --type astro -l
```

Fix any remaining files that still use `dark:` prefixes.

**Step 2: Remove any remaining zinc colour references**

```bash
rg 'zinc' src/src/ --type astro -l
rg 'zinc' src/src/styles/ -l
```

Replace with CSS variable references.

**Step 3: Run linter**

```bash
cd src
bun run lint:fix
```

**Step 4: Run build**

```bash
bun run build
```

Expected: Zero errors.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore: clean up remaining dark: prefixes and zinc references, lint fixes"
```

---

## Task 26: Validation

**Files:** None (read-only verification)

**Step 1: Start dev server and visually inspect**

```bash
cd /Users/chris.lloyd-jones/git/sealjay-blog/src
bun run dev
```

Visit each URL and verify rendering in both light and dark mode:
- `/` - Homepage
- `/about` - About
- `/blog` - Blog listing
- `/blog/[any-slug]` - Blog post (pick 3)
- `/blog/tag/[any-tag]` - Tag filtered
- `/speaking` - Speaking
- `/speaking/kit` - Speaker kit
- `/projects` - Projects
- `/notes` - Notes
- `/notes/[any-slug]` - Individual note
- `/shorts` - Shorts
- `/stream` - Stream
- `/privacy` - Privacy
- `/acknowledgements` - Acknowledgements
- `/404` - 404 (visit non-existent URL)

**Step 2: Verify data endpoints**

```bash
curl -s http://localhost:4321/rss.xml | head -5
curl -s http://localhost:4321/feed.json | python3 -m json.tool > /dev/null && echo "Valid JSON"
curl -s http://localhost:4321/search.json | python3 -m json.tool > /dev/null && echo "Valid JSON"
```

**Step 3: Verify OG images**

Visit `/og/[any-blog-slug].png` in browser.

**Step 4: Check for console errors**

Open browser DevTools on each page and verify no JavaScript errors.

**Step 5: Document any remaining issues**

If issues found, create follow-up tasks. Otherwise mark validation complete.

---

## Task Dependencies

```
Task 1 (branch + rename) → ALL other tasks
Task 2 (Tailwind config) → Tasks 3+
Task 3 (global CSS) → Tasks 4+
Task 4 (BaseHead) → Tasks 5+
Task 5 (DarkModeToggle) → Task 6+
Task 6 (BaseLayout) → Tasks 7, 8, 17-22
Tasks 7-8 (Header, Footer) → Tasks 17-22 (pages)
Task 9 (UI components) → Tasks 15, 17-22 (home + pages)
Task 10 (containers) → Tasks 17-22 (pages)
Tasks 11-16 (icons, search, waves, embeds, home, partials) → Tasks 17-22 (pages)
Tasks 17-22 (all pages) → Task 23 (OG images, can run parallel)
Tasks 17-22 → Task 24 (syntax theme)
ALL tasks → Task 25 (cleanup)
Task 25 → Task 26 (validation)
```

Tasks 7-16 can largely run in parallel once tasks 1-6 are complete.
Tasks 17-22 can largely run in parallel once tasks 7-16 are complete.
