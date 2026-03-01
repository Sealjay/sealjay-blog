# Design: Merge YouTube Shorts & Videos into Speaking Collection

**Date:** 2026-03-01
**Status:** Approved

## Problem

YouTube shorts are a separate content system (RSS fetch + data collection + dedicated `/shorts` page) despite being a form of speaking content. Full-length Securing the Realm videos aren't surfaced at all. The empty `short` data collection causes build warnings.

## Decision

Remove the standalone shorts system. Auto-populate speaking entries from the Securing the Realm YouTube channel feed at build time, classifying each video as `Short` or `Podcast` based on whether it appears in the shorts playlist. MDX speaking entries override auto-populated data on YouTube ID match.

## Design

### Data source

Single YouTube channel feed (`UCS4KTDaZTiyiMj2yZztwmlg`) fetched at build time. The shorts playlist (`PLo9Ah7HeyG1Rkqq0cc1QJtttkywXKWd9g`) is fetched in parallel to classify which videos are shorts.

Config in `personal.ts`:

```ts
export const youtubeFeeds = {
  channelId: 'UCS4KTDaZTiyiMj2yZztwmlg',
  shortsPlaylistId: 'PLo9Ah7HeyG1Rkqq0cc1QJtttkywXKWd9g',
  event: 'Securing the Realm',
  defaultTags: ['YouTube', 'Security'],
}
```

### Schema change

Add `'Short'` to the speaking `eventType` enum in `content/config.ts`.

### Build-time merge logic (updated `youtube.ts`)

1. Fetch channel feed (all videos)
2. Fetch shorts playlist (short IDs only)
3. For each video:
   - If ID in shorts playlist → `eventType: 'Short'`, URL as `youtube.com/shorts/{id}`
   - Otherwise → `eventType: 'Podcast'`, URL as `youtube.com/watch?v={id}`
4. Check for MDX speaking entries with matching YouTube URL/ID
5. MDX wins for title, description, date, event, tags — RSS fills gaps
6. Non-overridden videos get: `event: "Securing the Realm"`, `cta: "Watch short"` or `"Watch episode"`

### Speaking page

- `Short` appears as a new filter pill (auto-derived from eventTypes)
- Shorts interleave by date with other entries
- Shorts show play icon (same as Video type)
- No other page changes needed — existing rendering handles it

### Stream page

- Remove `short` type from `StreamItem` union
- Remove `getShorts()` import and shortItems mapping
- All speaking entries (including shorts) render as "Speaking" badge
- Description shows `"Securing the Realm - Short"` etc.
- Remove the "Shorts" filter button

### Search index (`search.json.ts`)

- Remove `getShorts()` call
- Shorts now included via speaking entries (type: 'speaking')

### Pages removed

- `/shorts/index.astro` — deleted
- `/shorts/rss.xml.js` — deleted

### Files removed

- `src/content/short/` directory (and `short` collection from `config.ts`)
- `youtubeShorts` export from `personal.ts` (replaced by `youtubeFeeds`)

### Navigation

- Remove `/shorts` from `SITE_SECONDARY_NAV` in `consts.ts`

### Manual entries

- Change `ai-agents-entra-id-2025.mdx` eventType from `Video` to `Short`
- Add new MDX entry for `vQaRs4a1dHU` ("Exploring the Potential of Computer-Using Agents") as `eventType: "Video"`, `event: "YouTube"` (Sealjay channel, not auto-populated)

### Embed handling

Shorts use `youtube.com/shorts/{id}` URLs (vertical format). Full videos use `youtube.com/watch?v={id}`. The speaking page links externally so this is handled by URL format only.
