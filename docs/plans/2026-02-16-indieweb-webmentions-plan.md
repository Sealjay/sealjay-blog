# IndieWeb Webmentions Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add full IndieWeb Level 2+3 support — microformats, webmention sending/receiving, reply contexts, Bridgy Fed ActivityPub discovery, and Bridgy backfeed.

**Architecture:** webmention.io as hosted receiver, build-time scripts for sending and syncing, Astro components for display. All data stored as JSON in `src/src/data/`. Bridgy Fed for ActivityPub discovery, Bridgy for Mastodon backfeed.

**Tech Stack:** Astro 5, Bun, webmention.io API, Bridgy Fed, microformats2

---

### Task 1: Add webmention, Bridgy Fed, and verification links to `<head>`

**Files:**
- Modify: `src/src/components/partials/BaseHead.astro`

**Step 1: Add webmention and pingback links**

After the existing identity verification links block (line 78), add:

```astro
<!-- Webmention endpoint (webmention.io) -->
<link rel="webmention" href="https://webmention.io/sealjay.com/webmention" />
<link rel="pingback" href="https://webmention.io/sealjay.com/xmlrpc" />
```

**Step 2: Add Bridgy Fed Bluesky verification link**

After the webmention links, add:

```astro
<!-- Bridgy Fed: Bluesky fediverse bridge verification -->
<link href="https://bsky.brid.gy/ap/did:plc:lamiqq7bkfqygjzdbdz673q3" rel="me" />
```

**Step 3: Add Bridgy Fed ActivityPub discovery link**

After the Bridgy Fed verification link, add:

```astro
<!-- Bridgy Fed: ActivityPub discovery for fediverse search -->
<link rel="alternate" type="application/activity+json" href={`https://fed.brid.gy/r/${canonicalURL}`} />
```

Note: `canonicalURL` is already defined on line 15 of the file.

**Step 4: Verify**

Run: `cd src && bun run dev`

Open http://localhost:4321 and view source. Confirm:
- `<link rel="webmention" ...>` is present
- `<link rel="pingback" ...>` is present
- `<link href="https://bsky.brid.gy/ap/did:plc:..." rel="me" />` is present
- `<link rel="alternate" type="application/activity+json" ...>` is present with correct URL

**Step 5: Commit**

```bash
git add src/src/components/partials/BaseHead.astro
git commit -m "feat: add webmention, Bridgy Fed, and verification links to head"
```

---

### Task 2: Add h-entry microformats to blog post layout

**Files:**
- Modify: `src/src/layouts/BaseLayout.astro`

**Step 1: Add h-entry class to article element**

Change line 55:
```astro
  <article class="max-w-3xl mx-auto my-6 md:my-10 text-zinc-800 dark:text-zinc-200 prose prose-lg dark:prose-invert">
```
to:
```astro
  <article class="h-entry max-w-3xl mx-auto my-6 md:my-10 text-zinc-800 dark:text-zinc-200 prose prose-lg dark:prose-invert">
```

**Step 2: Add p-name to the title h1**

Change line 58:
```astro
      class="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3"
```
to:
```astro
      class="p-name text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3"
```

**Step 3: Add dt-published to the published date**

Change line 67 (the "Published" span):
```astro
        <span>Published <FormattedDate date={pubDateTime} /></span>
```
to:
```astro
        <span>Published <time class="dt-published" datetime={pubDateTime?.toISOString()}><FormattedDate date={pubDateTime} /></time></span>
```

**Step 4: Add e-content to the content wrapper div**

Change line 96:
```astro
    <div class="prose-headings:font-semibold prose-headings:text-zinc-800 dark:prose-headings:text-zinc-100 prose-a:text-accent-600 prose-a:font-semibold dark:prose-a:text-accent-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md">
```
to:
```astro
    <div class="e-content prose-headings:font-semibold prose-headings:text-zinc-800 dark:prose-headings:text-zinc-100 prose-a:text-accent-600 prose-a:font-semibold dark:prose-a:text-accent-400 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-md">
