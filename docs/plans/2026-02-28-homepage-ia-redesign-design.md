# Homepage & Information Architecture Redesign

**Date:** 2026-02-28
**Status:** Approved

## Problem

Notes (synced Mastodon toots) dominate the homepage feed. With 33 notes in Feb 2026 vs 1 blog post, the pure-chronological stream allocates ~80-90% of visual real estate to note day-groups. Blog posts, speaking engagements, and projects — higher-effort, more evergreen content — get pushed out. Additionally, the navigation structure buries Projects in secondary nav (invisible on desktop) and gives Shorts (5 items) a top-level slot.

## Audience

Mixed: professional peers, hiring/opportunity scouts, IndieWeb/Fediverse followers. Design must serve all three without privileging one.

## Design

### Homepage Layout (top to bottom)

#### 1. Hero (unchanged)
Bio, photo, professional badges, social links.

#### 2. Curated Sections Band
Three columns on desktop, stacking vertically on mobile:

| Latest Article | Recent Talks | Featured Projects |
|---|---|---|
| Hero image card with title, excerpt, date | 2-3 compact list items with event name, date, type badge | 2-3 cards for items with `featured: true` |
| "Read post ->" link | "All speaking ->" link | "All projects ->" link |

- **Latest Article**: Most recent blog post as a prominent card with hero image. Always shows something regardless of age.
- **Recent Talks**: 2-3 most recent speaking entries, compact list format (no images).
- **Featured Projects**: Up to 3 projects with `featured: true`, falling back to most recent if fewer are featured.

#### 3. Latest Notes Strip
Compact section showing the most recent day-group only:

- Header: "Notes" with emerald badge + "View all notes ->" link
- Day summary (from `daySummary` field if available)
- Up to 3 truncated note previews with timestamps
- "and N more" if the day has more than 3 notes
- Clicking goes to `/notes/YYYY-MM-DD/`

#### 4. Tabbed Stream
"Recent Activity" section with filter pills:

- Tabs: All | Articles | Speaking | Notes | Projects | Shorts
- Default: "All" with diversity weighting (see algorithm below)
- Shows 8 items
- "View full stream ->" link to `/stream`
- Client-side tab filtering (same pattern as `/stream` page)

### Navigation

**Primary nav** (header, always visible):
- About | Blog | Speaking | Projects | Notes

**Secondary nav** (mobile menu + footer):
- Shorts | Stream | Colophon

**Footer nav** (unchanged):
- Privacy | RSS | JSON Feed

Changes from current:
- Projects: secondary -> primary (more visible on desktop)
- Shorts: primary -> secondary (only 5 items, insufficient volume for top-level)
- Navigation item count stays at 5 primary

### Notes Compact Format

**Homepage notes strip:**
- daySummary + up to 3 single-line truncated previews with HH:MM timestamps
- "and N more" overflow indicator
- Single day-group only

**Stream items (homepage + /stream):**
- Single-line format: "Note badge . date . count -- summary preview ->"
- No bullet-list expansion in the stream

**Full expansion:** Only on `/notes` timeline and `/notes/YYYY-MM-DD/` detail pages.

### Stream Diversity Algorithm

For the "All" tab on the homepage (8 items):

1. Sort all items by date descending
2. Cap: max 2 note day-groups in the visible set
3. Guarantee: at least 1 article if any published in the last 6 months
4. Fill remaining slots chronologically from any type

Individual type tabs: pure chronological, no caps.
`/stream` page full archive: no caps, filter pills for self-selection.

### Pages Unchanged

- `/blog` -- grid listing with hero images
- `/notes` -- timeline listing
- `/notes/[slug]` -- day detail pages
- `/speaking` -- filtered listing with type pills
- `/projects` -- categorised listing
- `/shorts` -- grid listing
- `/stream` -- full archive with filters

## Build Considerations

All changes are static/build-time. Compatible with weekly rebuild cadence. No client-side data fetching required. Tab filtering uses existing client-side JS pattern from `/stream`.

## Key Files to Modify

- `src/src/pages/index.astro` -- homepage layout and logic (major rewrite)
- `src/src/consts.ts` -- navigation arrays (SITE_NAV, SITE_SECONDARY_NAV)
- Possibly extract new components for curated sections (e.g. `LatestArticleCard.astro`, `RecentTalks.astro`, `FeaturedProjects.astro`, `LatestNotes.astro`)
