# UX Remaining Fixes — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 11 remaining UX issues from the site audit: mockup alignment (CSS), new blog post components (ToC, prev/next, share, author bio), speaking page copy + CTA, and a "More" dropdown in desktop nav.

**Architecture:** Wave 1 edits existing CSS/markup only. Wave 2 creates 5 new Astro components wired into BlogPostLayout. Wave 3 adds a dropdown to the shared Header component with client-side JS.

**Tech Stack:** Astro 5, Tailwind CSS, vanilla JS (no React for these components — all server-rendered Astro with small `<script>` blocks for interactivity).

**Verification:** No test framework exists. Each task verified by running `bun run dev` in `src/` and checking visually, plus `bun run lint` for Biome compliance.

---

## Wave 1: CSS and Copy Fixes

### Task 1: Fix blockquote border-radius

**Files:**
- Modify: `src/src/styles/markdown.css:119`

**Step 1: Edit the blockquote border-radius**

In `src/src/styles/markdown.css`, line 119, change:
```css
border-radius: 0.25rem;
```
to:
```css
border-radius: 0 0.625rem 0.625rem 0;
```

This gives right corners the radius while keeping the left side flush with the 3px border.

**Step 2: Verify visually**

Run: `cd src && bun run dev`

Open a blog post with a blockquote (e.g. http://localhost:4321/blog/str-your-ai-agents-need-a-bouncer/). Confirm the blockquote has rounded right corners and flat left edge.

**Step 3: Lint**

Run: `cd src && bun run lint`

Expected: No errors in markdown.css.

**Step 4: Commit**

```bash
git add src/src/styles/markdown.css
git commit -m "fix: align blockquote border-radius with Indigo Ink mockup"
```

---

### Task 2: Reduce H2 heading size

**Files:**
- Modify: `src/src/styles/markdown.css:37` and `src/src/styles/markdown.css:220`

**Step 1: Reduce H2 base size**

In `src/src/styles/markdown.css`, line 37, change:
```css
font-size: 1.75rem;
```
to:
```css
font-size: 1.375rem;
```

**Step 2: Reduce H2 responsive size**

In the same file, line 220 (inside the `@media (min-width: 640px)` block), change:
```css
font-size: 1.875rem;
```
to:
```css
font-size: 1.5rem;
```

**Step 3: Verify visually**

Open a blog post with H2 headings. Confirm they're visibly smaller than before (22px base, 24px on tablet+) but still clearly larger than body text.

**Step 4: Lint and commit**

```bash
cd src && bun run lint
git add src/src/styles/markdown.css
git commit -m "fix: reduce H2 size to match Indigo Ink mockup (22-24px)"
```

---

### Task 3: Add body text opacity

**Files:**
- Modify: `src/src/styles/markdown.css:82-85`

**Step 1: Add opacity to prose paragraphs**

In `src/src/styles/markdown.css`, after line 84 (`margin-bottom: 1.25em;`), add:
```css
  opacity: 0.92;
```

The full rule becomes:
```css
.prose p {
  margin-top: 1.25em;
  margin-bottom: 1.25em;
  opacity: 0.92;
}
```

**Step 2: Verify visually**

Open a blog post. Body text should appear very slightly softer than full opacity — subtle, not washed out. Headings should remain fully opaque.

**Step 3: Lint and commit**

```bash
cd src && bun run lint
git add src/src/styles/markdown.css
git commit -m "fix: add 0.92 opacity to prose paragraphs per mockup"
```

---

### Task 4: Add header/body separator on blog posts

**Files:**
- Modify: `src/src/layouts/BlogPostLayout.astro:183-184`

**Step 1: Add separator before prose content**

In `src/src/layouts/BlogPostLayout.astro`, insert a separator div before line 184 (the prose div). Find:
```html
    <!-- Article body -->
    <div class="e-content prose prose-lg">
```

Replace with:
```html
    <!-- Separator -->
    <hr class="article-separator" />

    <!-- Article body -->
    <div class="e-content prose prose-lg">
```

**Step 2: Add the separator styling**

In the same file's `<style>` block (after the `.article-reply-to-link:hover` rule, around line 374), add:
```css
  /* Header/body separator */
  .article-separator {
    border: 0;
    height: 1px;
    background: var(--color-border);
    margin: 0 0 2rem;
  }
```

**Step 3: Verify visually**

Open a blog post. Confirm a subtle horizontal line appears between the meta row (or hero image if present) and the article body text.

**Step 4: Lint and commit**

```bash
cd src && bun run lint
git add src/src/layouts/BlogPostLayout.astro
git commit -m "feat: add header/body separator on blog posts"
```

---

### Task 5: Shorten speaking page subtitle + add top CTA

**Files:**
- Modify: `src/src/pages/speaking/index.astro:71` and `~75`

**Step 1: Update the subtitle**

In `src/src/pages/speaking/index.astro`, line 71, change:
```
subtitle="I'm passionate about open-source, green software, and Microsoft AI: you can find here previous conference talks, media mentions, and other speaking engagements."
```
to:
```
subtitle="on open source, green software, and AI"
```

**Step 2: Add speaker kit CTA after PageHeader**

After line 73 (the closing `/>` of `PageHeader`), insert:
```astro
    <p class="speaking-kit-toplink">
      <a href="/speaking/kit" class="speaking-kit-toplink__anchor">
        View my speaker kit
        <svg xmlns="http://www.w3.org/2000/svg" class="speaking-kit-toplink__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </a>
    </p>
```

**Step 3: Add the CTA styling**

In the same file's `<style>` block, add before the existing `.speaking-upcoming` rule:
```css
  /* Top speaker kit link */
  .speaking-kit-toplink {
    margin-bottom: 2rem;
  }

  .speaking-kit-toplink__anchor {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-family: 'Bricolage Grotesque', system-ui, sans-serif;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-primary);
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out);
  }

  .speaking-kit-toplink__anchor:hover {
    color: var(--color-accent);
  }

  .speaking-kit-toplink__icon {
    width: 0.875rem;
    height: 0.875rem;
  }
```

**Step 4: Verify visually**

Open http://localhost:4321/speaking. Confirm:
- Subtitle is now "on open source, green software, and AI"
- A "View my speaker kit →" link appears below the header, before the talks
- The bottom CTA card still exists

**Step 5: Lint and commit**

```bash
cd src && bun run lint
git add src/src/pages/speaking/index.astro
git commit -m "feat: shorten speaking subtitle and add top speaker kit CTA"
```

---

## Wave 2: New Blog Post Components

### Task 6: Create ShareButtons component

**Files:**
- Create: `src/src/components/partials/ShareButtons.astro`
- Modify: `src/src/layouts/BlogPostLayout.astro` (import + render)

**Step 1: Create the ShareButtons component**

Create `src/src/components/partials/ShareButtons.astro`:

```astro
---
interface Props {
  url: string
  title: string
}

const { url, title } = Astro.props
const encodedUrl = encodeURIComponent(url)
const encodedTitle = encodeURIComponent(title)
const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
const blueskyUrl = `https://bsky.app/intent/compose?text=${encodedTitle}%20${encodedUrl}`
---

<div class="share-buttons" aria-label="Share this article">
  <span class="share-label">Share</span>
  <button class="share-btn" data-copy-url={url} aria-label="Copy link to clipboard">
    <svg xmlns="http://www.w3.org/2000/svg" class="share-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
    <span class="share-btn-text" data-default="Copy link" data-copied="Copied!">Copy link</span>
  </button>
  <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" class="share-btn" aria-label="Share on LinkedIn">
    <svg xmlns="http://www.w3.org/2000/svg" class="share-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
    <span class="share-btn-text">LinkedIn</span>
    <span class="sr-only">(opens in new tab)</span>
  </a>
  <a href={blueskyUrl} target="_blank" rel="noopener noreferrer" class="share-btn" aria-label="Share on Bluesky">
    <svg xmlns="http://www.w3.org/2000/svg" class="share-icon" viewBox="0 0 576 512" fill="currentColor" aria-hidden="true">
      <path d="M407.8 294.7c-3.3-.4-6.7-.8-10-1.3 3.4.4 6.7.9 10 1.3zM288 227.1C261.9 176.4 190.9 81.9 124.9 35.3 61.6-9.4 37.5-1.7 21.6 5.5 3.3 13.8 0 41.9 0 58.4S9.1 194 15 213.9c19.5 65.7 89.1 87.9 153.2 80.7 3.3-.5 6.6-.9 10-1.4-3.3.5-6.6 1-10 1.4C60.8 googled.7 19.7 396.1 56.7 467.4c34.5 66.4 139.6 143.4 231.3 37.1l.1-.1.1.1c91.7 106.3 196.8 29.3 231.3-37.1 36.9-71.3-4.1-174.8-111.5-186.7 3.4-.4 6.7-.9 10-1.4-3.4.5-6.7 1-10 1.4 64.1 7.1 133.7-15.1 153.2-80.7C566.9 194 576 75 576 58.4s-3.3-44.7-21.6-52.9c-15.8-7.1-40-14.9-103.2 29.8C385.1 81.9 314.1 176.4 288 227.1z" />
    </svg>
    <span class="share-btn-text">Bluesky</span>
    <span class="sr-only">(opens in new tab)</span>
  </a>
  <a class="share-btn share-btn--mastodon" aria-label="Share on Mastodon" role="button" tabindex="0" data-mastodon-url={`${title}\n${url}`}>
    <svg xmlns="http://www.w3.org/2000/svg" class="share-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 00.023-.043v-1.809a.052.052 0 00-.02-.041.053.053 0 00-.046-.01 20.282 20.282 0 01-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 01-.319-1.433.053.053 0 01.066-.054 19.357 19.357 0 004.636.528c.484 0 .968-.008 1.45-.031 2.024-.098 4.17-.29 6.115-.84l.144-.04c2.407-.654 4.503-2.68 4.72-7.094.009-.157.039-1.637.039-1.8 0-.55.18-3.897-.025-5.456z" />
    </svg>
    <span class="share-btn-text">Mastodon</span>
  </a>
</div>

<style>
  .share-buttons {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .share-label {
    font-family: 'Bricolage Grotesque', system-ui, sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-subtle);
    margin-right: 0.25rem;
  }

  .share-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: var(--radius-full);
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text-muted);
    font-family: 'Bricolage Grotesque', system-ui, sans-serif;
    font-size: 0.75rem;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: background var(--duration-fast) var(--ease-out),
                border-color var(--duration-fast) var(--ease-out),
                color var(--duration-fast) var(--ease-out);
  }

  .share-btn:hover {
    background: var(--color-primary-muted);
    border-color: var(--color-border-strong);
    color: var(--color-primary);
  }

  .share-btn:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .share-icon {
    width: 0.875rem;
    height: 0.875rem;
    flex-shrink: 0;
  }