```

**Step 5: Add hidden u-url and p-author h-card**

After the `<article>` opening tag (after line 55), add:

```astro
    <a class="u-url" href={canonicalURL.href} style="display:none">{title}</a>
    <span class="p-author h-card" style="display:none">
      <a class="u-url p-name" href="https://sealjay.com">Chris Lloyd-Jones</a>
    </span>
```

Note: `canonicalURL` is already defined on line 11.

**Step 6: Verify**

Run: `cd src && bun run dev`

Open a blog post and view source. Confirm:
- `<article class="h-entry ...">` present
- `<h1 class="p-name ...">` present
- `<time class="dt-published" datetime="...">` wrapping the date
- `<div class="e-content ...">` wrapping content
- Hidden `u-url` and `p-author h-card` present

**Step 7: Commit**

```bash
git add src/src/layouts/BaseLayout.astro
git commit -m "feat: add h-entry microformats to blog post layout"
```

---

### Task 3: Add h-entry microformats to notes page

**Files:**
- Modify: `src/src/pages/notes/[...slug].astro`

**Step 1: Add h-entry class to each note article**

Change line 74:
```astro
        <article id={note.slug} class="scroll-mt-20">
```
to:
```astro
        <article id={note.slug} class="h-entry scroll-mt-20">
```

**Step 2: Add hidden metadata inside each article**

After line 74 (the article opening tag), add:

```astro
          <a class="u-url" href={`/notes/${dateKey}/#${note.slug}`} style="display:none">{note.data.title || 'Note'}</a>
          <time class="dt-published" datetime={note.data.pubDateTime.toISOString()} style="display:none">{note.data.pubDateTime.toISOString()}</time>
          <span class="p-author h-card" style="display:none">
            <a class="u-url p-name" href="https://sealjay.com">Chris Lloyd-Jones</a>
          </span>
```

**Step 3: Add p-name to note titles**

Change line 78 (inside the note header):
```astro
              <h2 class="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">{note.data.title}</h2>
```
to:
```astro
              <h2 class="p-name text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">{note.data.title}</h2>
```

**Step 4: Add p-summary to note descriptions**

Change line 82:
```astro
              <p class="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">{note.data.description}</p>
```
to:
```astro
              <p class="p-summary text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">{note.data.description}</p>
```

**Step 5: Add e-content to note body**

Change line 112:
```astro
          <div class="prose prose-lg dark:prose-invert prose-headings:font-semibold prose-a:text-accent-600 dark:prose-a:text-accent-400">
```
to:
```astro
          <div class="e-content prose prose-lg dark:prose-invert prose-headings:font-semibold prose-a:text-accent-600 dark:prose-a:text-accent-400">
```

**Step 6: Verify**

Run: `cd src && bun run dev`

Open a notes day page (e.g. `/notes/2026-02-16/`) and view source. Confirm h-entry markup on each note article.

**Step 7: Commit**

```bash
git add src/src/pages/notes/[...slug].astro
git commit -m "feat: add h-entry microformats to notes page"
```

---

### Task 4: Add inReplyTo schema field

**Files:**
- Modify: `src/src/content/config.ts`

**Step 1: Add inReplyTo to blog schema**

After line 18 (`featured: z.boolean().default(false),`), add:

```typescript
    inReplyTo: z.string().url().optional(),
```

**Step 2: Add inReplyTo to note schema**

After line 53 (`mastodonUrl: z.string().url().optional(),`), add:

```typescript
    inReplyTo: z.string().url().optional(),
