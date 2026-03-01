# UX Remaining Fixes — Design Document

**Date:** 2026-03-01
**Branch:** redesign/indigo-ink
**Context:** Post-audit remediation. A full UX/IA audit identified 28 issues; 17 were resolved in the Indigo Ink redesign. This design covers the remaining 12 items.

---

## Scope

12 items across 3 implementation waves:

| ID | Item | Wave | Severity |
|----|------|------|----------|
| H | Header/body separator on blog posts | 1 | Medium |
| I | H2 heading size reduction | 1 | Medium |
| J | Blockquote border-radius fix | 1 | Low |
| K | Body text opacity | 1 | Low |
| L | Speaking page subtitle copy | 1 | Low |
| B | Table of contents (sticky sidebar) | 2 | Medium |
| C | Previous/next post navigation | 2 | Medium |
| D | Share buttons (copy + Mastodon + LinkedIn + Bluesky) | 2 | Medium |
| F | Author bio card with indigo-ring avatar | 2 | Low |
| M | Speaker kit CTA at top of speaking page | 2 | Low |
| G | "More" dropdown in desktop header nav | 3 | Low |

### Explicitly excluded

- **Pagination**: User decision — keep all posts on one page (lazy-loaded images already in place).
- **Reading time on individual posts**: Not needed; stays on listing cards only.
- **Social sharing on mobile via native share API**: Deferred — use individual platform buttons for now.

---

## Wave 1 — CSS and copy fixes

Pure styling and text changes. No new components, no layout changes.

### H. Header/body separator

Add a visible border between the article header (breadcrumb, tags, title, meta, hero image) and the prose body content.

**File:** `src/src/layouts/BlogPostLayout.astro`

- Add `border-bottom: 1px solid var(--color-border)` and `padding-bottom: 1.5rem` to the article header wrapper.
- Add `margin-top: 1.5rem` to the prose section to create breathing room.

### I. H2 heading size

