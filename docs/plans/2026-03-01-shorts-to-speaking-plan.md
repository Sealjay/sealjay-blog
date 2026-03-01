# Merge YouTube Shorts & Videos into Speaking Collection — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Remove the standalone shorts system and auto-populate speaking entries from the Securing the Realm YouTube channel, classifying videos as Short or Podcast, with MDX overrides.

**Architecture:** A new `lib/youtube.ts` fetches the channel feed + shorts playlist at build time, returns speaking-shaped objects. The speaking page and stream page merge these with `getCollection('speaking')`. The `/shorts` page, `short` data collection, and shorts RSS are removed.

**Tech Stack:** Astro 5, TypeScript, YouTube RSS XML feeds

---

### Task 1: Update speaking schema to add 'Short' eventType

**Files:**
- Modify: `src/src/content/config.ts:26`

**Step 1: Add 'Short' to the eventType enum**

In `src/src/content/config.ts`, line 26, change:

```ts
eventType: z.enum(['Conference', 'Video', 'Media Mention', 'Podcast', 'Workshop', 'Webinar', 'Panel']),
```

to:

```ts
eventType: z.enum(['Conference', 'Video', 'Media Mention', 'Podcast', 'Workshop', 'Webinar', 'Panel', 'Short']),
```

**Step 2: Remove the `short` data collection**

In the same file, delete lines 82–98 (the `const short = defineCollection(...)` block).

On line 112, change:

```ts
export const collections = { blog, speaking, note, project, short, acknowledgement }
```

to:

```ts
export const collections = { blog, speaking, note, project, acknowledgement }
```

**Step 3: Delete the empty short content directory**

```bash
rm -rf src/src/content/short/
```

**Step 4: Run build to verify schema change works**

```bash
cd src && bun run build 2>&1 | head -30
```

Expected: no more `[WARN] [glob-loader] No files found` warning for `short`.

**Step 5: Commit**

```bash
git add src/src/content/config.ts
git rm -r src/src/content/short/
git commit -m "feat: add Short to speaking eventType, remove short data collection"
```

---

### Task 2: Replace youtube.ts with channel-feed-aware version

**Files:**
- Modify: `src/src/lib/youtube.ts` (full rewrite)
- Modify: `src/src/config/personal.ts:87-94`

**Step 1: Update personal.ts config**

In `src/src/config/personal.ts`, replace lines 87–94:

```ts
// YouTube Shorts playlists fetched at build time
export const youtubeShorts = [
  {
    playlistId: 'PLo9Ah7HeyG1Rkqq0cc1QJtttkywXKWd9g',
    source: 'Securing the Realm',
    defaultTags: ['YouTube', 'Shorts', 'Security'],
  },
]
```

with:

```ts
// YouTube channel feeds auto-populated as speaking entries at build time
export const youtubeFeeds = [
  {
    channelId: 'UCS4KTDaZTiyiMj2yZztwmlg',
    shortsPlaylistId: 'PLo9Ah7HeyG1Rkqq0cc1QJtttkywXKWd9g',
    event: 'Securing the Realm',
    defaultTags: ['YouTube', 'Security'],
  },
]

export type YouTubeFeedConfig = (typeof youtubeFeeds)[number]
```

**Step 2: Rewrite youtube.ts**

Replace the entire contents of `src/src/lib/youtube.ts` with:

```ts
import type { YouTubeFeedConfig } from '../config/personal'

export interface YouTubeSpeakingEntry {
  title: string
  description: string
  eventType: 'Short' | 'Podcast'
  event: string
  date: Date
  url: string
  cta: string
  youtubeId: string
  thumbnailUrl: string
  tags: string[]
}

/** Module-level cache — feeds are fetched once per build */
let cached: YouTubeSpeakingEntry[] | null = null

/** Decode common XML/HTML entities */
function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

/** Extract hashtags from a YouTube description */
function extractHashtags(description: string): string[] {
  const matches = description.match(/#\w+/g)
  if (!matches) return []
  return matches.map((tag) => tag.slice(1))
}

/** Parse video entries from YouTube RSS XML */
function parseVideoEntries(xml: string): Array<{
  youtubeId: string
  title: string
  description: string
  published: string
  thumbnailUrl: string
}> {
  const entries: Array<{
    youtubeId: string
    title: string
    description: string
    published: string
    thumbnailUrl: string
  }> = []
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g

  for (const match of xml.matchAll(entryRegex)) {
    const block = match[1]
    const youtubeId = block.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] ?? ''
    if (!youtubeId) continue

    entries.push({
      youtubeId,
      title: decodeEntities(block.match(/<title>(.*?)<\/title>/)?.[1] ?? ''),
      description: decodeEntities(
        block.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] ?? '',
      ),
      published: block.match(/<published>(.*?)<\/published>/)?.[1] ?? '',
      thumbnailUrl:
        block.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1] ??
        `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    })
  }

  return entries
}

