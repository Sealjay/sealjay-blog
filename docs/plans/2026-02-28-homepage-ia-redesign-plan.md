# Homepage & IA Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the homepage from a single chronological stream into curated sections (latest article, recent talks, featured projects) + compact notes strip + diversity-weighted tabbed stream, and rebalance navigation.

**Architecture:** The homepage (`src/src/pages/index.astro`) gets a full rewrite with four new extracted components. Navigation arrays in `src/src/consts.ts` are updated. The stream page and all other pages remain unchanged. All logic is static/build-time; client-side JS only needed for tab filtering (reuses existing pattern from `/stream`).

**Tech Stack:** Astro 5, TypeScript, Tailwind CSS, Bun

---

### Task 1: Update Navigation Arrays

**Files:**
- Modify: `src/src/consts.ts:7-19`

**Step 1: Update SITE_NAV and SITE_SECONDARY_NAV**

Replace the navigation arrays. Projects moves to primary, Shorts moves to secondary:

```typescript
export const SITE_NAV = [
  { name: 'About', path: '/about' },
  { name: 'Blog', path: '/blog' },
  { name: 'Speaking', path: '/speaking' },
  { name: 'Projects', path: '/projects' },
  { name: 'Notes', path: '/notes' },
]

export const SITE_SECONDARY_NAV = [
  { name: 'Shorts', path: '/shorts' },
  { name: 'Stream', path: '/stream' },
  { name: 'Colophon', path: '/acknowledgements' },
]
```

**Step 2: Verify build**

Run: `cd src && bun run build`
Expected: Clean build, no errors. Header navigation should now show About | Blog | Speaking | Projects | Notes.

**Step 3: Commit**

```bash
git add src/src/consts.ts
git commit -m "feat: rebalance navigation — promote Projects, demote Shorts"
```

---

### Task 2: Create LatestArticle Component

**Files:**
- Create: `src/src/components/home/LatestArticle.astro`

**Step 1: Create the component**

This component receives the most recent blog post and renders it as a prominent card with hero image.

```astro
---
import FormattedDate from '../partials/FormattedDate.astro'
import { getOGImagePath } from '../../lib/og-image'

interface Props {
  post: {
    slug: string
    data: {
      title: string
      description: string
      pubDateTime: Date
      heroImage?: string
    }
  }
}

const { post } = Astro.props
const heroSrc =
  post.data.heroImage && post.data.heroImage !== '/placeholder-hero.png'
    ? post.data.heroImage
    : getOGImagePath(post.slug)
---

<div>
  <h3 class="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-4">Latest Article</h3>
  <a
    href={`/blog/${post.slug}/`}
    class="group block rounded-xl bg-white/90 dark:bg-zinc-800/70 backdrop-blur ring-1 ring-zinc-200/60 dark:ring-zinc-700/40 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
  >
    <div class="aspect-[16/9] overflow-hidden">
      <img
        src={heroSrc}
        alt=""
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
    </div>
    <div class="p-4">
      <span class="text-xs text-zinc-500 dark:text-zinc-400">
        <FormattedDate date={post.data.pubDateTime} />
      </span>
      <h4 class="mt-1 text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors line-clamp-2">
        {post.data.title}
      </h4>
      <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
        {post.data.description}
      </p>
      <span class="mt-3 inline-flex items-center text-sm font-medium text-accent-600 dark:text-accent-400 gap-1">
        Read post
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </span>
    </div>
  </a>
</div>
```

**Step 2: Verify build**

Run: `cd src && bun run build`
Expected: Clean build. Component isn't used yet but should compile without errors.

**Step 3: Commit**

```bash
git add src/src/components/home/LatestArticle.astro
git commit -m "feat: add LatestArticle homepage component"
```

---

### Task 3: Create RecentTalks Component

**Files:**
- Create: `src/src/components/home/RecentTalks.astro`

**Step 1: Create the component**

Renders 2-3 most recent speaking entries as a compact list.

