# Plan: Sync Mastodon Toots into Notes

## Overview

Create `src/src/scripts/sync-mastodon-toots.mjs` that fetches recent toots from Fosstodon, filters them, deduplicates against existing notes, and creates MDX note files. Follows the same patterns as `sync-securing-quest.mjs` and `sync-webmentions.mjs`.

## Architecture

```
sync-mastodon-toots.mjs
├── 1. Auth & fetch
│   ├── Read MASTODON_TOKEN (required) and MASTODON_URL (default fosstodon.org)
│   ├── GET /api/v1/accounts/verify_credentials → account ID
│   └── GET /api/v1/accounts/:id/statuses?exclude_replies=true&exclude_reblogs=true&limit=40
│       (pagination via max_id if needed for larger backfills)
│
├── 2. Filter toots (in code, belt-and-suspenders with API params)
│   ├── Skip replies        (in_reply_to_id is set)
│   ├── Skip boosts          (reblog is set)
│   ├── Skip toots with images   (media_attachments.length > 0)
│   └── Skip non-public toots    (visibility !== "public")
│       Only sync public toots — never pull in private, unlisted,
│       or followers-only posts
│
├── 3. Process toot text
│   ├── Strip HTML tags
│   ├── Decode HTML entities (&amp; etc.)
│   ├── Mentions: @user@instance → @user (strip instance suffix)
│   ├── Hashtags: keep in description text as-is (see rationale below)
│   └── Extract hashtags → lowercase tags array for frontmatter
│
├── 4. Deduplicate against existing notes
│   ├── Primary: skip if toot URL matches any note's mastodonUrl
│   └── Secondary: for same-day notes without mastodonUrl, compare
│       normalized text (lowercase, strip URLs/punctuation/whitespace)
│       — skip if ≥80% of the toot's words appear in a note's description
│
├── 5. Create MDX files
│   ├── Filename: YYYY-MM-DD-mastodon-<slug>.mdx
│   ├── Frontmatter:
│   │   description, pubDateTime, tags, mastodonUrl (= toot URL),
│   │   externalPlatform: "Mastodon"
│   │   (NO externalUrl — the toot itself is the source, not an external link)
│   ├── mastodonUrl MUST be set — this is the syndication URL that
│   │   prevents re-syndication via the u-syndication microformat
│   └── Body: empty (matching existing note convention)
│
├── 6. daySummary generation
│   ├── For each day that received new notes, gather ALL notes for that day
│   ├── If 2+ notes exist: generate a concatenated summary from descriptions
│   ├── Remove daySummary from any existing note that carries it
│   ├── Add daySummary to the last note of the day (by pubDateTime)
│   └── Track which file holds the daySummary in state file
│
└── 7. State tracking
    ├── Save last-synced toot ID to src/data/mastodon-sync-state.json
    ├── Record daySummary holder per day (file path)
    └── On next run, use since_id to only fetch newer toots
```

## Decisions

### Mentions: keep as `@username` in description text

- Strip the instance suffix for readability: `@user@fosstodon.org` → `@user`
- Keep in description text — they're part of the conversational voice
- Don't convert to links (note descriptions are plain text in frontmatter)

### Hashtags: keep in description, also extract to tags array

- **Keep in description text**: they're part of the natural toot phrasing (e.g. "working on #GreenAI today"). Stripping them would make text read awkwardly.
- **Also extract to `tags` array**: convert to lowercase, deduplicate (e.g. `#GreenAI` → `"green-ai"`). This enables tag-based filtering on the site.
- If a toot has no hashtags, the `tags` field is omitted (consistent with existing notes).

### daySummary: generate and track

- `daySummary` is currently used in 4 pages (notes index, day detail, stream, homepage) — it IS actively displayed.
- The sync script runs headless (GitHub Actions / CLI) — no LLM available for AI-prefixed summaries.
- **Decision**: After creating notes for a given day, the script generates a simple concatenated summary of all that day's note descriptions (truncated to fit). This is NOT prefixed with "AI summary:" since it's mechanically generated.
- Format: comma-separated first ~10 words of each note's description, e.g. `"Bridgy Fed for Mastodon/Bluesky, going full IndieWeb, dropping X links"`
- The summary is placed on the **last note of the day** (by pubDateTime), matching the add-note convention.
- If an existing note already carries a `daySummary`, it is removed from that note first (only one note per day should have it).
- **State tracking**: `src/data/mastodon-sync-state.json` also records which note file last received the `daySummary` for each day, so subsequent runs know where to find/move it.
- If a day has only 1 note total (including synced), `daySummary` is omitted.