/** Fetch XML from a YouTube RSS feed URL, returning empty string on failure */
async function fetchFeed(url: string, label: string): Promise<string> {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`[youtube] Failed to fetch ${label}: ${res.status}`)
      return ''
    }
    return await res.text()
  } catch (err) {
    console.warn(`[youtube] Network error fetching ${label}:`, err)
    return ''
  }
}

/** Fetch all YouTube channel videos and classify as Short or Podcast */
export async function getYouTubeSpeakingEntries(
  feeds: YouTubeFeedConfig[],
): Promise<YouTubeSpeakingEntry[]> {
  if (cached) return cached

  const allEntries: YouTubeSpeakingEntry[] = []

  for (const feed of feeds) {
    // Fetch channel feed and shorts playlist in parallel
    const [channelXml, shortsXml] = await Promise.all([
      fetchFeed(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${feed.channelId}`,
        `channel ${feed.channelId}`,
      ),
      feed.shortsPlaylistId
        ? fetchFeed(
            `https://www.youtube.com/feeds/videos.xml?playlist_id=${feed.shortsPlaylistId}`,
            `shorts playlist ${feed.shortsPlaylistId}`,
          )
        : Promise.resolve(''),
    ])

    if (!channelXml) continue

    // Build set of short video IDs
    const shortIds = new Set<string>()
    if (shortsXml) {
      for (const entry of parseVideoEntries(shortsXml)) {
        shortIds.add(entry.youtubeId)
      }
    }

    // Parse all channel videos and classify
    for (const video of parseVideoEntries(channelXml)) {
      const isShort = shortIds.has(video.youtubeId)
      const hashtags = extractHashtags(video.description)
      const tags = [
        ...new Set([
          ...feed.defaultTags,
          ...(isShort ? ['Shorts'] : ['Podcast']),
          ...hashtags,
        ]),
      ]

      allEntries.push({
        title: video.title,
        description: video.description,
        eventType: isShort ? 'Short' : 'Podcast',
        event: feed.event,
        date: new Date(video.published),
        url: isShort
          ? `https://www.youtube.com/shorts/${video.youtubeId}`
          : `https://www.youtube.com/watch?v=${video.youtubeId}`,
        cta: isShort ? 'Watch short' : 'Watch episode',
        youtubeId: video.youtubeId,
        thumbnailUrl: video.thumbnailUrl,
        tags,
      })
    }
  }

  // Sort newest first
  allEntries.sort((a, b) => b.date.valueOf() - a.date.valueOf())

  cached = allEntries
  return allEntries
}

/** Extract YouTube video ID from a URL (watch, shorts, or youtu.be) */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/shorts\/([A-Za-z0-9_-]+)/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]+)/,
    /youtu\.be\/([A-Za-z0-9_-]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}
```

**Step 3: Verify the module compiles**

```bash
cd src && bun run build 2>&1 | tail -5
```

Expected: build succeeds (pages using old imports will fail — that's expected, fixed in later tasks).

**Step 4: Commit**

```bash
git add src/src/lib/youtube.ts src/src/config/personal.ts
git commit -m "feat: rewrite youtube.ts to fetch channel feed and classify Short vs Podcast"
```

---

### Task 3: Update speaking page to merge YouTube entries

**Files:**
- Modify: `src/src/pages/speaking/index.astro:1-59` (frontmatter)
- Modify: `src/src/pages/speaking/index.astro:158` (video icon condition)

**Step 1: Update speaking page frontmatter to merge YouTube data**

In `src/src/pages/speaking/index.astro`, replace lines 7–10:

```ts
import { getCollection } from 'astro:content'

