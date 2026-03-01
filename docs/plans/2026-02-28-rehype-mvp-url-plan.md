# rehype-mvp-url Plugin Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automatically append `?WT.mc_id=AI-MVP-5004204` to all `*.microsoft.com` links in MDX content.

**Architecture:** A rehype plugin that visits `<a>` elements in the HTML AST, checks for Microsoft URLs, strips existing tracking params, and appends the correct one. Registered on the MDX integration in `astro.config.mjs`.

**Tech Stack:** TypeScript, hast (HTML AST), unist-util-visit (already a transitive dep)

---

### Task 1: Add `unist-util-visit` as an explicit dependency

**Files:**
- Modify: `src/package.json`

**Step 1: Install the package**

Run: `cd /Users/chris.lloyd-jones/git/sealjay-blog/src && bun add unist-util-visit`

Expected: Package added to `dependencies` in `package.json`, `bun.lock` updated.

**Step 2: Commit**

```bash
git add src/package.json src/bun.lock
git commit -m "chore: add unist-util-visit dependency for rehype plugin"
```

---

### Task 2: Create the rehype-mvp-url plugin

**Files:**
- Create: `src/src/plugins/rehype-mvp-url.ts`

**Step 1: Create the plugin file**

```typescript
import type { Element, Properties, Root } from 'hast'
import { visit } from 'unist-util-visit'

const MVP_ID = 'AI-MVP-5004204'

function isMicrosoftUrl(hostname: string): boolean {
  return hostname.endsWith('.microsoft.com') || hostname === 'microsoft.com'
}

function processHref(href: string): string {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return href
  }

  if (!isMicrosoftUrl(url.hostname)) {
    return href
  }

  // Strip existing WT.mc_id (case-insensitive)
  const keysToDelete: string[] = []
  for (const key of url.searchParams.keys()) {
    if (key.toLowerCase() === 'wt.mc_id') {
      keysToDelete.push(key)
    }
  }
  for (const key of keysToDelete) {
    url.searchParams.delete(key)
  }

  url.searchParams.set('WT.mc_id', MVP_ID)

  return url.toString()
}

export default function rehypeMvpUrl(): (tree: Root) => void {
  return (tree: Root): void => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'a') return

      const props: Properties | undefined = node.properties
      if (!props?.href || typeof props.href !== 'string') return

      props.href = processHref(props.href)
    })
  }
}
```

**Step 2: Verify linting passes**

Run: `cd /Users/chris.lloyd-jones/git/sealjay-blog/src && bunx biome check src/plugins/rehype-mvp-url.ts`

Expected: No errors.

**Step 3: Commit**

```bash
git add src/src/plugins/rehype-mvp-url.ts
git commit -m "feat: add rehype-mvp-url plugin for Microsoft URL tracking"
```

---

### Task 3: Register the plugin in astro.config.mjs

**Files:**
- Modify: `src/astro.config.mjs:3` (add import)
- Modify: `src/astro.config.mjs:165` (add to mdx config)

**Step 1: Add the import**

Add after line 3 (`import mdx from '@astrojs/mdx'`):

```javascript
import rehypeMvpUrl from './src/plugins/rehype-mvp-url'
```

**Step 2: Update the mdx() call**

Change line 165 from:

```javascript
    mdx(),
```

to:

```javascript
    mdx({
      rehypePlugins: [rehypeMvpUrl],
    }),
```

**Step 3: Verify the build works**

Run: `cd /Users/chris.lloyd-jones/git/sealjay-blog/src && bun run build`

Expected: Build completes successfully with no errors.

**Step 4: Commit**

```bash
git add src/astro.config.mjs
git commit -m "feat: register rehype-mvp-url plugin in MDX integration"
```

---

### Task 4: Verify the plugin works on real content

**Step 1: Find a blog post with a Microsoft URL**

Run: `cd /Users/chris.lloyd-jones/git/sealjay-blog/src && grep -rl 'microsoft.com' src/content/blog/ | head -3`

**Step 2: Start the dev server and check the output**

Run: `cd /Users/chris.lloyd-jones/git/sealjay-blog/src && bun run dev`

Open one of the blog posts found in Step 1 in a browser. Inspect the rendered HTML and verify that Microsoft links have `?WT.mc_id=AI-MVP-5004204` appended (or `&WT.mc_id=AI-MVP-5004204` if query params already exist — the URL API handles this automatically).

**Step 3: Check that non-Microsoft links are unchanged**

Verify that links to other domains (e.g. GitHub, Wikipedia) are not modified.
