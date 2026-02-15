# UX Information Architecture Review

## Sealjay.com Portfolio & Blog

**Date:** 2026-02-15
**Author:** IA Review (Claude)

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Problems & Gaps](#2-problems--gaps)
3. [Proposed Information Architecture](#3-proposed-information-architecture)
4. [New Content Types](#4-new-content-types)
5. [Navigation Design](#5-navigation-design)
6. [Page-by-Page Design Recommendations](#6-page-by-page-design-recommendations)
7. [Homepage Unified Activity Feed](#7-homepage-unified-activity-feed)
8. [Speaking Kit](#8-speaking-kit)
9. [Content Collection Schemas](#9-content-collection-schemas)
10. [Visual Display Patterns](#10-visual-display-patterns)
11. [Implementation Priority](#11-implementation-priority)

---

## 1. Current State Analysis

### Current Site Map

```
Home (/)
├── About (/about)
├── Blog (/blog)
│   └── [slug] (/blog/:slug)
├── Speaking (/speaking)
├── Acknowledgements (/acknowledgements)
├── Privacy (/privacy)
└── Utilities
    ├── RSS (/rss.xml)
    ├── Search (modal)
    └── Legacy redirects
```

### Current Content Volume

| Collection       | Count | Format |
| ---------------- | ----- | ------ |
| Blog posts       | 63    | MDX    |
| Speaking entries  | 38    | MDX    |
| Acknowledgements | ~15   | MDX    |

### Current Navigation (4 items)

About | Blog | Speaking | Acknowledgements

### What Works Well

- **Clean card grid pattern** used consistently across blog, speaking, and acknowledgements
- **Dark mode** fully implemented with localStorage persistence
- **Search** covers blog and speaking via Fuse.js
- **Blog grouping by month/year** provides good temporal scanning
- **Speaking event type badges** (Conference, Video, Podcast, etc.) give quick visual categorisation
- **Giscus comments** on blog posts enable community discussion
- **SEO foundations** are solid (JSON-LD, OG tags, canonical URLs, sitemap, RSS)
- **Professional badges** system is flexible and well-structured

---

## 2. Problems & Gaps

### Structural Issues

1. **Flat content model** - Only three content types (blog, speaking, acknowledgements) for a person who produces content across many formats and platforms
2. **No way to surface external content** - LinkedIn posts, tweets, or external articles have no representation
3. **No project/code showcase** - No place to highlight open source repos, tools, or side projects
4. **No microblog/notes** - No lightweight format for quick thoughts, links, or commentary
5. **"Acknowledgements" in primary nav** - This is a low-traffic utility page occupying prime navigation real estate; it should be demoted to the footer
6. **Speaking page is outward-linking only** - Every card links to an external URL; there's no "Book me" or speaking kit to convert inbound interest
7. **No unified activity stream** - The homepage shows only recent blog posts. A visitor can't see the breadth of your output (talks, social posts, code, notes) at a glance
8. **Blog-centric homepage** - Doesn't reflect that you're equally active as a speaker, open source contributor, and thought leader on social media

### Content Display Issues

9. **Speaking cards lack thumbnails** - The `thumbnail` field exists in the schema but isn't rendered on the speaking page
10. **No tag filtering** on the blog listing - Tags are shown on cards but aren't clickable/filterable
11. **No content type filtering on search** - Search results show type badges but you can't filter by type

---

## 3. Proposed Information Architecture

### New Site Map

```
Home (/)                          ← Unified activity feed + hero
│
├── About (/about)                ← Bio, credentials, links (unchanged)
│
├── Blog (/blog)                  ← Long-form articles (unchanged structure)
│   ├── [slug] (/blog/:slug)
│   └── Tag view (/blog/tag/:tag) ← NEW: Filter by tag
│
├── Speaking (/speaking)          ← Restructured
│   ├── Events listing            ← Talks, podcasts, media (current)
│   └── Speaker Kit (/speaking/kit) ← NEW: "Book me" page
│
├── Notes (/notes)                ← NEW: Microblog
│   └── [slug] (/notes/:slug)    ← Individual note (if longer)
│
├── Projects (/projects)          ← NEW: Code repos & tools
│   └── [slug] (/projects/:slug) ← Optional detail pages
│
├── Stream (/stream)              ← NEW: Unified activity feed (full view)
│
└── Footer-only pages
    ├── Acknowledgements (/acknowledgements)
    ├── Privacy (/privacy)
    └── RSS (/rss.xml)
```

### Navigation (Primary)

```
About | Blog | Speaking | Notes | Projects
```

**Rationale:**

- **5 items** is the maximum for a clean horizontal nav; this is at the limit
- **Acknowledgements** moves to footer-only (low user intent, high nav cost)
- **Notes** replaces Acknowledgements in nav, giving the microblog first-class status
- **Projects** earns a nav slot because showcasing code is a primary goal
- **Stream** is accessible from the homepage "View all" link but doesn't need a nav slot (it's a roll-up view, not a primary destination)

### Navigation (Mobile)

Same 5 items in the slide-out menu, with Stream accessible via the homepage.

---

## 4. New Content Types

### 4.1 Notes (Microblog)

**Purpose:** Quick thoughts, link commentary, "train of thought" posts, cool repo finds, and anything that doesn't warrant a full blog post. Follows [IndieWeb](https://indieweb.org/note) principles: publish on your own domain first, syndicate outward.

**Content characteristics:**

- Short (typically under 280-500 characters, but no hard limit)
- No title required (title-less posts feel more casual and social)
- Optional title for longer notes
- Can contain links, images, code snippets
- Can reference/embed external content (a LinkedIn post, a GitHub repo, a tweet)
- Tagged for discoverability
- Displayed in a compact, timeline-style layout (not full cards)

**Use cases:**

- "Just found this excellent repo for..." with a link
- Quick reaction to an industry announcement
- Sharing a LinkedIn post you're proud of without duplicating its content
- A thought on a conference you attended
- Linking to someone else's article with brief commentary

### 4.2 Projects (Code Repositories & Tools)

**Purpose:** Curated showcase of open source projects, tools, and code repositories you've built or contributed to significantly. Not an exhaustive GitHub mirror - a hand-picked selection with context.

**Content characteristics:**

- Project name and one-line description
- Longer description (what it does, why it matters)
- Repository URL (GitHub, etc.)
- Live demo URL (optional)
- Tech stack / language tags
- Status (Active, Maintained, Archived, Contribution)
- Stars / forks (optional, can be fetched at build time via GitHub API)
- Hero image or screenshot (optional)
- Related blog post slug (optional, same pattern as speaking)

### 4.3 Highlights (Social/External Content)

**Purpose:** Surface popular or important content published on external platforms (LinkedIn posts, tweets, external articles) without copying the content into the site. These are link-out entries that appear in the unified stream and optionally on a dedicated page.

**Content characteristics:**

- Platform (LinkedIn, X/Twitter, External Article, Mastodon, YouTube, etc.)
- External URL (the canonical link)
- Brief description / pull quote (your summary, not a copy of the full post)
- Date published
- Optional thumbnail or OG image
- Optional engagement metrics note (e.g., "50k+ impressions" - manually curated, not auto-fetched)
- Tags

**Key design principle:** These link *out* to the platform. The site shows them in the timeline but doesn't host the content. This keeps you as the curator of your own history without duplicating platform-native content.

### 4.4 Speaker Kit (Static Page, Not a Collection)

**Purpose:** A "book me to speak" page that gives event organisers everything they need in one place. This is a single page, not a content collection.

See [Section 8](#8-speaking-kit) for full details.

---

## 5. Navigation Design

### Desktop Navigation Bar

```
[Avatar]  About  Blog  Speaking  Notes  Projects  [Search] [Dark Mode]
```

- The pill-style nav works well at 5 items; it would start to feel crowded at 6+
- "Speaking" serves as the parent for both the events listing and the speaker kit (kit linked from within the speaking page and as a CTA)

### Footer Navigation

```
About | Blog | Speaking | Notes | Projects | Acknowledgements | Privacy | RSS
```

- Footer includes all primary nav items plus demoted/utility pages
- Add RSS link to footer (currently only discoverable via direct URL)

### Mobile Menu

```
About
Blog
Speaking
Notes
Projects
──────
Acknowledgements
Privacy
```

- Separator between primary and secondary items

---

## 6. Page-by-Page Design Recommendations

### 6.1 Homepage (/)

**Current:** Hero + Recent Articles (5 blog posts in a grid)

**Proposed:** Hero + Unified Activity Stream

The homepage should answer: *"What has Chris been doing lately?"* - not just *"What has Chris written lately?"*

**Layout:**

```
┌─────────────────────────────────────────────────┐
│  [Hero Section - largely unchanged]             │
│  Avatar, tagline, badges, social links          │
│                                                 │
│  Current role pill badge                        │
│  "Software engineer, open source &              │
│   sustainability enthusiast."                   │
│  Professional badges                            │
│  Social links                                   │
├─────────────────────────────────────────────────┤
│  ── gradient divider ──                         │
├─────────────────────────────────────────────────┤
│  Recent Activity                    [View all →]│
│                                                 │
│  Filter pills:                                  │
│  [All] [Articles] [Talks] [Notes] [Projects]    │
│                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Blog Card│ │Talk Card │ │Note Card │        │
│  │ (full)   │ │(compact) │ │(compact) │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Highlight│ │Project   │ │ Blog Card│        │
│  │ Card     │ │ Card     │ │ (full)   │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│                                                 │
│  [View all activity →]                          │
└─────────────────────────────────────────────────┘
```

**Key changes:**

- Replace "Recent Articles" with "Recent Activity" pulling from all content types
- Add lightweight client-side filter pills (All / Articles / Talks / Notes / Projects / Highlights)
- Sort everything by date, newest first
- Show 6-9 items in the grid
- Each content type gets a visually distinct card variant (see Section 10)

### 6.2 Blog (/blog)

**Mostly unchanged,** with these additions:

- **Tag filter bar** at the top: clickable tag pills that filter the grid (client-side JS or separate `/blog/tag/:tag` pages generated at build time)
- Consider adding a **view toggle** (grid vs. list) for power users who want to scan titles quickly

### 6.3 Speaking (/speaking)

**Restructured into two sub-sections:**

```
┌─────────────────────────────────────────────────┐
│  Speaking                                       │
│  "I speak at conferences, on podcasts, ..."     │
│                                                 │
│  ┌─────────────────────────────────────┐        │
│  │  Looking to book me?                │        │
│  │  View my Speaker Kit →              │        │
│  └─────────────────────────────────────┘        │
│                                                 │
│  Filter pills:                                  │
│  [All] [Conference] [Podcast] [Video]           │
│  [Workshop] [Media Mention]                     │
│                                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Event    │ │ Event    │ │ Event    │        │
│  │ Card     │ │ Card     │ │ Card     │        │
│  │ +thumb   │ │ +thumb   │ │ +thumb   │        │
│  └──────────┘ └──────────┘ └──────────┘        │
└─────────────────────────────────────────────────┘
```

**Changes:**

- Add a prominent **CTA banner** linking to the Speaker Kit at the top
- **Render thumbnails** on speaking cards (the data exists but isn't displayed)
- Add **event type filter pills** (the badges already exist; make them clickable filters)
- Consider showing a **count** per event type

### 6.4 Notes (/notes) - NEW

**Design:** A reverse-chronological timeline, more compact than the blog grid.

```
┌─────────────────────────────────────────────────┐
│  Notes                                          │
│  "Quick thoughts, links, and things I find      │
│   interesting."                                 │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ 📌 Feb 14, 2026                        │    │
│  │ Found an excellent green software       │    │
│  │ calculator by @someone - check it out:  │    │
│  │ https://github.com/...                  │    │
│  │ #GreenSoftware #OpenSource              │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ 📌 Feb 12, 2026                        │    │
│  │ "Why AI governance matters for SMEs"    │    │
│  │ My LinkedIn post on AI governance got   │    │
│  │ some great discussion. [View on LI →]   │    │
│  │ #AI #Governance                         │    │
│  └─────────────────────────────────────────┘    │
│                                                 │
│  ┌─────────────────────────────────────────┐    │
│  │ 📌 Feb 10, 2026                        │    │
│  │ Thinking about the intersection of      │    │
│  │ carbon-aware computing and LLM          │    │
│  │ inference scheduling...                 │    │
│  │ #GreenAI #LLMs                          │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

**Key design decisions:**

- **Single-column** timeline layout (not a grid) - suits short-form content better
- **No hero images** - keeps it lightweight and fast to scan
- **Date prominent** - temporal context matters for notes
- **Tags inline** as hashtag-style links
- **Links auto-unfurl** into simple preview cards (optional enhancement)
- Notes with an external URL show a subtle outbound link indicator
- Optional title shown as bold first line if present; otherwise body text flows directly
- **RSS feed** at `/notes/rss.xml` for notes specifically

### 6.5 Projects (/projects) - NEW

**Design:** A curated grid of project cards, visually distinct from blog cards.

```
┌─────────────────────────────────────────────────┐
│  Projects                                       │
│  "Open source tools and things I've built."     │
│                                                 │
│  ┌──────────────────────┐ ┌────────────────────┐│
│  │  [icon/screenshot]   │ │  [icon/screenshot] ││
│  │                      │ │                    ││
│  │  Project Name        │ │  Project Name      ││
│  │  One-line desc       │ │  One-line desc     ││
│  │                      │ │                    ││
│  │  TS  React  Azure    │ │  Python  Azure     ││
│  │                      │ │                    ││
│  │  ⚡ Active           │ │  🔧 Maintained     ││
│  │  ★ 42  🔀 12         │ │  ★ 8               ││
│  │                      │ │                    ││
│  │  [GitHub] [Demo]     │ │  [GitHub] [Blog]   ││
│  └──────────────────────┘ └────────────────────┘│
│                                                 │
│  ┌──────────────────────┐ ┌────────────────────┐│
│  │  Contribution        │ │  ...               ││
│  │  (different style)   │ │                    ││
│  └──────────────────────┘ └────────────────────┘│
└─────────────────────────────────────────────────┘
```

**Key design decisions:**

- **2-column grid** on desktop (wider cards to show more detail), 1-column on mobile
- **Status badge** (Active / Maintained / Archived / Contribution) with colour coding
- **Tech stack pills** using the same tag style as blog tags
- **Star/fork counts** shown subtly (optional - can fetch from GitHub API at build time or enter manually)
- **Two CTA buttons** per card: primary (GitHub repo) and secondary (Live demo or related blog post)
- **"Contribution" variant** for projects you didn't create but contributed to significantly - slightly different visual treatment (e.g., border accent instead of filled header)
- Featured projects can be pinned to the top

### 6.6 Stream (/stream) - NEW

**Purpose:** Full, paginated view of all activity across every content type, sorted by date. This is the "everything" view.

```
┌─────────────────────────────────────────────────┐
│  Stream                                         │
│  "Everything I've published, presented,         │
│   or found interesting."                        │
│                                                 │
│  Filter: [All] [Articles] [Talks] [Notes]       │
│          [Projects] [Highlights]                │
│                                                 │
│  ── February 2026 ──                            │
│  [Note card]  [Blog card]  [Highlight card]     │
│                                                 │
│  ── January 2026 ──                             │
│  [Talk card]  [Note card]  [Project card]       │
│  [Blog card]                                    │
│                                                 │
│  [Load more / pagination]                       │
└─────────────────────────────────────────────────┘
```

- Groups by month (same pattern as current blog listing)
- Filter pills are client-side toggles
- This page is generated at build time with all content merged and sorted

---

## 7. Homepage Unified Activity Feed

### How It Works

At build time, merge all collections into a single sorted array:

```typescript
type ActivityItem = {
  type: 'blog' | 'speaking' | 'note' | 'project' | 'highlight'
  title?: string        // optional for notes
  description: string
  date: Date
  url: string           // internal or external
  tags?: string[]
  thumbnail?: string
  meta: Record<string, unknown>  // type-specific data
}
```

The homepage takes the most recent 6-9 items. Each renders with a type-specific card variant (see Section 10).

### Benefits

- Visitors immediately see the full breadth of activity
- Encourages cross-content discovery (someone who came for a blog post might notice a talk)
- Feels alive and active even if you haven't written a long blog post recently
- Notes and highlights are low-effort to publish, keeping the feed fresh

---

## 8. Speaking Kit

### What Is a Speaker Kit?

A speaker kit (also called a "speaker one-sheet" or "media kit") is a single page that gives event organisers everything they need to evaluate, book, and promote you as a speaker. It's the difference between getting cold enquiries and making it effortless for organisers to say yes.

### Page: `/speaking/kit`

**Not in primary nav** - linked from the Speaking page CTA banner, the About page, and the footer.

### Recommended Sections

#### 8.1 Hero / Intro

```
┌─────────────────────────────────────────────────┐
│  Book Chris to Speak                            │
│                                                 │
│  [Professional headshot]                        │
│                                                 │
│  Chris Lloyd-Jones (Sealjay) is a VP of AI      │
│  Consulting Transformation at Kyndryl, 6x       │
│  Microsoft MVP, and a passionate advocate for   │
│  sustainable AI and open source.                │
│                                                 │
│  [Download headshot ↓]  [Download bio ↓]        │
│  [Contact me →]                                 │
└─────────────────────────────────────────────────┘
```

- Short (150-200 word) speaker-specific bio focused on *why* someone should book you
- Downloadable high-res headshot (provide 2-3 options: square, landscape, dark bg)
- Downloadable text bio in two lengths (50-word and 150-word)
- Clear contact CTA

#### 8.2 Topics I Speak About

```
┌─────────────────────────────────────────────────┐
│  Topics                                         │
│                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ 🌿 Green    │ │ 🤖 AI &     │ │ 🔓 Open   │ │
│  │ Software &  │ │ Enterprise  │ │ Source at  │ │
│  │ Green AI    │ │ Transfor-   │ │ Scale     │ │
│  │             │ │ mation      │ │           │ │
│  │ Carbon-     │ │ Practical   │ │ OSPOs,    │ │
│  │ aware dev,  │ │ AI adoption │ │ InnerSrc, │ │
│  │ ISO/IEC     │ │ and         │ │ community │ │
│  │ 21031, SCI  │ │ governance  │ │ building  │ │
│  └─────────────┘ └─────────────┘ └───────────┘ │
│                                                 │
│  ┌─────────────┐ ┌─────────────┐               │
│  │ 🔐 Secure   │ │ 💡 Innov-   │               │
│  │ AI & Cyber  │ │ ation &     │               │
│  │ Security    │ │ Incubation  │               │
│  └─────────────┘ └─────────────┘               │
└─────────────────────────────────────────────────┘
```

- 3-5 topic areas with short descriptions
- Each topic can link to filtered speaking events or related blog posts

#### 8.3 Talk Formats

A simple list or grid showing what formats you're comfortable with:

- **Keynote** (30-60 min)
- **Conference talk** (20-45 min)
- **Panel discussion / fireside chat**
- **Workshop** (half-day / full-day)
- **Podcast guest**
- **Webinar / virtual event**
- **MC / host**

#### 8.4 Previous Speaking Highlights

Curated selection of 3-6 best talks with:

- Event name and logo (if available)
- Talk title
- Video embed or link
- A testimonial quote from the organiser or audience (if available)

This is **not** a full listing (that's the Speaking page) - it's a "greatest hits" to impress event organisers quickly.

#### 8.5 Testimonials / Social Proof

```
┌─────────────────────────────────────────────────┐
│  What organisers say                            │
│                                                 │
│  "Chris delivered one of the most engaging      │
│   sessions at [Event]. The audience feedback    │
│   was overwhelmingly positive."                 │
│   — Name, Role, Event                           │
│                                                 │
│  "Incredibly knowledgeable and approachable.    │
│   Would book again without hesitation."         │
│   — Name, Role, Event                           │
└─────────────────────────────────────────────────┘
```

- 2-4 testimonials
- Include name, role, and event for credibility

#### 8.6 Logistics & Requirements

Brief section covering:

- Based in London, available worldwide
- Travel requirements / preferences
- A/V requirements (if any standard ones)
- Whether you require a speaker fee or speak pro-bono at community events

#### 8.7 Contact / Book Me CTA

- Contact form or email link
- Social media links
- "For speaking enquiries, email [address]"

### Speaker Kit Data Model

This doesn't need to be a content collection - it's a single page. The data can live in `src/config/speakerKit.ts` or be hardcoded in the page. Topics and testimonials could be arrays in a config file for easy editing:

```typescript
// src/config/speakerKit.ts
export const speakerTopics = [
  {
    icon: '🌿',
    title: 'Green Software & Green AI',
    description: 'Carbon-aware development, ISO/IEC 21031, SCI specification...',
    relatedTags: ['GreenSoftware', 'GreenAI', 'Sustainability'],
  },
  // ...
]

export const testimonials = [
  {
    quote: '...',
    author: 'Name',
    role: 'Role',
    event: 'Event Name',
  },
  // ...
]

export const talkFormats = [
  'Keynote (30-60 min)',
  'Conference talk (20-45 min)',
  // ...
]

export const speakerBio = {
  short: '50-word bio...',
  long: '150-word bio...',
}

export const headshots = [
  { label: 'Square (1:1)', url: '/speaker-kit/headshot-square.jpg' },
  { label: 'Landscape (16:9)', url: '/speaker-kit/headshot-landscape.jpg' },
]
```

---

## 9. Content Collection Schemas

### 9.1 Notes Collection (NEW)

```typescript
const note = defineCollection({
  schema: z.object({
    // Title is optional for microblog-style posts
    title: z.string().optional(),
    // Body content comes from MDX body, not frontmatter
    pubDateTime: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    tags: z.array(z.string()).optional(),
    // External URL this note references or links to
    externalUrl: z.string().url().optional(),
    // Platform hint for external links (for icon/styling)
    externalPlatform: z
      .enum(['LinkedIn', 'Twitter', 'GitHub', 'Mastodon', 'YouTube', 'Other'])
      .optional(),
    // If true, this note is a "highlight" of external content
    isHighlight: z.boolean().default(false),
    // Optional engagement note (e.g., "50k+ impressions")
    engagementNote: z.string().optional(),
  }),
})
```

**Why combine notes and highlights into one collection?**

- Both are short-form, date-driven content
- The `isHighlight` flag and `externalUrl` distinguish them
- Avoids the overhead of a separate collection for what is essentially the same content shape
- On the Notes page, you can filter/section them (e.g., "Highlights" section at top, "Notes" below)
- In the Stream, they render with the same timeline treatment

### 9.2 Projects Collection (NEW)

```typescript
const project = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    // Longer description in MDX body
    repoUrl: z.string().url(),
    demoUrl: z.string().url().optional(),
    heroImage: z.string().optional(),
    techStack: z.array(z.string()),  // e.g., ['TypeScript', 'React', 'Azure']
    status: z.enum(['Active', 'Maintained', 'Archived', 'Contribution']),
    // Date for sorting (project start or last notable update)
    date: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    // Optional: manual star count (or fetch at build time)
    stars: z.number().optional(),
    // Related blog post
    blogPostSlug: z.string().optional(),
    // Pin to top of projects page
    featured: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
})
```

### 9.3 Updated Blog Collection (minor additions)

```typescript
const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDateTime: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    updatedDate: z
      .string()
      .optional()
      .transform((str) => (str ? new Date(str) : undefined)),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
    sourceUrl: z.string().url().optional(),
    // NEW: estimated reading time (can also be computed at build)
    readingTime: z.number().optional(),
    // NEW: mark post as featured for homepage prioritisation
    featured: z.boolean().default(false),
  }),
})
```

### 9.4 Updated Speaking Collection (minor additions)

```typescript
const speaking = defineCollection({
  schema: z.object({
    title: z.string(),
    eventType: z.enum([
      'Conference', 'Video', 'Media Mention', 'Podcast', 'Workshop',
      'Webinar', 'Panel',  // NEW: additional types
    ]),
    description: z.string(),
    event: z.string(),
    date: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    cta: z.string(),
    url: z.string().url(),
    thumbnail: z.string(),
    blogPostSlug: z.string().optional(),
    // NEW: mark as featured for speaker kit highlights
    featured: z.boolean().default(false),
    // NEW: video embed URL (YouTube, Vimeo) for inline playback
    videoEmbedUrl: z.string().url().optional(),
  }),
})
```

### 9.5 Exported Collections

```typescript
export const collections = {
  blog,
  speaking,
  acknowledgement,
  note,      // NEW
  project,   // NEW
}
```

---

## 10. Visual Display Patterns

### 10.1 Card Variants by Content Type

Each content type should have a visually distinct card, but all sharing the same base structure (rounded-xl, shadow, hover lift). Differentiation comes from:

| Content Type | Card Style                    | Distinguishing Feature                     |
| ------------ | ----------------------------- | ------------------------------------------ |
| **Blog**     | Full card with hero image     | 16:9 image, "Read post" CTA, tag pills    |
| **Speaking** | Compact card with thumbnail   | Event type badge, calendar icon, event name|
| **Note**     | Borderless timeline entry     | No card chrome, date + text + tags inline  |
| **Project**  | Wide card (2-col on desktop)  | Status badge, tech stack pills, star count |
| **Highlight**| Compact card with platform icon| Outbound link indicator, platform badge    |

### 10.2 Blog Post Cards (Enhanced)

Current design works well. Additions:

- **Reading time** shown next to date (schema already has the field, homepage already checks for it)
- **Tag pills** shown on homepage cards too (currently only on blog listing)
- **Featured badge** for pinned posts

### 10.3 Speaking Event Cards (Enhanced)

- **Render the thumbnail** - the data exists but the current speaking page doesn't display it
- Use the same 16:9 aspect ratio as blog hero images for visual consistency
- Add the thumbnail as a card header image

### 10.4 Note Cards (Timeline Style)

```
┌─ Feb 14, 2026 ─────────────────────────────────┐
│                                                 │
│  Found an excellent green software calculator   │
│  by @someone - definitely worth checking out.   │
│                                                 │
│  → github.com/someone/green-calc                │
│                                                 │
│  #GreenSoftware  #OpenSource                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

- Left-aligned, single column
- Date as a subtle header
- Body text with auto-linked URLs
- Tags as inline hashtag-style links
- Outbound links get a subtle external-link icon
- Highlights variant adds a platform icon (LinkedIn logo, etc.) and optional engagement note

### 10.5 Project Cards

```
┌─────────────────────────────────────────────────┐
│  [Screenshot / OG Image]                        │
│                                                 │
│  Project Name                         ⚡ Active │
│  One-line description of what it does           │
│                                                 │
│  TypeScript  React  Azure Functions             │
│                                                 │
│  [View on GitHub →]   [Live Demo →]             │
└─────────────────────────────────────────────────┘
```

- 2-column grid on desktop, 1-column on mobile
- Status badge colour-coded:
  - Active = green
  - Maintained = blue
  - Archived = grey
  - Contribution = accent/teal
- Tech stack as small pills
- Two CTAs: GitHub (primary) and Demo/Blog (secondary)

### 10.6 Unified Stream Cards (Mixed)

In the Stream and homepage activity feed, all card types render at the same width in a 3-column grid, but each uses its type-specific variant. A small **type label** appears on each card:

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 📝 Article   │  │ 🎤 Talk      │  │ 💬 Note      │
│ [hero img]   │  │ [thumbnail]  │  │              │
│ Title...     │  │ Title...     │  │ Short text.. │
│ Desc...      │  │ Event name   │  │ #tags        │
│ Tags         │  │ Badge        │  │              │
│ Read post →  │  │ View event → │  │ Feb 14, 2026 │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 11. Implementation Priority

### Phase 1: Foundation (Core IA Changes)

1. **Move Acknowledgements out of primary nav** into footer
2. **Create Notes content collection** with schema
3. **Create Projects content collection** with schema
4. **Create `/notes` page** with timeline layout
5. **Create `/projects` page** with card grid
6. **Update `consts.ts`** nav to: About | Blog | Speaking | Notes | Projects
7. **Update footer** to include all pages
8. **Update search index** to include notes and projects

### Phase 2: Homepage & Stream

8. **Build unified activity feed** utility that merges all collections
9. **Redesign homepage** "Recent Activity" section with filter pills
10. **Create `/stream` page** with full activity timeline
11. **Add content type badges** to search results

### Phase 3: Speaking Kit & Enhancements

12. **Create `/speaking/kit` page** with all sections from this document
13. **Add speaker kit CTA** to speaking page
14. **Render thumbnails** on speaking cards
15. **Add event type filter pills** to speaking page
16. **Create `speakerKit.ts` config** with topics, testimonials, bios, headshots

### Phase 4: Blog Enhancements

17. **Add tag pages** (`/blog/tag/:tag`) or client-side tag filtering
18. **Compute reading time** at build time
19. **Add featured post support** to homepage

### Phase 5: Polish

20. **Add Notes RSS feed** (`/notes/rss.xml`)
21. **Add JSON feed** alongside RSS for IndieWeb compatibility
22. **Update OG images** per content type
23. **Add "highlight" variant** styling to notes with external platform content
24. **Mobile menu separator** between primary and secondary nav items

---

## Summary

The core insight is that sealjay.com currently treats you as primarily a blogger, when in reality you produce content across many formats and platforms. The proposed IA:

1. **Expands the content model** from 3 types to 5 (blog, speaking, notes, projects, + highlights within notes)
2. **Introduces a unified activity stream** so the homepage reflects the full breadth of your work
3. **Adds a microblog** for low-friction publishing of thoughts, links, and repo discoveries
4. **Adds a projects showcase** for code and open source work
5. **Adds a professional speaker kit** to convert inbound speaking interest
6. **Reclaims nav space** by demoting Acknowledgements to the footer
7. **Enhances existing pages** with filtering, thumbnails, and featured content support

The design stays within Astro's content collections model, uses the existing Tailwind/component system, and can be implemented incrementally without breaking the current site.