</style>

<script>
  document.addEventListener('astro:page-load', () => {
    // Copy link button
    const copyBtns = document.querySelectorAll<HTMLButtonElement>('[data-copy-url]')
    for (const btn of copyBtns) {
      btn.addEventListener('click', async () => {
        const url = btn.dataset.copyUrl
        if (!url) return
        try {
          await navigator.clipboard.writeText(url)
          const textEl = btn.querySelector('.share-btn-text')
          if (textEl) {
            textEl.textContent = textEl.getAttribute('data-copied') ?? 'Copied!'
            setTimeout(() => {
              textEl.textContent = textEl.getAttribute('data-default') ?? 'Copy link'
            }, 2000)
          }
        } catch {
          // Fallback: select from a temporary input
          const input = document.createElement('input')
          input.value = url
          document.body.appendChild(input)
          input.select()
          document.execCommand('copy')
          document.body.removeChild(input)
        }
      })
    }

    // Mastodon share — prompt for instance
    const mastodonBtns = document.querySelectorAll<HTMLElement>('[data-mastodon-url]')
    for (const btn of mastodonBtns) {
      btn.addEventListener('click', () => {
        const text = btn.dataset.mastodonUrl ?? ''
        const instance = window.prompt('Enter your Mastodon instance (e.g. fosstodon.org):')
        if (instance) {
          const cleanInstance = instance.replace(/^https?:\/\//, '').replace(/\/$/, '')
          window.open(`https://${cleanInstance}/share?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
        }
      })
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          btn.click()
        }
      })
    }
  })
</script>
```

**Step 2: Wire ShareButtons into BlogPostLayout**

In `src/src/layouts/BlogPostLayout.astro`:

Add import at line 8 (after the RelatedPosts import):
```typescript
import ShareButtons from "../components/partials/ShareButtons.astro";
```

Insert the component right before the separator (before the `<!-- Separator -->` comment added in Task 4). The share buttons go between the hero/meta section and the separator:
```astro
    <!-- Share buttons -->
    <ShareButtons url={canonicalURL.href} title={title} />

    <!-- Separator -->
```

**Step 3: Verify visually**

Open a blog post. Confirm:
- "Share" label + 4 buttons appear above the separator
- "Copy link" copies URL and shows "Copied!" feedback
- LinkedIn and Bluesky open share intents in new tabs
- Mastodon prompts for instance then opens share URL

**Step 4: Lint and commit**

```bash
cd src && bun run lint
git add src/src/components/partials/ShareButtons.astro src/src/layouts/BlogPostLayout.astro
git commit -m "feat: add share buttons to blog posts (copy, LinkedIn, Bluesky, Mastodon)"
```

---

### Task 7: Create AuthorCard component

**Files:**
- Create: `src/src/components/partials/AuthorCard.astro`
- Modify: `src/src/layouts/BlogPostLayout.astro` (import + render)

**Step 1: Create the AuthorCard component**

Create `src/src/components/partials/AuthorCard.astro`:

```astro
---
// Author bio aligned with docs/platform-profiles.md
---

<aside class="author-card" aria-label="About the author">
  <div class="author-card__avatar-wrap">
    <img
      src="/chris/portrait.jpg"
      alt="Chris Lloyd-Jones"
      width="64"
      height="64"
      loading="lazy"
      decoding="async"
      class="author-card__avatar"
    />
  </div>
  <div class="author-card__body">
    <span class="author-card__name">Chris Lloyd-Jones</span>
    <span class="author-card__title">VP, AI Consulting Transformation at Kyndryl</span>
    <p class="author-card__bio">
      6x Microsoft AI MVP. Doctoral researcher in Green Software Engineering at UEL. Co-host of <a href="https://securing.quest/" target="_blank" rel="noopener noreferrer">Securing the Realm</a>. // open, sustainable, real
    </p>
    <div class="author-card__links">
      <a href="https://github.com/sealjay" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
        <svg xmlns="http://www.w3.org/2000/svg" class="author-card__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
      </a>
      <a href="https://uk.linkedin.com/in/chrislloydjones" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
        <svg xmlns="http://www.w3.org/2000/svg" class="author-card__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      </a>
      <a href="https://fosstodon.org/@sealjay" target="_blank" rel="me noopener noreferrer" aria-label="Mastodon">
        <svg xmlns="http://www.w3.org/2000/svg" class="author-card__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 00.023-.043v-1.809a.052.052 0 00-.02-.041.053.053 0 00-.046-.01 20.282 20.282 0 01-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 01-.319-1.433.053.053 0 01.066-.054 19.357 19.357 0 004.636.528c.484 0 .968-.008 1.45-.031 2.024-.098 4.17-.29 6.115-.84l.144-.04c2.407-.654 4.503-2.68 4.72-7.094.009-.157.039-1.637.039-1.8 0-.55.18-3.897-.025-5.456z"/></svg>
      </a>
      <a href="https://bsky.app/profile/sealjay.com" target="_blank" rel="noopener noreferrer" aria-label="Bluesky">
        <svg xmlns="http://www.w3.org/2000/svg" class="author-card__icon" viewBox="0 0 576 512" fill="currentColor" aria-hidden="true"><path d="M407.8 294.7c-3.3-.4-6.7-.8-10-1.3 3.4.4 6.7.9 10 1.3zM288 227.1C261.9 176.4 190.9 81.9 124.9 35.3 61.6-9.4 37.5-1.7 21.6 5.5 3.3 13.8 0 41.9 0 58.4S9.1 194 15 213.9c19.5 65.7 89.1 87.9 153.2 80.7 3.3-.5 6.6-.9 10-1.4-3.3.5-6.6 1-10 1.4C60.8 304.7 19.7 396.1 56.7 467.4c34.5 66.4 139.6 143.4 231.3 37.1l.1-.1.1.1c91.7 106.3 196.8 29.3 231.3-37.1 36.9-71.3-4.1-174.8-111.5-186.7 3.4-.4 6.7-.9 10-1.4-3.4.5-6.7 1-10 1.4 64.1 7.1 133.7-15.1 153.2-80.7C566.9 194 576 75 576 58.4s-3.3-44.7-21.6-52.9c-15.8-7.1-40-14.9-103.2 29.8C385.1 81.9 314.1 176.4 288 227.1z"/></svg>
      </a>
    </div>
  </div>
</aside>

<style>
  .author-card {
    display: flex;
    gap: 1.25rem;
    padding: 1.5rem;
    border-radius: var(--radius-lg);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    box-shadow: var(--color-card-glow);
    margin-top: 3rem;
  }

  .author-card__avatar-wrap {
    flex-shrink: 0;
  }

  .author-card__avatar {
    width: 64px;
    height: 64px;
    border-radius: 9999px;
    object-fit: cover;
    border: 3px solid var(--color-primary);
  }

  .author-card__body {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .author-card__name {
    font-family: 'Bricolage Grotesque', system-ui, sans-serif;
    font-weight: 700;
    font-size: 1rem;
    color: var(--color-text);
  }

  .author-card__title {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
  }

  .author-card__bio {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    line-height: 1.5;
    margin: 0.25rem 0 0;
  }

  .author-card__bio a {
    color: var(--color-primary);
    text-decoration: none;
  }

  .author-card__bio a:hover {
    text-decoration: underline;
  }

  .author-card__links {
    display: flex;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .author-card__icon {
    width: 1rem;
    height: 1rem;
    color: var(--color-text-subtle);
    transition: color var(--duration-fast) var(--ease-out);
  }

  .author-card__icon:hover {
    color: var(--color-primary);
  }

  @media (max-width: 479px) {
    .author-card {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .author-card__links {
      justify-content: center;
    }
  }
</style>
```

**Step 2: Wire AuthorCard into BlogPostLayout**

In `src/src/layouts/BlogPostLayout.astro`:

Add import after the ShareButtons import:
```typescript
import AuthorCard from "../components/partials/AuthorCard.astro";
```

Insert `<AuthorCard />` after the prose div closing tag (after line 186 `</div>`) but still inside the `<article>` tag:
```astro
    </div>

    <!-- Author -->
    <AuthorCard />
  </article>
```

**Step 3: Verify visually**

Open a blog post. Confirm the author card appears below the article body with:
- Avatar photo with indigo ring
- Name, title, bio, social links
- Responsive layout (stacks on mobile)

**Step 4: Lint and commit**

```bash
cd src && bun run lint
git add src/src/components/partials/AuthorCard.astro src/src/layouts/BlogPostLayout.astro
git commit -m "feat: add author bio card with indigo-ring avatar to blog posts"
```

---

### Task 8: Create PostNavigation component

**Files:**
- Create: `src/src/components/partials/PostNavigation.astro`
- Modify: `src/src/layouts/BlogPostLayout.astro` (import + render + compute prev/next)

**Step 1: Create the PostNavigation component**

Create `src/src/components/partials/PostNavigation.astro`:

```astro
---
interface Props {
  prevPost?: { slug: string; title: string }
  nextPost?: { slug: string; title: string }
}

const { prevPost, nextPost } = Astro.props
if (!prevPost && !nextPost) return
---

<nav class="post-nav" aria-label="Previous and next articles">
  {prevPost ? (
    <a href={`/blog/${prevPost.slug}/`} class="post-nav__link post-nav__link--prev">
      <span class="post-nav__label">
        <svg xmlns="http://www.w3.org/2000/svg" class="post-nav__arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Previous
      </span>
      <span class="post-nav__title">{prevPost.title}</span>
    </a>
  ) : (
    <div />
  )}
  {nextPost ? (
    <a href={`/blog/${nextPost.slug}/`} class="post-nav__link post-nav__link--next">
      <span class="post-nav__label">
        Next
        <svg xmlns="http://www.w3.org/2000/svg" class="post-nav__arrow" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </span>
      <span class="post-nav__title">{nextPost.title}</span>
    </a>
  ) : (
    <div />
  )}
</nav>

<style>
  .post-nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-top: 2rem;
  }

  @media (max-width: 639px) {
    .post-nav {
      grid-template-columns: 1fr;
    }
  }

  .post-nav__link {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    padding: 1rem 1.25rem;
    border-radius: var(--radius-md);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    box-shadow: var(--color-card-glow);
    text-decoration: none;
    transition: border-color var(--duration-fast) var(--ease-out),
                transform var(--duration-fast) var(--ease-out);
  }

  .post-nav__link:hover {
    border-color: var(--color-border-strong);
    transform: translateY(-2px);
  }

  .post-nav__link:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .post-nav__link--next {
    text-align: right;
  }

  .post-nav__label {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-family: 'Bricolage Grotesque', system-ui, sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-primary);
  }

  .post-nav__link--next .post-nav__label {
    justify-content: flex-end;
  }

  .post-nav__arrow {
    width: 0.875rem;
    height: 0.875rem;
  }

  .post-nav__title {
    font-family: 'Source Serif 4', Georgia, serif;
    font-size: 0.9375rem;
    line-height: 1.4;
    color: var(--color-text);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
```

**Step 2: Compute prev/next posts in BlogPostLayout**

In `src/src/layouts/BlogPostLayout.astro` frontmatter, add at the top (after existing imports, around line 8):
```typescript
import PostNavigation from "../components/partials/PostNavigation.astro";
import { getCollection } from "astro:content";
```

Then after line 20 (`const displayHeroImage = ...`), add:
```typescript
// Compute prev/next posts
const allPosts = (await getCollection("blog")).sort(
  (a, b) => b.data.pubDateTime.valueOf() - a.data.pubDateTime.valueOf()
);
const currentIndex = allPosts.findIndex((p) => p.slug === slug);
const prevPost = currentIndex < allPosts.length - 1
  ? { slug: allPosts[currentIndex + 1].slug, title: allPosts[currentIndex + 1].data.title }
  : undefined;
const nextPost = currentIndex > 0
  ? { slug: allPosts[currentIndex - 1].slug, title: allPosts[currentIndex - 1].data.title }
  : undefined;
```

Note: "prev" = older post (higher index in reverse-chronological array), "next" = newer post (lower index).

**Step 3: Render PostNavigation**

Insert after `<AuthorCard />` but still inside `<article>`:
```astro
    <AuthorCard />

    <!-- Post navigation -->
    <PostNavigation prevPost={prevPost} nextPost={nextPost} />
  </article>
```

**Step 4: Verify visually**

Open a blog post that has both prev and next posts (not the first or last). Confirm:
- Two cards appear side by side below the author card
- "Previous" has left arrow, "Next" has right arrow
- Titles display correctly, links work
- On mobile, cards stack vertically

**Step 5: Lint and commit**

```bash
cd src && bun run lint
git add src/src/components/partials/PostNavigation.astro src/src/layouts/BlogPostLayout.astro
git commit -m "feat: add previous/next post navigation to blog posts"
```

---

### Task 9: Create TableOfContents component

**Files:**
- Create: `src/src/components/partials/TableOfContents.astro`
- Modify: `src/src/layouts/BlogPostLayout.astro` (import + render + layout grid)

This is the most complex task — it changes the blog post layout from single-column to a two-column grid on desktop.

**Step 1: Create the TableOfContents component**

Create `src/src/components/partials/TableOfContents.astro`:

```astro
---
interface Heading {
  depth: number
  slug: string
  text: string
}

interface Props {
  headings: Heading[]
}

const { headings } = Astro.props
// Only show H2 and H3 in the ToC
const tocHeadings = headings.filter((h) => h.depth === 2 || h.depth === 3)
if (tocHeadings.length === 0) return
---

<!-- Mobile: collapsible above article -->
<details class="toc-mobile">
  <summary class="toc-summary">
    <span class="toc-summary-text">Table of contents</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="toc-chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </summary>
  <nav aria-label="Table of contents">
    <ol class="toc-list">
      {tocHeadings.map((h) => (
        <li class:list={['toc-item', { 'toc-item--nested': h.depth === 3 }]}>
          <a href={`#${h.slug}`} class="toc-link">{h.text}</a>
        </li>
      ))}
    </ol>
  </nav>
</details>

<!-- Desktop: sticky sidebar -->
<aside class="toc-desktop" aria-label="Table of contents">
  <div class="toc-sticky">
    <span class="toc-heading">On this page</span>
    <nav>
      <ol class="toc-list">
        {tocHeadings.map((h) => (
          <li class:list={['toc-item', { 'toc-item--nested': h.depth === 3 }]}>
            <a href={`#${h.slug}`} class="toc-link" data-toc-link>{h.text}</a>
          </li>
        ))}
      </ol>
    </nav>
  </div>
</aside>

<style>
  /* Mobile ToC */
  .toc-mobile {
    display: block;
    margin-bottom: 1.5rem;
    border-radius: var(--radius-md);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
  }

  @media (min-width: 1024px) {
    .toc-mobile {
      display: none;
    }
  }

  .toc-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    cursor: pointer;
    list-style: none;
    user-select: none;
  }

  .toc-summary::-webkit-details-marker {
    display: none;
  }

  .toc-summary-text {
    font-family: 'Bricolage Grotesque', system-ui, sans-serif;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .toc-chevron {
    width: 1rem;
    height: 1rem;
    color: var(--color-text-subtle);
    transition: transform var(--duration-fast) var(--ease-out);
  }

  details[open] .toc-chevron {
    transform: rotate(180deg);
  }

  .toc-mobile .toc-list {
    padding: 0 1rem 0.75rem;
  }

  /* Desktop ToC */
  .toc-desktop {
    display: none;
  }

  @media (min-width: 1024px) {
    .toc-desktop {
      display: block;
    }
  }

  .toc-sticky {
    position: sticky;
    top: 5rem;
    max-height: calc(100vh - 6rem);
    overflow-y: auto;
    padding: 1rem;
    border-radius: var(--radius-md);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
  }

  .toc-heading {
    display: block;
    font-family: 'Bricolage Grotesque', system-ui, sans-serif;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-subtle);
    margin-bottom: 0.75rem;
  }

  /* Shared list styles */
  .toc-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .toc-item {
    margin: 0;
  }

  .toc-item--nested {
    padding-left: 0.75rem;
  }

  .toc-link {
    display: block;
    padding: 0.25rem 0.5rem;
    border-left: 2px solid transparent;
    font-family: 'Bricolage Grotesque', system-ui, sans-serif;
    font-size: 0.8125rem;
    font-weight: 400;
    line-height: 1.4;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out),
                border-color var(--duration-fast) var(--ease-out);
  }

  .toc-link:hover {
    color: var(--color-primary);
  }

  .toc-link.active {
    color: var(--color-primary);
    border-left-color: var(--color-primary);
    font-weight: 500;
  }

  .toc-link:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
    border-radius: 2px;
  }
</style>

<script>
  document.addEventListener('astro:page-load', () => {
    const tocLinks = document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]')
    if (tocLinks.length === 0) return

    const headingIds = Array.from(tocLinks).map((link) => {
      const href = link.getAttribute('href')
      return href ? href.slice(1) : ''
    }).filter(Boolean)

    const headingElements = headingIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (headingElements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id
            for (const link of tocLinks) {
              const href = link.getAttribute('href')
              link.classList.toggle('active', href === `#${id}`)
            }
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    )

    for (const heading of headingElements) {
      observer.observe(heading)
    }
  })
</script>
```

**Step 2: Modify BlogPostLayout for two-column grid**

In `src/src/layouts/BlogPostLayout.astro`:

Add import:
```typescript
import TableOfContents from "../components/partials/TableOfContents.astro";
```

You also need access to the headings. Change the component to use `render()`. In the frontmatter, after the prev/next computation, add:
```typescript
// Get headings for ToC — requires the compiled entry
// The headings come from the slot content, so we use Astro.props
```

Actually, Astro blog posts using content collections pass headings differently. The headings need to be passed as a prop from the page that renders this layout (e.g., `[...slug].astro`).

Check the blog post page at `src/src/pages/blog/[...slug].astro` — it should call `entry.render()` which gives `{ Content, headings }`. Pass `headings` as a prop to BlogPostLayout.

In `BlogPostLayout.astro`, add `headings` to the Props type and destructuring:
```typescript
type Props = CollectionEntry<"blog">["data"] & { headings?: { depth: number; slug: string; text: string }[] };

const { title, description, pubDateTime, updatedDate, heroImage, tags, inReplyTo, headings } = Astro.props;
```

Then restructure the article body area. Replace the prose section and everything after it (from the separator through the closing `</article>`) with:

```astro
    <!-- Share buttons -->
    <ShareButtons url={canonicalURL.href} title={title} />

    <!-- Separator -->
    <hr class="article-separator" />

    <!-- Mobile ToC -->
    {headings && headings.length > 0 && (
      <TableOfContents headings={headings} />
    )}

    <!-- Two-column grid: article + sidebar ToC -->
    <div class="article-grid">
      <div class="e-content prose prose-lg">
        <slot />
      </div>
      {headings && headings.length > 0 && (
        <TableOfContents headings={headings} />
      )}
    </div>

    <!-- Author -->
    <AuthorCard />

    <!-- Post navigation -->
    <PostNavigation prevPost={prevPost} nextPost={nextPost} />
  </article>
```

Note: `TableOfContents` is rendered twice — once for mobile (shows the `toc-mobile` element, hidden on desktop) and once inside the grid (shows the `toc-desktop` element, hidden on mobile). The CSS handles which one is visible.

**Step 3: Add the grid CSS**

In the `<style>` block of `BlogPostLayout.astro`, add:
```css
  /* Article grid for ToC sidebar */
  .article-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  @media (min-width: 1024px) {
    .article-grid {
      grid-template-columns: 1fr 14rem;
    }
  }
```

**Step 4: Pass headings from the blog slug page**

Check `src/src/pages/blog/[...slug].astro` — the file that renders individual posts. If it calls `entry.render()`, it gets `{ Content, headings }`. Pass `headings` to the layout:

```astro
<BlogPostLayout {...post.data} headings={headings}>
  <Content />
</BlogPostLayout>
```

If the slug page doesn't exist or uses a different pattern, find the page and adapt accordingly.

**Step 5: Verify visually**

Open a blog post with multiple H2/H3 headings.

Desktop (≥1024px): Confirm:
- Article body on the left, ToC sidebar on the right
- ToC is sticky and follows scroll
- Active heading highlights as you scroll
- Clicking a heading scrolls to it

Mobile (<1024px): Confirm:
- Collapsible "Table of contents" appears above the article
- Opens/closes with chevron animation
- Links work

**Step 6: Lint and commit**

```bash
cd src && bun run lint
git add src/src/components/partials/TableOfContents.astro src/src/layouts/BlogPostLayout.astro src/src/pages/blog/\[...slug\].astro
git commit -m "feat: add sticky table of contents sidebar to blog posts"
```

---

## Wave 3: Navigation Restructure

### Task 10: Add "More" dropdown to desktop header

**Files:**
- Modify: `src/src/components/partials/Header.astro:18-28` (desktop nav section)
- Uses: `SITE_SECONDARY_NAV` from `src/src/consts.ts:15-19`

**Step 1: Import SITE_SECONDARY_NAV**

In `src/src/components/partials/Header.astro`, line 2, change:
```typescript
import { SITE_NAV } from '../../consts'
```
to:
```typescript
import { SITE_NAV, SITE_SECONDARY_NAV } from '../../consts'
```

**Step 2: Add the More dropdown after the nav list**

After line 27 (closing `</ul>` of the nav list), but still inside the `<nav>` tag (before line 28 `</nav>`), add:

```astro
        <div class="more-dropdown">
          <button
            type="button"
            class="more-trigger"
            aria-haspopup="true"
            aria-expanded="false"
            id="more-menu-trigger"
          >
            More
            <svg xmlns="http://www.w3.org/2000/svg" class="more-chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div class="more-panel" id="more-menu-panel" role="menu">
            {SITE_SECONDARY_NAV.map((item) => (
              <a href={item.path} class="more-panel__link" role="menuitem">{item.name}</a>
            ))}
          </div>
        </div>
```

**Step 3: Also add secondary items to the mobile nav**

In the mobile overlay nav list (around line 57-71), after the SITE_NAV map, add the secondary items. Find the closing of the SITE_NAV map and add:

```astro
        {
          SITE_SECONDARY_NAV.map((navitem, index) => (
            <li style={`--stagger: ${SITE_NAV.length + index}`}>
              <a
                href={navitem.path}
                class:list={[
                  'mobile-nav-link mobile-nav-link--secondary',
                  { 'mobile-nav-link--active': Astro.url.pathname === navitem.path || Astro.url.pathname === navitem.path.replace(/\/$/, '') },
                ]}
              >
                {navitem.name}
              </a>
            </li>
          ))
        }
```

**Step 4: Add dropdown CSS**

In the `<style>` block, add after the `.nav-list` styles:
```css
  /* More dropdown */
  .more-dropdown {
    position: relative;
    display: none;
  }

  @media (min-width: 768px) {
    .more-dropdown {
      display: block;
    }
  }

  .more-trigger {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 6px 12px;
    border-radius: var(--radius-sm);
    border: none;
    background: transparent;
    color: var(--color-text-muted);
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: color var(--duration-fast) var(--ease-out),
                background var(--duration-fast) var(--ease-out);
  }

  .more-trigger:hover {
    color: var(--color-primary);
    background: var(--color-primary-muted);
  }

  .more-trigger:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .more-trigger[aria-expanded="true"] {
    color: var(--color-primary);
    background: var(--color-primary-muted);
  }

  .more-chevron {
    width: 14px;
    height: 14px;
    transition: transform var(--duration-fast) var(--ease-out);
  }

  .more-trigger[aria-expanded="true"] .more-chevron {
    transform: rotate(180deg);
  }

  .more-panel {
    display: none;
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 160px;
    padding: 4px;
    border-radius: var(--radius-md);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    box-shadow: var(--color-card-glow), 0 8px 24px rgba(0, 0, 0, 0.12);
    z-index: 50;
  }

  .more-panel.open {
    display: block;
  }

  .more-panel__link {
    display: block;
    padding: 8px 12px;
    border-radius: var(--radius-sm);
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 500;
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color var(--duration-fast) var(--ease-out),
                background var(--duration-fast) var(--ease-out);
  }

  .more-panel__link:hover {
    color: var(--color-primary);
    background: var(--color-primary-muted);
  }

  .more-panel__link:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }

  /* Secondary mobile nav items */
  .mobile-nav-link--secondary {
    font-size: 14px;
    color: var(--color-text-subtle);
  }