```

**Step 3: Verify**

Run: `cd src && bun run build`

Build should succeed. No existing content uses the new field yet, and it's optional.

**Step 4: Commit**

```bash
git add src/src/content/config.ts
git commit -m "feat: add inReplyTo field to blog and note schemas"
```

---

### Task 5: Add reply context rendering to blog layout

**Files:**
- Modify: `src/src/layouts/BaseLayout.astro`

**Step 1: Accept inReplyTo prop**

Update the Props type on line 8:
```astro
type Props = CollectionEntry<"blog">["data"];
```

The `inReplyTo` field is already part of the blog collection data type after the schema change, so no type change needed. But we need to destructure it.

Change line 10:
```astro
const { title, description, pubDateTime, updatedDate, heroImage, tags } = Astro.props;
```
to:
```astro
const { title, description, pubDateTime, updatedDate, heroImage, tags, inReplyTo } = Astro.props;
```

**Step 2: Render reply context before content**

After the hero image block (after line 94, the closing `)}` of the hero image conditional), add:

```astro
    {inReplyTo && (
      <div class="not-prose mb-6 rounded-lg border border-accent-200 dark:border-accent-800/40 bg-accent-50/50 dark:bg-accent-900/20 px-4 py-3">
        <span class="text-xs font-medium uppercase tracking-wide text-accent-600 dark:text-accent-400">In reply to</span>
        <a class="u-in-reply-to block mt-1 text-sm text-accent-700 dark:text-accent-300 hover:underline break-all" rel="in-reply-to" href={inReplyTo}>{inReplyTo}</a>
      </div>
    )}
```

**Step 3: Verify**

Temporarily add `inReplyTo: "https://example.com/test-post"` to a test blog post's frontmatter, run dev server, and confirm the reply context box appears. Remove the test frontmatter after verification.

**Step 4: Commit**

```bash
git add src/src/layouts/BaseLayout.astro
git commit -m "feat: add reply context rendering to blog post layout"
```

---

### Task 6: Add reply context rendering to notes page

**Files:**
- Modify: `src/src/pages/notes/[...slug].astro`

**Step 1: Render reply context inside each note article**

After the hidden metadata block (added in Task 3, step 2) and before the note header div, add:

```astro
          {note.data.inReplyTo && (
            <div class="not-prose mb-4 rounded-lg border border-accent-200 dark:border-accent-800/40 bg-accent-50/50 dark:bg-accent-900/20 px-4 py-3">
              <span class="text-xs font-medium uppercase tracking-wide text-accent-600 dark:text-accent-400">In reply to</span>
              <a class="u-in-reply-to block mt-1 text-sm text-accent-700 dark:text-accent-300 hover:underline break-all" rel="in-reply-to" href={note.data.inReplyTo}>{note.data.inReplyTo}</a>
            </div>
          )}