### mastodonUrl: critical for preventing re-syndication

- Every synced note MUST have `mastodonUrl` set to the toot's URL.
- This is rendered as `<a class="u-syndication" rel="syndication">` in `notes/[...slug].astro:81-83`.
- It tells IndieWeb readers and the POSSE workflow "this content already lives on Mastodon — don't re-post it."
- It also serves as the primary deduplication key (exact URL match).

### externalUrl: omit for synced toots

- Toots that are the original content (not bookmarks of external links) should NOT have `externalUrl` set.
- If a toot contains a URL that looks like a bookmark/share, we could extract it to `externalUrl` — but this adds complexity and ambiguity. For v1, skip it. The description will still contain the raw URL text.

### Scope: need `read:statuses` on the Mastodon app

- The existing app at `fosstodon.org/settings/applications` has `write:statuses` scope.
- The sync script needs `read:statuses` (or just `read`) to fetch the account's own statuses.
- `.env.example` should be updated to note this additional scope requirement.

## File changes

### New files
1. **`src/src/scripts/sync-mastodon-toots.mjs`** — the sync script (~150 lines)
2. **`src/data/mastodon-sync-state.json`** — state file (created on first run, gitignored if desired)

### Modified files
3. **`.env.example`** — add note about `read:statuses` scope
4. **`CLAUDE.md`** — document the new script in "Common commands" or add a "Sync scripts" section
5. **`.claude/commands/add-note.md`** — fix stale `mastodonUrl` description: change "not displayed yet but stored for potential future use" → explain it's rendered as a `u-syndication` link and is critical for preventing re-syndication of content that already exists on Mastodon

## Deduplication detail

The script runs two dedup passes:

**Pass 1 — Exact mastodonUrl match:**
Scan all existing notes in `src/src/content/note/`. If any note's `mastodonUrl` matches the toot's URL → skip.

**Pass 2 — Fuzzy same-day text match:**
For toots whose date (YYYY-MM-DD from `created_at`) has existing notes _without_ a `mastodonUrl`:
1. Normalize both texts: lowercase, remove URLs (`https?://\S+`), remove punctuation, collapse whitespace, split into word sets
2. Calculate word overlap: `|intersection| / |toot words|`
3. If ≥ 80% of the toot's words appear in any same-day note description → skip (likely the same content posted via the add-note → Fosstodon workflow, just without `mastodonUrl` being backfilled)

This threshold handles the case where notes were created first and posted to Mastodon, but `mastodonUrl` wasn't captured (e.g. the older notes from Feb 15 that have no mastodonUrl).

## Dry-run mode

The script should support a `--dry-run` flag that:
- Fetches and filters toots
- Runs deduplication
- Prints what it WOULD create, with the text and matching analysis
- Does NOT write any files

This is useful for the initial run to review what toots exist and which ones would be synced vs skipped.

## Usage

```bash
# Dry run — see what would be synced
MASTODON_TOKEN=xxx bun src/scripts/sync-mastodon-toots.mjs --dry-run

# Actual sync
MASTODON_TOKEN=xxx bun src/scripts/sync-mastodon-toots.mjs

# Backfill more toots (default limit is 40)
MASTODON_TOKEN=xxx bun src/scripts/sync-mastodon-toots.mjs --limit=100
```

## Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Toot text diverges too much from note description for fuzzy match | 80% threshold is intentionally loose; dry-run mode lets you verify |
| Script syncs a toot that was already manually noted (edge case) | Duplicate note on same day is low-harm; you'd spot it in review |
| Mastodon API rate limiting | Single paginated fetch, well under rate limits |
| Network failures | Same retry pattern as other sync scripts (simple, no exponential backoff needed for single fetch) |