const speakingSlots = await getCollection('speaking')
const sortedSpeakingSlots = [...speakingSlots].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
```

with:

```ts
import { getCollection } from 'astro:content'
import { getYouTubeSpeakingEntries, extractYouTubeId } from '../../lib/youtube'
import { youtubeFeeds } from '../../config/personal'

// Fetch MDX speaking entries and YouTube RSS entries
const mdxEntries = await getCollection('speaking')
const youtubeEntries = await getYouTubeSpeakingEntries(youtubeFeeds)

// Build set of YouTube IDs that have MDX overrides
const mdxYouTubeIds = new Set<string>()
for (const entry of mdxEntries) {
  const id = extractYouTubeId(entry.data.url)
  if (id) mdxYouTubeIds.add(id)
}

// Add YouTube entries that don't have MDX overrides
const autoEntries = youtubeEntries
  .filter((yt) => !mdxYouTubeIds.has(yt.youtubeId))
  .map((yt) => ({
    slug: `yt-${yt.youtubeId}`,
    data: {
      title: yt.title,
      description: yt.description.slice(0, 200) || yt.title,
      eventType: yt.eventType as 'Short' | 'Podcast',
      event: yt.event,
      date: yt.date,
      cta: yt.cta,
      url: yt.url,
      featured: false,
    },
  }))