```

**Step 5: Add dropdown JS**

In the existing `<script>` block (starting around line 294), add the More dropdown logic inside the `document.addEventListener('astro:page-load', () => {` callback, after the mobile menu code:

```javascript
    // More dropdown
    const moreTrigger = document.getElementById('more-menu-trigger')
    const morePanel = document.getElementById('more-menu-panel')

    if (moreTrigger && morePanel) {
      function openMore() {
        moreTrigger!.setAttribute('aria-expanded', 'true')
        morePanel!.classList.add('open')
      }

      function closeMore() {
        moreTrigger!.setAttribute('aria-expanded', 'false')
        morePanel!.classList.remove('open')
      }

      moreTrigger.addEventListener('click', () => {
        const expanded = moreTrigger.getAttribute('aria-expanded') === 'true'
        if (expanded) {
          closeMore()
        } else {
          openMore()
        }
      })

      // Close on click outside
      document.addEventListener('click', (event) => {
        if (
          moreTrigger.getAttribute('aria-expanded') === 'true' &&
          !moreTrigger.contains(event.target as Node) &&
          !morePanel.contains(event.target as Node)
        ) {
          closeMore()
        }
      })

      // Keyboard navigation
      moreTrigger.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          openMore()
          const firstLink = morePanel.querySelector<HTMLAnchorElement>('.more-panel__link')
          firstLink?.focus()
        }
      })

      morePanel.addEventListener('keydown', (event) => {
        const links = Array.from(morePanel.querySelectorAll<HTMLAnchorElement>('.more-panel__link'))
        const currentIndex = links.indexOf(document.activeElement as HTMLAnchorElement)

        if (event.key === 'ArrowDown') {
          event.preventDefault()
          const next = links[currentIndex + 1] || links[0]
          next?.focus()
        } else if (event.key === 'ArrowUp') {
          event.preventDefault()
          if (currentIndex <= 0) {
            closeMore()
            moreTrigger.focus()
          } else {
            links[currentIndex - 1]?.focus()
          }
        } else if (event.key === 'Escape') {
          closeMore()
          moreTrigger.focus()
        }
      })
    }