```astro
---
import FormattedDate from '../partials/FormattedDate.astro'

interface SpeakingEntry {
  data: {
    title: string
    event: string
    eventType: string
    date: Date
    url: string
  }
}

interface Props {
  entries: SpeakingEntry[]
}

const { entries } = Astro.props

const eventTypeClasses: Record<string, string> = {
  Conference: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Video: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'Media Mention': 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  Podcast: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Workshop: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Webinar: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  Panel: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
}
---

<div>
  <h3 class="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-4">Recent Talks</h3>
  <div class="flex flex-col gap-2">
    {entries.map((entry) => (
      <a
        href={entry.data.url}
        target="_blank"
        rel="noopener noreferrer"
        class="group flex items-start gap-3 rounded-lg bg-white/90 dark:bg-zinc-800/70 backdrop-blur ring-1 ring-zinc-200/60 dark:ring-zinc-700/40 px-3 py-2.5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
      >
        <div class="min-w-0 flex-1">
          <span class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors line-clamp-1">
            {entry.data.title}
          </span>
          <div class="mt-1 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span class={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${eventTypeClasses[entry.data.eventType] ?? 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300'}`}>
              {entry.data.eventType}
            </span>
            <span class="truncate">{entry.data.event}</span>
          </div>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" class="shrink-0 h-4 w-4 mt-1 text-zinc-400 dark:text-zinc-500 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </a>
    ))}
  </div>
  <a href="/speaking" class="mt-3 inline-flex items-center text-sm font-medium text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 transition-colors gap-1">
    All speaking
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  </a>
</div>
```

**Step 2: Verify build**

Run: `cd src && bun run build`
Expected: Clean build.

**Step 3: Commit**

```bash
git add src/src/components/home/RecentTalks.astro
git commit -m "feat: add RecentTalks homepage component"
```

---

### Task 4: Create FeaturedProjects Component

**Files:**
- Create: `src/src/components/home/FeaturedProjects.astro`

**Step 1: Create the component**

Renders up to 3 featured projects (or most recent if fewer than 3 are featured).

```astro
---
interface ProjectEntry {
  data: {
    title: string
    description: string
    status: string
    techStack: string[]
    repoUrl?: string
    featured: boolean
  }
}

interface Props {
  projects: ProjectEntry[]
}

const { projects } = Astro.props

const statusClasses: Record<string, string> = {
  Active: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Maintained: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Archived: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300',
  Contribution: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
}
---