const speakingSlots = [...mdxEntries, ...autoEntries]
const sortedSpeakingSlots = [...speakingSlots].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
```

**Step 2: Show video icon for Short type too**

On line 158, change:

```ts
{(slot.data.eventType === 'Video' || slot.data.videoEmbedUrl) && (
```

to:

```ts
{(slot.data.eventType === 'Video' || slot.data.eventType === 'Short' || slot.data.eventType === 'Podcast' || slot.data.videoEmbedUrl) && (
```

**Step 3: Build and verify speaking page**

```bash
cd src && bun run build 2>&1 | grep -E "speaking|Short|error"
```

Expected: speaking page builds. Filter pills should now include "Short" and "Podcast".

**Step 4: Commit**

```bash
git add src/src/pages/speaking/index.astro
git commit -m "feat: merge YouTube RSS entries into speaking page with Short/Podcast types"
```

---

### Task 4: Update stream page to remove short type

**Files:**
- Modify: `src/src/pages/stream/index.astro:1-165`

**Step 1: Remove shorts imports and short type**

In `src/src/pages/stream/index.astro`:

Remove lines 8–9 (the shorts imports):
```ts
import { getShorts } from '../../lib/youtube'
import { youtubeShorts } from '../../config/personal'
```

Add YouTube imports instead:
```ts
import { getYouTubeSpeakingEntries, extractYouTubeId } from '../../lib/youtube'
import { youtubeFeeds } from '../../config/personal'
```

**Step 2: Update StreamItem type**

On line 21, change the type union from:

```ts
type: 'article' | 'talk' | 'note' | 'project' | 'short'
```

to:

```ts
type: 'article' | 'talk' | 'note' | 'project'
```

Remove the `thumbnailUrl` field from the interface (line 28):
```ts
thumbnailUrl?: string
```

**Step 3: Replace shorts data fetch with merged speaking data**

Replace line 35:
```ts
const shorts = await getShorts(youtubeShorts)
```

with:
```ts
const youtubeEntries = await getYouTubeSpeakingEntries(youtubeFeeds)
```

**Step 4: Update speakingItems to include YouTube entries**

Replace the speakingItems mapping (lines 46–53):

```ts
const speakingItems: StreamItem[] = speakingEntries.map((entry) => ({
  type: 'talk',
  title: entry.data.title,
  description: `${entry.data.event} - ${entry.data.eventType}`,
  date: new Date(entry.data.date),
  url: entry.data.url,
  tags: [],
}))
```

with:

```ts
// Build set of YouTube IDs that have MDX overrides
const mdxYouTubeIds = new Set<string>()
for (const entry of speakingEntries) {
  const id = extractYouTubeId(entry.data.url)
  if (id) mdxYouTubeIds.add(id)
}

const speakingItems: StreamItem[] = speakingEntries.map((entry) => ({
  type: 'talk' as const,
  title: entry.data.title,
  description: `${entry.data.event} - ${entry.data.eventType}`,
  date: new Date(entry.data.date),
  url: entry.data.url,
  tags: [],
}))

// Add YouTube entries that don't have MDX overrides
const youtubeItems: StreamItem[] = youtubeEntries
  .filter((yt) => !mdxYouTubeIds.has(yt.youtubeId))
  .map((yt) => ({
    type: 'talk' as const,
    title: yt.title,
    description: `${yt.event} - ${yt.eventType}`,
    date: yt.date,
    url: yt.url,
    tags: yt.tags,
  }))
```

**Step 5: Remove shortItems and update allItems**

Delete the shortItems block (lines 97–105):
```ts
const shortItems: StreamItem[] = shorts.map((short) => ({
  type: 'short',
  title: short.title,
  description: short.source,
  date: short.published,
  url: short.youtubeUrl,
  tags: short.tags,
  thumbnailUrl: short.thumbnailUrl,
}))
```

Update the allItems merge (line 107) from:

```ts
const allItems: StreamItem[] = [...blogItems, ...speakingItems, ...noteGroupItems, ...projectItems, ...shortItems].sort(
```

to:

```ts
const allItems: StreamItem[] = [...blogItems, ...speakingItems, ...youtubeItems, ...noteGroupItems, ...projectItems].sort(
```

**Step 6: Update badge labels**

On line 134–140, change:

```ts
const badgeLabels: Record<StreamItem['type'], string> = {
  article: 'Article',
  talk: 'Speaking',
  note: 'Note',
  project: 'Project',
  short: 'Short',
}
```

to:

```ts
const badgeLabels: Record<StreamItem['type'], string> = {
  article: 'Article',
  talk: 'Speaking',
  note: 'Note',
  project: 'Project',
}
```

**Step 7: Remove "Shorts" filter button from stream template**

On line 163, delete:

```html
<button data-filter="short" class="stream-filter-btn">Shorts</button>
```

**Step 8: Remove short-specific CSS**

Delete the short badge CSS block (lines 472–481):

```css
/* Short = success emerald */
.stream-badge--short {
  background: color-mix(in srgb, var(--color-success) 8%, transparent);
  color: var(--color-success);
  border: 1px solid color-mix(in srgb, var(--color-success) 30%, transparent);
}

.stream-badge__dot--short {
  background: var(--color-success);
}
```

**Step 9: Build and verify**

```bash
cd src && bun run build 2>&1 | grep -E "stream|error"
```

Expected: stream page builds without short references.

**Step 10: Commit**

```bash
git add src/src/pages/stream/index.astro
git commit -m "feat: remove short type from stream, YouTube videos show as Speaking"
```

---

### Task 5: Update search.json and remove shorts pages

**Files:**
- Modify: `src/src/pages/search.json.ts`
- Delete: `src/src/pages/shorts/index.astro`
- Delete: `src/src/pages/shorts/rss.xml.js`

**Step 1: Rewrite search.json.ts**

Replace the entire file with:

```ts
import { getCollection } from 'astro:content'
import { getYouTubeSpeakingEntries, extractYouTubeId } from '../lib/youtube'
import { youtubeFeeds } from '../config/personal'

export async function GET() {
  const blogs = await getCollection('blog')
  const speaking = await getCollection('speaking')
  const notes = await getCollection('note')
  const projects = await getCollection('project')
  const youtubeEntries = await getYouTubeSpeakingEntries(youtubeFeeds)

  // YouTube IDs already covered by MDX speaking entries
  const mdxYouTubeIds = new Set<string>()
  for (const entry of speaking) {
    const id = extractYouTubeId(entry.data.url)
    if (id) mdxYouTubeIds.add(id)
  }

  const searchIndex = [
    ...blogs.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      tags: post.data.tags ?? [],
      url: `/blog/${post.slug}/`,
      type: 'blog' as const,
    })),
    ...speaking.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      tags: [entry.data.eventType],
      url: entry.data.url,
      type: 'speaking' as const,
    })),
    ...youtubeEntries
      .filter((yt) => !mdxYouTubeIds.has(yt.youtubeId))
      .map((yt) => ({
        title: yt.title,
        description: yt.description.slice(0, 120) || yt.title,
        tags: [yt.eventType],
        url: yt.url,
        type: 'speaking' as const,
      })),
    ...notes.map((entry) => ({
      title: entry.data.description?.slice(0, 80) ?? 'Note',
      description: entry.data.description ?? '',
      tags: entry.data.tags ?? [],
      url: `/notes/${entry.slug}/`,
      type: 'note' as const,
    })),
    ...projects.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      tags: entry.data.techStack ?? [],
      url: entry.data.repoUrl,
      type: 'project' as const,
    })),
  ]

  return new Response(JSON.stringify(searchIndex), {
    headers: { 'Content-Type': 'application/json' },
  })
}
```

**Step 2: Delete shorts pages**

```bash
rm src/src/pages/shorts/index.astro
rm src/src/pages/shorts/rss.xml.js
rmdir src/src/pages/shorts/
```

**Step 3: Build and verify**

```bash
cd src && bun run build 2>&1 | grep -E "shorts|short|error|search"
```

Expected: no `/shorts` routes generated, search.json builds clean.

**Step 4: Commit**

```bash
git add src/src/pages/search.json.ts
git rm src/src/pages/shorts/index.astro src/src/pages/shorts/rss.xml.js
git commit -m "feat: update search index, remove /shorts pages"
```

---

### Task 6: Update navigation

**Files:**
- Modify: `src/src/consts.ts:15-19`

**Step 1: Remove Shorts from secondary nav**

In `src/src/consts.ts`, change lines 15–19 from:

```ts
export const SITE_SECONDARY_NAV = [
  { name: 'Shorts', path: '/shorts' },
  { name: 'Stream', path: '/stream' },
  { name: 'Colophon', path: '/acknowledgements' },
]
```

to:

```ts
export const SITE_SECONDARY_NAV = [
  { name: 'Stream', path: '/stream' },
  { name: 'Colophon', path: '/acknowledgements' },
]
```

**Step 2: Commit**

```bash
git add src/src/consts.ts
git commit -m "feat: remove Shorts from navigation"
```

---

### Task 7: Update speaking MDX entries

**Files:**
- Modify: `src/src/content/speaking/ai-agents-entra-id-2025.mdx`
- Create: `src/src/content/speaking/exploring-computer-using-agents-2024.mdx`

**Step 1: Change ai-agents entry from Video to Short**

In `src/src/content/speaking/ai-agents-entra-id-2025.mdx`, change:

```yaml
eventType: "Video"
```

to:

```yaml
eventType: "Short"
```

Also update the event field from `"YouTube"` to `"Securing the Realm"` for consistency, and update the URL to use the shorts format:

```yaml
event: "Securing the Realm"
url: "https://www.youtube.com/shorts/iZ1SoB7n0o0"
cta: "Watch short"
```

**Step 2: Add manual entry for the Sealjay channel video**

Create `src/src/content/speaking/exploring-computer-using-agents-2024.mdx`:

```mdx
---
title: "Exploring the Potential of Computer-Using Agents: Insights from Avanade's Research Team"
eventType: "Video"
description: "A deep dive into computer-using agents and their practical applications, featuring insights from Avanade's AI research team."
event: "YouTube"
date: "2024-12-09"
cta: "Watch video"
url: "https://www.youtube.com/watch?v=vQaRs4a1dHU"
---
```

**Step 3: Build and verify**

```bash
cd src && bun run build 2>&1 | grep -E "error|warn|Short"
```

Expected: clean build with no warnings about short collection.

**Step 4: Commit**

```bash
git add src/src/content/speaking/ai-agents-entra-id-2025.mdx src/src/content/speaking/exploring-computer-using-agents-2024.mdx
git commit -m "feat: reclassify ai-agents as Short, add computer-using-agents Video entry"
```

---

### Task 8: Final build verification and lint

**Step 1: Full build**

```bash
cd src && bun run build
```

Expected: clean build, no warnings about `short` collection, no missing imports.

**Step 2: Lint**

```bash
cd src && bun run lint
```

Fix any issues.

**Step 3: Verify speaking page output**

```bash
cat dist/speaking/index.html | grep -c "data-event-type"
```

Expected: count should be higher than before (44 MDX + ~9 auto YouTube entries).

**Step 4: Verify search index**

```bash
cat dist/search.json | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');const j=JSON.parse(d);console.log('speaking entries:', j.filter(x=>x.type==='speaking').length);console.log('no short type:', j.filter(x=>x.type==='short').length === 0)"
```

**Step 5: Verify no /shorts route**

```bash
ls dist/shorts/ 2>&1
```

Expected: directory does not exist.

**Step 6: Commit any lint fixes**

```bash
git add -A src/src/
git commit -m "chore: lint fixes after shorts-to-speaking migration"
```