```

**Step 6: Verify visually**

On desktop:
- "More" button appears after Notes in the nav
- Clicking opens a dropdown with Shorts, Stream, Colophon
- Clicking outside or pressing Escape closes it
- Arrow keys navigate between items
- ArrowDown from trigger opens and focuses first item

On mobile:
- Shorts, Stream, Colophon appear below the primary nav items
- They're slightly visually differentiated (smaller, subtle colour)

**Step 7: Lint and commit**

```bash
cd src && bun run lint
git add src/src/components/partials/Header.astro
git commit -m "feat: add More dropdown to desktop nav for Shorts, Stream, Colophon"
```

---

## Final Verification

### Task 11: Full visual check and lint

**Step 1: Run full lint**

```bash
cd src && bun run lint
```

Fix any issues.

**Step 2: Run full build**

```bash
cd src && bun run build
```

Fix any build errors.

**Step 3: Visual check across pages**

Start dev server: `cd src && bun run dev`

Check these pages:
- **Homepage** — nav "More" dropdown works
- **Blog listing** — no regressions
- **Blog post** (e.g., `/blog/str-your-ai-agents-need-a-bouncer/`) — all new components visible:
  - Share buttons below meta
  - Separator line
  - Table of contents (mobile + desktop)
  - Two-column layout on desktop
  - Author card with indigo ring
  - Prev/next navigation
  - Related posts still appear
- **Speaking** — shortened subtitle, speaker kit CTA at top and bottom
- **Dark mode** — toggle through both modes, confirm all new components style correctly

**Step 4: Final commit if any fixes needed**

```bash
cd src && bun run lint
git add -A
git commit -m "fix: final cleanup for UX remaining fixes"
```