<div>
  <h3 class="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-4">Featured Projects</h3>
  <div class="flex flex-col gap-2">
    {projects.map((project) => (
      <a
        href={project.data.repoUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="group block rounded-lg bg-white/90 dark:bg-zinc-800/70 backdrop-blur ring-1 ring-zinc-200/60 dark:ring-zinc-700/40 px-3 py-2.5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors truncate">
            {project.data.title}
          </span>
          <span class={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${statusClasses[project.data.status] ?? ''}`}>
            {project.data.status}
          </span>
        </div>
        <p class="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
          {project.data.description}
        </p>
        <div class="mt-1.5 flex flex-wrap gap-1">
          {project.data.techStack.slice(0, 3).map((tech) => (
            <span class="inline-flex items-center rounded-full bg-zinc-100 dark:bg-zinc-700/50 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:text-zinc-400">
              {tech}
            </span>
          ))}
        </div>
      </a>
    ))}
  </div>
  <a href="/projects" class="mt-3 inline-flex items-center text-sm font-medium text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 transition-colors gap-1">
    All projects
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  </a>
</div>
```

**Step 2: Verify build**

Run: `cd src && bun run build`
Expected: Clean build.

**Step 3: Commit**

```bash
git add src/src/components/home/FeaturedProjects.astro
git commit -m "feat: add FeaturedProjects homepage component"
```

---

### Task 5: Create LatestNotes Component

**Files:**
- Create: `src/src/components/home/LatestNotes.astro`

**Step 1: Create the component**

Compact notes strip showing the most recent day-group: daySummary + up to 3 preview lines + overflow indicator.

```astro
---
import FormattedDate from '../partials/FormattedDate.astro'

interface NotePreview {
  description?: string
  title?: string
  time: string
  url: string
}

interface Props {
  date: Date
  dayUrl: string
  daySummary?: string
  noteCount: number
  previews: NotePreview[]
}

const { date, dayUrl, daySummary, noteCount, previews } = Astro.props
const overflow = noteCount - previews.length
---

<div class="rounded-xl bg-white/90 dark:bg-zinc-800/70 backdrop-blur ring-1 ring-zinc-200/60 dark:ring-zinc-700/40 px-4 py-3 shadow-sm">
  <div class="flex items-center gap-3 mb-2">
    <span class="shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
      Notes
    </span>
    <span class="text-xs text-zinc-500 dark:text-zinc-400">
      <FormattedDate date={date} /> &middot; {noteCount} {noteCount === 1 ? 'note' : 'notes'}
    </span>
    <a
      href="/notes"
      class="ml-auto text-xs text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium transition-colors flex items-center gap-0.5"
    >
      View all notes
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </a>
  </div>

  {daySummary && (
    <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-2 italic">
      {daySummary}
    </p>
  )}

  <div class="flex flex-col gap-0.5">
    {previews.map((note) => (
      <a
        href={note.url}
        class="flex items-center gap-2 rounded-lg px-2 py-1 -mx-1 hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors"
      >
        <span class="text-zinc-400 dark:text-zinc-500 leading-5" aria-hidden="true">&#8226;</span>
        <span class="flex-1 text-sm text-zinc-700 dark:text-zinc-300 truncate leading-5">
          {note.description || note.title || 'Note'}
        </span>
        <span class="shrink-0 text-xs text-zinc-400 dark:text-zinc-500 tabular-nums leading-5">
          {note.time}
        </span>
      </a>
    ))}
    {overflow > 0 && (
      <a
        href={dayUrl}
        class="px-2 py-1 -mx-1 text-xs text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 transition-colors"
      >
        and {overflow} more &rarr;
      </a>
    )}
  </div>
</div>
```

**Step 2: Verify build**

Run: `cd src && bun run build`
Expected: Clean build.

**Step 3: Commit**

```bash
git add src/src/components/home/LatestNotes.astro
git commit -m "feat: add LatestNotes homepage component"
```

---

### Task 6: Rewrite Homepage with Curated Sections + Tabbed Stream

This is the main task. The hero section stays unchanged. Everything below the divider gets replaced.

**Files:**
- Modify: `src/src/pages/index.astro` (full rewrite of lines 1-321)

**Step 1: Rewrite the frontmatter (data fetching + diversity algorithm)**

Replace the entire frontmatter section (lines 1-128) with new data queries that prepare:
- `latestPost` — most recent blog post
- `recentTalks` — 3 most recent speaking entries
- `featuredProjects` — up to 3 featured projects (fallback to most recent)
- `latestNoteGroup` — most recent day-group with preview data
- `streamItems` — diversity-weighted list for the tabbed stream

The frontmatter should be:

```astro
---
import { getCollection } from 'astro:content'
import Layout from '../layouts/IndexLayout.astro'
import SocialLinks from '../components/partials/IndexSocialLinks.astro'
import FormattedDate from '../components/partials/FormattedDate.astro'
import Badge from '../components/partials/Badge.astro'
import LatestArticle from '../components/home/LatestArticle.astro'
import RecentTalks from '../components/home/RecentTalks.astro'
import FeaturedProjects from '../components/home/FeaturedProjects.astro'
import LatestNotes from '../components/home/LatestNotes.astro'
import { professionalBadges, formerRoles, currentRole, youtubeShorts } from '../config/personal'
import { getShorts } from '../lib/youtube'

// --- Data fetching ---
const posts = (await getCollection('blog')).sort(
  (b, a) => a.data.pubDateTime.valueOf() - b.data.pubDateTime.valueOf(),
)
const speakingEntries = (await getCollection('speaking')).sort(
  (b, a) => a.data.date.valueOf() - b.data.date.valueOf(),
)
const notes = (await getCollection('note')).sort(
  (b, a) => a.data.pubDateTime.valueOf() - b.data.pubDateTime.valueOf(),
)
const projectEntries = (await getCollection('project')).sort(
  (b, a) => a.data.date.valueOf() - b.data.date.valueOf(),
)
const shorts = await getShorts(youtubeShorts)

// --- Curated section data ---
const latestPost = posts[0]
const recentTalks = speakingEntries.slice(0, 3)
const featuredProjects = (() => {
  const featured = projectEntries.filter((p) => p.data.featured)
  if (featured.length >= 3) return featured.slice(0, 3)
  // Backfill with most recent non-featured projects
  const remaining = projectEntries.filter((p) => !p.data.featured)
  return [...featured, ...remaining].slice(0, 3)
})()

// --- Notes day-group data ---
const notesByDay = new Map<string, typeof notes>()
for (const n of notes) {
  const key = new Date(n.data.pubDateTime).toISOString().slice(0, 10)
  if (!notesByDay.has(key)) notesByDay.set(key, [])
  notesByDay.get(key)!.push(n)
}

const sortedDayKeys = [...notesByDay.keys()].sort((a, b) => b.localeCompare(a))
const latestDayKey = sortedDayKeys[0]
const latestDayNotes = latestDayKey ? notesByDay.get(latestDayKey)! : []
const sortedLatestDay = [...latestDayNotes].sort(
  (a, b) => a.data.pubDateTime.valueOf() - b.data.pubDateTime.valueOf(),
)
const latestDaySummary = sortedLatestDay.find((n) => n.data.daySummary)?.data.daySummary
const latestDayUrl = latestDayKey ? `/notes/${latestDayKey}/` : '/notes'
const latestDayPreviews = sortedLatestDay.slice(0, 3).map((n) => ({
  description: n.data.description,
  title: n.data.title,
  time: new Date(n.data.pubDateTime).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }),
  url: `/notes/${latestDayKey}/#${n.slug}`,
}))

// --- Stream data with diversity algorithm ---
interface StreamItem {
  type: 'article' | 'talk' | 'note' | 'project' | 'short'
  title: string
  description?: string
  date: Date
  url: string
  isExternal: boolean
}

const allStreamItems: StreamItem[] = [
  ...posts.map((p) => ({
    type: 'article' as const,
    title: p.data.title,
    description: p.data.description,
    date: new Date(p.data.pubDateTime),
    url: `/blog/${p.slug}/`,
    isExternal: false,
  })),
  ...speakingEntries.slice(0, 10).map((s) => ({
    type: 'talk' as const,
    title: s.data.title,
    description: s.data.event,
    date: new Date(s.data.date),
    url: s.data.url,
    isExternal: true,
  })),
  ...[...notesByDay.entries()].map(([dateKey, dayNotes]) => {
    const sorted = [...dayNotes].sort((a, b) => a.data.pubDateTime.valueOf() - b.data.pubDateTime.valueOf())
    const daySummary = sorted.find((n) => n.data.daySummary)?.data.daySummary
    return {
      type: 'note' as const,
      title: sorted.length === 1 ? 'Note' : `${sorted.length} Notes`,
      description: daySummary ?? sorted.map((n) => n.data.title ?? n.data.description).filter(Boolean).join(', '),
      date: new Date(sorted[0].data.pubDateTime),
      url: `/notes/${dateKey}/`,
      isExternal: false,
    }
  }),
  ...projectEntries.map((p) => ({
    type: 'project' as const,
    title: p.data.title,
    description: p.data.description,
    date: new Date(p.data.date),
    url: p.data.repoUrl ?? '/projects',
    isExternal: true,
  })),
  ...shorts.slice(0, 3).map((s) => ({
    type: 'short' as const,
    title: s.title,
    description: s.source,
    date: s.published,
    url: s.youtubeUrl,
    isExternal: true,
  })),
].sort((a, b) => b.date.valueOf() - a.date.valueOf())

// Diversity algorithm: max 2 note groups, guarantee 1 article (if < 6 months old)
const sixMonthsAgo = new Date()
sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

const diverseStream: StreamItem[] = []
let noteCount = 0
let hasArticle = false
const guaranteeArticle = posts.length > 0 && new Date(posts[0].data.pubDateTime) > sixMonthsAgo

for (const item of allStreamItems) {
  if (diverseStream.length >= 8) break
  if (item.type === 'note') {
    if (noteCount >= 2) continue
    noteCount++
  }
  if (item.type === 'article') hasArticle = true
  diverseStream.push(item)
}

// If we need to guarantee an article and haven't included one, swap the last item
if (guaranteeArticle && !hasArticle && diverseStream.length > 0) {
  const latestArticle = allStreamItems.find((i) => i.type === 'article')
  if (latestArticle) {
    diverseStream[diverseStream.length - 1] = latestArticle
  }
}

const badgeClasses: Record<StreamItem['type'], string> = {
  article: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  talk: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  note: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  project: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  short: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
}

const badgeLabels: Record<StreamItem['type'], string> = {
  article: 'Article',
  talk: 'Talk',
  note: 'Note',
  project: 'Project',
  short: 'Short',
}
---
```

**Step 2: Rewrite the template (below the hero)**

Keep the `<Layout>` wrapper and entire hero section (lines 131-194) and the divider (lines 196-199) exactly as they are. Replace everything from line 201 (`<!-- Recent Activity Section -->`) to line 320 with the new curated sections, notes strip, and tabbed stream:

```astro
  <!-- Curated Sections Band -->
  <div class="w-full max-w-5xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      {latestPost && <LatestArticle post={latestPost} />}
      {recentTalks.length > 0 && <RecentTalks entries={recentTalks} />}
      {featuredProjects.length > 0 && <FeaturedProjects projects={featuredProjects} />}
    </div>
  </div>

  <!-- Section Divider -->
  <div class="w-full max-w-5xl mx-auto my-10 md:my-12">
    <div class="h-px bg-gradient-to-r from-transparent via-accent-300/70 dark:via-accent-700/30 to-transparent"></div>
  </div>

  <!-- Latest Notes Strip -->
  {latestDayKey && sortedLatestDay.length > 0 && (
    <div class="w-full max-w-5xl mx-auto mb-10 md:mb-12">
      <LatestNotes
        date={sortedLatestDay[0].data.pubDateTime}
        dayUrl={latestDayUrl}
        daySummary={latestDaySummary}
        noteCount={sortedLatestDay.length}
        previews={latestDayPreviews}
      />
    </div>
  )}

  <!-- Tabbed Stream -->
  <div class="w-full max-w-5xl mx-auto">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl sm:text-2xl font-bold text-zinc-800 dark:text-zinc-100">Recent Activity</h2>
      <a href="/stream" class="text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 font-medium text-sm flex items-center gap-1 transition-colors">
        View full stream
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </a>
    </div>

    <!-- Filter Pills -->
    <div class="mb-4 flex flex-wrap gap-2" id="home-stream-filters">
      <button data-filter="all" class="home-filter-btn active inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900">All</button>
      <button data-filter="article" class="home-filter-btn inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Articles</button>
      <button data-filter="talk" class="home-filter-btn inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Speaking</button>
      <button data-filter="note" class="home-filter-btn inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Notes</button>
      <button data-filter="project" class="home-filter-btn inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Projects</button>
      <button data-filter="short" class="home-filter-btn inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Shorts</button>
    </div>

    <!-- Stream Items (compact single-line format) -->
    <div class="flex flex-col gap-2">
      {diverseStream.map((item) => (
        <a
          href={item.url}
          target={item.isExternal ? '_blank' : undefined}
          rel={item.isExternal ? 'noopener noreferrer' : undefined}
          class="home-stream-item group flex items-center gap-3 rounded-xl bg-white/90 dark:bg-zinc-800/70 backdrop-blur ring-1 ring-zinc-200/60 dark:ring-zinc-700/40 px-4 py-2.5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
          data-type={item.type}
        >
          <span class={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClasses[item.type]}`}>
            {badgeLabels[item.type]}
          </span>
          <span class="shrink-0 text-xs text-zinc-500 dark:text-zinc-400 w-20 hidden sm:block">
            <FormattedDate date={item.date} />
          </span>
          <div class="min-w-0 flex-1">
            <span class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
              {item.title}
            </span>
            {item.description && (
              <span class="hidden sm:inline text-xs text-zinc-500 dark:text-zinc-400 ml-2 truncate">
                &mdash; {item.description}
              </span>
            )}
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" class="shrink-0 h-4 w-4 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      ))}
    </div>
  </div>
```

**Step 3: Add the client-side filter script**

Add this `<script>` tag after the closing `</Layout>` tag. It reuses the same pattern as `/stream` but targets the homepage elements:

```astro
<script>
  function initHomeStreamFilters() {
    const buttons = document.querySelectorAll<HTMLButtonElement>('.home-filter-btn')
    const items = document.querySelectorAll<HTMLElement>('.home-stream-item')

    const activeClass = 'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900'
    const inactiveClass =
      'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'

    function setFilter(filter: string) {
      for (const btn of buttons) {
        const isActive = btn.dataset.filter === filter
        for (const cls of [...activeClass.split(' '), ...inactiveClass.split(' ')]) {
          btn.classList.remove(cls)
        }
        for (const cls of (isActive ? activeClass : inactiveClass).split(' ')) {
          btn.classList.add(cls)
        }
      }

      for (const item of items) {
        if (filter === 'all' || item.dataset.type === filter) {
          item.classList.remove('hidden')
        } else {
          item.classList.add('hidden')
        }
      }
    }

    for (const btn of buttons) {
      btn.addEventListener('click', () => {
        setFilter(btn.dataset.filter ?? 'all')
      })
    }
  }

  document.addEventListener('astro:page-load', initHomeStreamFilters)
  initHomeStreamFilters()
</script>
```

**Step 4: Verify build**

Run: `cd src && bun run build`
Expected: Clean build with no errors.

**Step 5: Visual verification**

Run: `cd src && bun run dev`
Navigate to http://localhost:4321 and verify:
- Hero section unchanged
- Curated sections band shows 3 columns on desktop: Latest Article, Recent Talks, Featured Projects
- Notes strip shows 1 day-group with daySummary + up to 3 previews
- Tabbed stream shows 8 items with filter pills working
- Notes in stream appear as single-line items (not expanded bullet lists)
- Mobile view stacks columns correctly

**Step 6: Lint check**

Run: `cd src && bun run lint`
Expected: No new lint errors. Fix any that appear.

**Step 7: Commit**

```bash
git add src/src/pages/index.astro
git commit -m "feat: redesign homepage with curated sections, compact notes, tabbed stream

Replace single chronological stream with:
- Curated sections band (latest article, recent talks, featured projects)
- Compact notes strip (latest day-group with 3 previews)
- Diversity-weighted tabbed stream (max 2 note groups, guaranteed article)

Fixes notes dominating homepage by giving each content type dedicated space."
```

---

### Task 7: Final Build Verification and Lint

**Files:**
- All modified files from Tasks 1-6

**Step 1: Full production build**

Run: `cd src && bun run build`
Expected: Clean build, all pages generated successfully.

**Step 2: Lint the entire project**

Run: `cd src && bun run lint`
Expected: No errors. Fix any issues.

**Step 3: Dev server smoke test**

Run: `cd src && bun run dev`
Manually check these pages load correctly:
- `/` (homepage) — all sections render
- `/blog` — unchanged
- `/notes` — unchanged
- `/speaking` — unchanged
- `/projects` — unchanged
- `/stream` — unchanged
- `/shorts` — unchanged

Verify navigation shows: About | Blog | Speaking | Projects | Notes

**Step 4: Commit any lint fixes**

If lint produced fixes:
```bash
git add -A
git commit -m "fix: lint corrections from homepage redesign"
```