```

**Step 2: Verify**

Temporarily add `inReplyTo: "https://example.com/test"` to a test note's frontmatter, run dev server, confirm reply context renders.

**Step 3: Commit**

```bash
git add src/src/pages/notes/[...slug].astro
git commit -m "feat: add reply context rendering to notes page"
```

---

### Task 7: Create webmentions data file and sync script

**Files:**
- Create: `src/src/data/webmentions.json`
- Create: `src/src/scripts/sync-webmentions.mjs`

**Step 1: Create empty webmentions data file**

Create `src/src/data/webmentions.json`:

```json
{}
```

**Step 2: Write the sync script**

Create `src/src/scripts/sync-webmentions.mjs`:

```javascript
/**
 * Sync webmentions from webmention.io.
 *
 * Fetches recent webmentions for sealjay.com and merges them into
 * src/data/webmentions.json, keyed by target URL. Deduplicates
 * by wm-id.
 *
 * Usage: WEBMENTION_IO_TOKEN=xxx node src/scripts/sync-webmentions.mjs
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DOMAIN = 'sealjay.com'
const API_BASE = 'https://webmention.io/api/mentions.jf2'
const PER_PAGE = 100

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DATA_FILE = join(__dirname, '..', 'data', 'webmentions.json')

async function fetchWebmentions(token, since) {
  const mentions = []
  let page = 0

  while (true) {
    const params = new URLSearchParams({
      domain: DOMAIN,
      token,
      'per-page': String(PER_PAGE),
      page: String(page),
    })
    if (since) {
      params.set('since', since)
    }

    const url = `${API_BASE}?${params}`
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`webmention.io API error: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()
    const children = data.children || []
    mentions.push(...children)

    if (children.length < PER_PAGE) break
    page++
  }

  return mentions
}

function groupByTarget(mentions) {
  const grouped = {}
  for (const mention of mentions) {
    const target = mention['wm-target']
    if (!target) continue
    if (!grouped[target]) grouped[target] = []
    grouped[target].push(mention)
  }
  return grouped
}

async function loadExisting() {
  try {
    const content = await readFile(DATA_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return {}
  }
}

function mergeWebmentions(existing, fresh) {
  const merged = { ...existing }

  for (const [target, mentions] of Object.entries(fresh)) {
    if (!merged[target]) {
      merged[target] = mentions
      continue
    }

    const existingIds = new Set(merged[target].map((m) => m['wm-id']))
    for (const mention of mentions) {
      if (!existingIds.has(mention['wm-id'])) {
        merged[target].push(mention)
      }
    }
  }

  return merged
}

function findLatestTimestamp(data) {
  let latest = null
  for (const mentions of Object.values(data)) {
    for (const m of mentions) {
      const received = m['wm-received']
      if (received && (!latest || received > latest)) {
        latest = received
      }
    }
  }
  return latest
}

async function main() {
  const token = process.env.WEBMENTION_IO_TOKEN
  if (!token) {
    console.log('WEBMENTION_IO_TOKEN not set, skipping webmention sync.')
    return
  }

  const existing = await loadExisting()
  const since = findLatestTimestamp(existing)

  console.log(`Fetching webmentions for ${DOMAIN}...`)
  if (since) {
    console.log(`  Since: ${since}`)
  }

  const mentions = await fetchWebmentions(token, since)
  console.log(`  Fetched ${mentions.length} webmention(s).`)

  if (mentions.length === 0) {
    console.log('No new webmentions.')
    return
  }

  const freshGrouped = groupByTarget(mentions)
  const merged = mergeWebmentions(existing, freshGrouped)

  const totalCount = Object.values(merged).reduce((sum, arr) => sum + arr.length, 0)
  console.log(`  Total webmentions after merge: ${totalCount}`)

  await mkdir(join(__dirname, '..', 'data'), { recursive: true })
  await writeFile(DATA_FILE, JSON.stringify(merged, null, 2), 'utf-8')
  console.log(`  Saved to ${DATA_FILE}`)
}

main().catch((err) => {
  console.error('Webmention sync failed:', err)
  process.exit(1)
})
```

**Step 3: Add sync:webmentions script to package.json**

In `src/package.json`, add to the `scripts` object:

```json
"sync:webmentions": "node src/scripts/sync-webmentions.mjs"
```

**Step 4: Verify**

Run: `cd src && WEBMENTION_IO_TOKEN=test bun run sync:webmentions`

Should print "Fetching webmentions for sealjay.com..." (may fail with invalid token, but script structure is verified).

Without a token: `cd src && bun run sync:webmentions`

Should print "WEBMENTION_IO_TOKEN not set, skipping webmention sync."

**Step 5: Commit**

```bash
git add src/src/data/webmentions.json src/src/scripts/sync-webmentions.mjs src/package.json
git commit -m "feat: add webmention sync script and data file"
```

---

### Task 8: Create Webmentions display component

**Files:**
- Create: `src/src/components/partials/Webmentions.astro`

**Step 1: Create the component**

Create `src/src/components/partials/Webmentions.astro`:

```astro
---
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

interface WebmentionAuthor {
  type?: string
  name?: string
  url?: string
  photo?: string
}

interface Webmention {
  'wm-id': number
  'wm-source': string
  'wm-target': string
  'wm-property': string
  'wm-received': string
  author?: WebmentionAuthor
  url?: string
  published?: string
  content?: { html?: string; text?: string }
}

let allMentions: Record<string, Webmention[]> = {}
try {
  const dataPath = join(__dirname, '..', '..', 'data', 'webmentions.json')
  const raw = await readFile(dataPath, 'utf-8')
  allMentions = JSON.parse(raw)
} catch {
  // No webmentions data yet
}

// Match mentions for this page's canonical URL
const canonicalURL = new URL(Astro.url.pathname, Astro.site).href
const canonicalWithSlash = canonicalURL.endsWith('/') ? canonicalURL : `${canonicalURL}/`
const canonicalWithoutSlash = canonicalURL.replace(/\/$/, '')

const mentions = [
  ...(allMentions[canonicalWithSlash] || []),
  ...(allMentions[canonicalWithoutSlash] || []),
]

// Deduplicate by wm-id
const seen = new Set<number>()
const uniqueMentions = mentions.filter((m) => {
  if (seen.has(m['wm-id'])) return false
  seen.add(m['wm-id'])
  return true
})

// Group by type
const likes = uniqueMentions.filter((m) => m['wm-property'] === 'like-of')
const reposts = uniqueMentions.filter((m) => m['wm-property'] === 'repost-of')
const replies = uniqueMentions.filter((m) => m['wm-property'] === 'in-reply-to')
const otherMentions = uniqueMentions.filter((m) =>
  m['wm-property'] === 'mention-of' || m['wm-property'] === 'bookmark-of'
)

const hasAny = uniqueMentions.length > 0
---

{hasAny && (
  <div class="webmentions mt-12 sm:mt-16">
    <h2 class="text-xl sm:text-2xl font-bold text-zinc-800 dark:text-zinc-100 mb-6 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2 text-accent-500 dark:text-accent-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
      Webmentions
    </h2>

    <div class="bg-white dark:bg-zinc-800/70 rounded-xl border border-zinc-100 dark:border-zinc-700/40 p-4 sm:p-6 shadow-sm space-y-6">
      {/* Likes */}
      {likes.length > 0 && (
        <div>
          <h3 class="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
            {likes.length} {likes.length === 1 ? 'Like' : 'Likes'}
          </h3>
          <div class="flex flex-wrap gap-1">
            {likes.map((like) => (
              <a
                href={like.author?.url || like.url || '#'}
                target="_blank"
                rel="noopener noreferrer nofollow"
                title={like.author?.name || 'Someone'}
                class="block"
              >
                {like.author?.photo ? (
                  <img
                    src={like.author.photo}
                    alt={like.author?.name || ''}
                    class="w-8 h-8 rounded-full ring-2 ring-white dark:ring-zinc-800"
                    loading="lazy"
                  />
                ) : (
                  <span class="w-8 h-8 rounded-full bg-accent-100 dark:bg-accent-900/40 flex items-center justify-center text-xs font-medium text-accent-700 dark:text-accent-300">
                    {(like.author?.name || '?').charAt(0)}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Reposts */}
      {reposts.length > 0 && (
        <div>
          <h3 class="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
            {reposts.length} {reposts.length === 1 ? 'Repost' : 'Reposts'}
          </h3>
          <div class="flex flex-wrap gap-1">
            {reposts.map((repost) => (
              <a
                href={repost.author?.url || repost.url || '#'}
                target="_blank"
                rel="noopener noreferrer nofollow"
                title={repost.author?.name || 'Someone'}
                class="block"
              >
                {repost.author?.photo ? (
                  <img
                    src={repost.author.photo}
                    alt={repost.author?.name || ''}
                    class="w-8 h-8 rounded-full ring-2 ring-white dark:ring-zinc-800"
                    loading="lazy"
                  />
                ) : (
                  <span class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    {(repost.author?.name || '?').charAt(0)}
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div>
          <h3 class="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </h3>
          <div class="flex flex-col gap-4">
            {replies.map((reply) => (
              <div class="flex gap-3">
                <a
                  href={reply.author?.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  class="shrink-0"
                >
                  {reply.author?.photo ? (
                    <img
                      src={reply.author.photo}
                      alt={reply.author?.name || ''}
                      class="w-10 h-10 rounded-full"
                      loading="lazy"
                    />
                  ) : (
                    <span class="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-600 dark:text-zinc-300">
                      {(reply.author?.name || '?').charAt(0)}
                    </span>
                  )}
                </a>
                <div class="min-w-0 flex-1">
                  <div class="flex items-baseline gap-2 mb-1">
                    <a
                      href={reply.author?.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-accent-600 dark:hover:text-accent-400"
                    >
                      {reply.author?.name || 'Anonymous'}
                    </a>
                    {reply.published && (
                      <time class="text-xs text-zinc-400 dark:text-zinc-500" datetime={reply.published}>
                        {new Date(reply.published).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </time>
                    )}
                  </div>
                  {reply.content?.text && (
                    <p class="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {reply.content.text.length > 300 ? `${reply.content.text.slice(0, 300)}...` : reply.content.text}
                    </p>
                  )}
                  <a
                    href={reply.url || reply['wm-source']}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    class="text-xs text-accent-600 dark:text-accent-400 hover:underline mt-1 inline-block"
                  >
                    View original
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other mentions */}
      {otherMentions.length > 0 && (
        <div>
          <h3 class="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
            {otherMentions.length} {otherMentions.length === 1 ? 'Mention' : 'Mentions'}
          </h3>
          <ul class="space-y-2">
            {otherMentions.map((mention) => (
              <li class="flex items-center gap-2">
                {mention.author?.photo ? (
                  <img
                    src={mention.author.photo}
                    alt={mention.author?.name || ''}
                    class="w-6 h-6 rounded-full"
                    loading="lazy"
                  />
                ) : (
                  <span class="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-xs text-zinc-500">
                    {(mention.author?.name || '?').charAt(0)}
                  </span>
                )}
                <a
                  href={mention.url || mention['wm-source']}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  class="text-sm text-zinc-600 dark:text-zinc-400 hover:text-accent-600 dark:hover:text-accent-400 truncate"
                >
                  {mention.author?.name || mention['wm-source']}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
)}
```

**Step 2: Verify**

The component renders nothing when `webmentions.json` is empty `{}`. This is the expected initial state. It will render content once webmentions are synced.

Run: `cd src && bun run build`

Build should succeed with no errors.

**Step 3: Commit**

```bash
git add src/src/components/partials/Webmentions.astro
git commit -m "feat: add Webmentions display component"
```

---

### Task 9: Add Webmentions component to blog and notes layouts

**Files:**
- Modify: `src/src/layouts/BaseLayout.astro`
- Modify: `src/src/pages/notes/[...slug].astro`

**Step 1: Import and add to blog layout**

In `src/src/layouts/BaseLayout.astro`, add the import after line 5 (after the Giscus import):

```astro
import Webmentions from "../components/partials/Webmentions.astro";
```

Then add the component before the Giscus section. Change line 101-104:
```astro
  <div class="max-w-3xl mx-auto mt-16 mb-8">
    <div class="h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent mb-8"></div>
    <Giscus />
  </div>
```
to:
```astro
  <div class="max-w-3xl mx-auto mt-16 mb-8">
    <Webmentions />
    <div class="h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent mb-8 mt-12"></div>
    <Giscus />
  </div>
```

**Step 2: Import and add to notes page**

In `src/src/pages/notes/[...slug].astro`, add the import after line 4 (after the Giscus import):

```astro
import Webmentions from '../../components/partials/Webmentions.astro'
```

Then add before Giscus. Change lines 124-128:
```astro
    <div class="mt-16 mb-8">
      <div class="h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent mb-8"></div>
      <Giscus />
    </div>
```
to:
```astro
    <div class="mt-16 mb-8">
      <Webmentions />
      <div class="h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent mb-8 mt-12"></div>
      <Giscus />
    </div>
```

**Step 3: Verify**

Run: `cd src && bun run build`

Build should succeed. With empty webmentions data, the component renders nothing — no visual change yet.

**Step 4: Commit**

```bash
git add src/src/layouts/BaseLayout.astro src/src/pages/notes/[...slug].astro
git commit -m "feat: add Webmentions component to blog and notes layouts"
```

---

### Task 10: Create webmention sending script

**Files:**
- Create: `src/src/scripts/send-webmentions.mjs`
- Create: `src/src/data/sent-webmentions.json`

**Step 1: Create tracking file**

Create `src/src/data/sent-webmentions.json`:

```json
{}
```

**Step 2: Write the sending script**

Create `src/src/scripts/send-webmentions.mjs`:

```javascript
/**
 * Send webmentions for outgoing links in the built site.
 *
 * Scans dist/ HTML files for outgoing <a> links, discovers webmention
 * endpoints on target sites, and sends webmentions.
 *
 * Usage: node src/scripts/send-webmentions.mjs
 *
 * Expects the site to be built first (bun run build).
 */

import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST_DIR = join(__dirname, '..', '..', 'dist')
const TRACKING_FILE = join(__dirname, '..', 'data', 'sent-webmentions.json')
const SITE_URL = 'https://sealjay.com'

/** Recursively find all HTML files in a directory. */
async function findHtmlFiles(dir) {
  const files = []
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await findHtmlFiles(fullPath)))
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath)
    }
  }
  return files
}

/** Extract all href values from <a> tags in HTML. */
function extractLinks(html) {
  const links = new Set()
  const regex = /<a[^>]+href="([^"]+)"[^>]*>/gi
  for (const match of html.matchAll(regex)) {
    const href = match[1]
    // Only external links
    if (href.startsWith('http://') || href.startsWith('https://')) {
      // Skip own domain
      if (!href.startsWith(SITE_URL)) {
        links.add(href)
      }
    }
  }
  return [...links]
}

/** Discover a webmention endpoint for a target URL. */
async function discoverEndpoint(targetUrl) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { Accept: 'text/html' },
    })
    clearTimeout(timeout)

    // Check Link header first
    const linkHeader = res.headers.get('link')
    if (linkHeader) {
      const wmMatch = linkHeader.match(/<([^>]+)>;\s*rel="?webmention"?/)
      if (wmMatch) {
        return new URL(wmMatch[1], targetUrl).href
      }
    }

    // Check HTML for <link rel="webmention">
    const html = await res.text()
    const htmlMatch = html.match(/<link[^>]+rel="?webmention"?[^>]+href="([^"]+)"/)
      || html.match(/<link[^>]+href="([^"]+)"[^>]+rel="?webmention"?/)
    if (htmlMatch) {
      return new URL(htmlMatch[1], targetUrl).href
    }

    return null
  } catch {
    return null
  }
}

/** Send a webmention from source to target via the given endpoint. */
async function sendWebmention(endpoint, source, target) {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ source, target }).toString(),
    })
    return { ok: res.ok, status: res.status }
  } catch (err) {
    return { ok: false, status: 0, error: err.message }
  }
}

async function loadTracking() {
  try {
    const content = await readFile(TRACKING_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return {}
  }
}

async function saveTracking(data) {
  await mkdir(join(__dirname, '..', 'data'), { recursive: true })
  await writeFile(TRACKING_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

async function main() {
  console.log('Scanning built site for outgoing links...')

  let htmlFiles
  try {
    htmlFiles = await findHtmlFiles(DIST_DIR)
  } catch {
    console.log('dist/ directory not found. Run bun run build first.')
    process.exit(1)
  }

  console.log(`Found ${htmlFiles.length} HTML files.`)

  const tracking = await loadTracking()
  let sent = 0
  let skipped = 0
  let noEndpoint = 0

  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf-8')
    const links = extractLinks(html)
    if (links.length === 0) continue

    // Derive the source URL from the file path
    const relPath = relative(DIST_DIR, file)
    const sourceUrl = `${SITE_URL}/${relPath.replace(/index\.html$/, '')}`

    for (const targetUrl of links) {
      const key = `${sourceUrl} -> ${targetUrl}`

      // Check if we already know this target has no endpoint
      if (tracking[key] === 'no-endpoint') {
        skipped++
        continue
      }

      // Discover endpoint (or use cached one)
      let endpoint = tracking[key]
      if (!endpoint || endpoint === 'no-endpoint') {
        endpoint = await discoverEndpoint(targetUrl)
        if (!endpoint) {
          tracking[key] = 'no-endpoint'
          noEndpoint++
          continue
        }
      }

      // Send the webmention
      const result = await sendWebmention(endpoint, sourceUrl, targetUrl)
      if (result.ok) {
        tracking[key] = endpoint
        console.log(`  Sent: ${sourceUrl} -> ${targetUrl}`)
        sent++
      } else {
        console.log(`  Failed (${result.status}): ${sourceUrl} -> ${targetUrl}`)
      }
    }
  }

  await saveTracking(tracking)
  console.log(`\nDone. Sent: ${sent}, Skipped: ${skipped}, No endpoint: ${noEndpoint}`)
}

main().catch((err) => {
  console.error('Send webmentions failed:', err)
  process.exit(1)
})
```

**Step 3: Add send:webmentions script to package.json**

In `src/package.json`, add to the `scripts` object:

```json
"send:webmentions": "node src/scripts/send-webmentions.mjs"
```

**Step 4: Verify**

Run: `cd src && bun run build && bun run send:webmentions`

Should scan the built HTML files and attempt endpoint discovery on external links.

**Step 5: Commit**

```bash
git add src/src/scripts/send-webmentions.mjs src/src/data/sent-webmentions.json src/package.json
git commit -m "feat: add webmention sending script"
```

---

### Task 11: Update workflow to include webmention sync

**Files:**
- Modify: `.github/workflows/sync-securing-quest.yml`

**Step 1: Rename workflow and update name**

Rename the file from `sync-securing-quest.yml` to `sync-content.yml`.

Update the name on line 1:
```yaml
name: Sync Content (Securing Quest + Webmentions)
```

**Step 2: Add webmention sync step**

After the "Run sync script" step (line 38), add:

```yaml
      - name: Sync webmentions
        working-directory: src
        env:
          WEBMENTION_IO_TOKEN: ${{ secrets.WEBMENTION_IO_TOKEN }}
        run: bun run sync:webmentions
```

**Step 3: Update git add to include webmention data**

Change line 43:
```yaml
          git add src/src/content/blog/str-*
```
to:
```yaml
          git add src/src/content/blog/str-* src/src/data/webmentions.json
```

**Step 4: Update commit message**

Change line 52:
```yaml
          git commit -m "chore: sync new posts from securing.quest"
```
to:
```yaml
          git commit -m "chore: sync content (securing.quest + webmentions)"
```

**Step 5: Verify**

Review the workflow file for correctness. The workflow should:
1. Checkout the repo
2. Setup Bun + install deps
3. Run securing.quest sync
4. Run webmention sync
5. Check for changes in both blog posts and webmention data
6. Commit and push if changes found

**Step 6: Commit**

```bash
git mv .github/workflows/sync-securing-quest.yml .github/workflows/sync-content.yml
git add .github/workflows/sync-content.yml
git commit -m "feat: rename workflow and add webmention sync step"
```

---

### Task 12: Final verification and lint

**Step 1: Run lint**

```bash
cd src && bun run lint
```

Fix any issues reported by Biome.

**Step 2: Run full build**

```bash
cd src && bun run build
```

Confirm the build succeeds with all new components and data files.

**Step 3: Spot-check microformats**

Run dev server, open a blog post, use browser dev tools to verify:
- `article.h-entry` exists
- `h1.p-name` exists
- `time.dt-published` with `datetime` attribute exists
- `div.e-content` wraps post content
- Hidden `a.u-url` and `span.p-author.h-card` present

Optionally, paste the URL into https://indiewebify.me/validate-h-entry/ to validate.

**Step 4: Commit lint fixes if any**

```bash
git add -A && git commit -m "chore: lint fixes for IndieWeb changes"
```

---

## Manual Setup Steps (Not Automated)

These require the site owner to complete:

1. **webmention.io**: Sign in at https://webmention.io with sealjay.com domain. Copy API token. Add as `WEBMENTION_IO_TOKEN` GitHub Actions secret.
2. **Bridgy**: Sign up at https://brid.gy and connect fosstodon.org account for Mastodon backfeed.
3. **Bridgy Fed**: Verify Bridgy Fed is configured for the domain at https://fed.brid.gy.

## Execution Order

Tasks 1-3 (head links + microformats) are independent of Tasks 4-6 (reply contexts) and Tasks 7-11 (webmention infrastructure). All depend on Task 12 (final verification).

Recommended order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12

Parallelisable groups:
- Group A (microformats): Tasks 1, 2, 3
- Group B (reply contexts): Tasks 4, 5, 6
- Group C (webmentions): Tasks 7, 8, 9, 10, 11
- Task 12 depends on all above