Reduce H2 from 28–30px to 22–24px to better match the Indigo Ink mockup spec (which calls for 18–21px, but that's too small for readability).

**File:** `src/src/styles/markdown.css`

- Change base H2 from `1.75rem` to `1.375rem` (22px)
- Change H2 at `sm` breakpoint from `1.875rem` to `1.5rem` (24px)

### J. Blockquote border-radius

Match mockup: right corners rounded, left flush with the 3px border.

**File:** `src/src/styles/markdown.css`

- Change `border-radius: 0.25rem` to `border-radius: 0 0.625rem 0.625rem 0`

### K. Body text opacity

Add subtle opacity to body paragraphs for the editorial feel shown in the mockup.

**File:** `src/src/styles/markdown.css`

- Add `opacity: 0.92` to `.prose p` selector

### L. Speaking page subtitle

Shorten the verbose subtitle to match the blog page's concise style.

**File:** `src/src/pages/speaking/index.astro`

- Change subtitle from: "I'm passionate about open-source, green software, and Microsoft AI: you can find here previous conference talks, media mentions, and other speaking engagements."
- To: "on open source, green software, and AI"

---

## Wave 2 — New components

Self-contained components wired into existing layouts.

### B. Table of Contents (sticky sidebar)

**New file:** `src/src/components/partials/TableOfContents.astro`

**Behaviour:**
- Extracts H2/H3 headings from the article using Astro's `getHeadings()` API
- Desktop (≥1024px): Sticky sidebar to the right of the article content
- Mobile (<1024px): Collapsible `<details>` element above the article body
- Active section highlighting via IntersectionObserver (client-side JS)

**Layout change in BlogPostLayout.astro:**
- Wrap article content in a two-column CSS grid on desktop: `grid-template-columns: 1fr 16rem` at ≥1024px
- ToC lives in the right column as a sticky `<aside>`
- On mobile: single column, ToC rendered above prose as collapsible

**Styling (Indigo Ink):**
- Background: `var(--color-surface)` with `var(--color-border)` border
- Active heading: `var(--color-primary)` text + left border accent
- Inactive headings: `var(--color-text-muted)`
- H3 items indented under their parent H2
- Rounded corners: `var(--radius-md)`
- Font: Bricolage Grotesque, 0.8125rem

### C. Previous/next post navigation

**New file:** `src/src/components/partials/PostNavigation.astro`

**Props:** `prevPost?: { slug, title }`, `nextPost?: { slug, title }`

**Behaviour:**
- Two cards side by side on desktop (≥640px), stacked on mobile
- Left card: "← Previous" label + post title, links to prev post
- Right card: "Next →" label + post title, links to next post
- If only one exists, that card takes full width

**Position:** After article body, before RelatedPosts component.

**Data:** Computed in `BlogPostLayout.astro` from the sorted blog collection — find adjacent posts by publication date.

**Styling:**
- Surface cards with border, card-glow shadow
- Primary colour on hover
- Arrow indicators (← →) using SVG or CSS
- Font: Bricolage Grotesque for labels, Source Serif 4 for titles

### D. Share buttons

**New file:** `src/src/components/partials/ShareButtons.astro`

**Props:** `url: string`, `title: string`

**Actions (4 buttons):**
1. **Copy link** — Copies URL to clipboard, shows "Copied!" feedback (2s timeout)
2. **Mastodon** — Opens share intent: user enters their instance (or uses a default Mastodon share URL pattern)
3. **LinkedIn** — Opens `https://www.linkedin.com/sharing/share-offsite/?url={url}`
4. **Bluesky** — Opens `https://bsky.app/intent/compose?text={title}+{url}`

**Position:** Below the article header meta row, above the prose content (after the separator from item H). Horizontal row of small icon buttons with text labels.

**Styling:**
- Small pill buttons: `var(--color-surface)` background, `var(--color-border)` border
- Icon + label (e.g., copy icon + "Copy link")
- Hover: `var(--color-primary-muted)` background
- Gap: 0.5rem between buttons
- Font: Bricolage Grotesque, 0.75rem

### F. Author bio card

**New file:** `src/src/components/partials/AuthorCard.astro`

**Content (aligned with docs/platform-profiles.md):**
- Avatar: `/chris/portrait.jpg` with indigo ring (3px border in `var(--color-primary)`, `border-radius: 9999px`)
- Name: "Chris Lloyd-Jones"
- Title: "VP, AI Consulting Transformation at Kyndryl"
- Bio (1 line): "6x Microsoft AI MVP. Doctoral researcher in Green Software Engineering. Co-host of Securing the Realm. // open, sustainable, real"
- Social links: GitHub, LinkedIn, Mastodon, Bluesky (icon buttons, matching footer style)

**Position:** After article body, before PostNavigation component.

**Styling:**
- Surface card with border and card-glow
- Horizontal layout on desktop (avatar left, text right), stacked on mobile
- Avatar: 64px with 3px `var(--color-primary)` ring
- Rounded corners: `var(--radius-lg)`

### M. Speaker kit CTA at top of speaking page

**File:** `src/src/pages/speaking/index.astro`

**Change:** Add an inline CTA link right after the PageHeader subtitle, before the upcoming talks section. Something like:

```
<p class="speaking-kit-link">
  <a href="/speaking/kit">View my speaker kit →</a>
</p>
```

Keep the existing bottom CTA card as well. The top link is subtle (text link style), the bottom card is prominent.

**Styling:** Primary colour link, Bricolage Grotesque font, arrow indicator.

---

## Wave 3 — Navigation restructure

### G. "More" dropdown in desktop header

**File:** `src/src/components/partials/Header.astro`

**Behaviour:**
- After the 5 primary nav items (About, Blog, Speaking, Projects, Notes), add a "More" button
- On click: dropdown panel appears below the button
- Dropdown contains: Shorts, Stream, Colophon (linking to /shorts, /stream, /acknowledgements)
- Click outside or press Escape to close
- Keyboard: Enter/Space opens, arrow keys navigate items, Escape closes

**ARIA:**
- Button: `aria-haspopup="true"`, `aria-expanded="false|true"`
- Dropdown: `role="menu"`
- Items: `role="menuitem"`

**Styling:**
- Trigger: Same style as other nav items, with a small chevron indicator (▾)
- Dropdown: `var(--color-surface)` background, `var(--color-border)` border, `var(--color-card-glow)` shadow
- Items: Same hover style as main nav (primary colour + primary-muted background)
- Rounded corners: `var(--radius-md)`
- Positioned absolutely below the trigger button

**Client-side JS:** Small inline `<script>` for toggle behaviour, outside click detection, keyboard navigation, and focus trapping.

---

## Component ordering on blog post pages

After all changes, the blog post page structure will be:

```
Header (nav + search + dark mode toggle)
  Breadcrumb
  Tags (pills)
  Title (H1)
  Meta (date · author)
  Hero image (if present)
  Share buttons          ← NEW (D)
  Separator              ← NEW (H)
  [Table of Contents]    ← NEW (B, mobile only — collapsible)
  Two-column grid:
    Left: Article prose
    Right: Table of Contents (sticky sidebar, desktop only) ← NEW (B)
  Author bio card        ← NEW (F)
  Post navigation        ← NEW (C)
  Related posts          (existing)
  Webmentions            (existing)
  Discussion/comments    (existing)
Footer
```

---

## Out of scope

- About page bio alignment with platform profiles (separate task)
- Newsletter/email signup
- Contact form
- Blog post sidebar beyond ToC
- Notes tag filtering
