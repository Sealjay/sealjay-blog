# Review Mastodon Replies

Review recent Mastodon replies to others and suggest which ones are worth syncing as notes.

## Instructions

1. **Fetch candidates** — Run from the `src/` directory:
   ```bash
   cd src && MASTODON_TOKEN=$(grep MASTODON_TOKEN ../.env 2>/dev/null | cut -d= -f2-) bun src/scripts/review-mastodon-replies.mjs --limit=80
   ```
   If MASTODON_TOKEN is not available from `.env`, tell the user to set it up (see `.env.example`).

2. **Parse the JSON output** — The script outputs `{ candidates, total, unsynced }` where each candidate has:
   - `url` / `id` — Mastodon URL and toot ID
   - `replyText` — The reply content (plain text)
   - `wordCount` — Word count (proxy for substance)
   - `parentAuthor` — Who was replied to
   - `parentUrl` — URL of the parent toot
   - `parentText` — Content of the parent toot (truncated)
   - `hasLinks` — Whether the reply contains links
   - `tags` — Hashtags used

3. **Triage and recommend** — Present the candidates to the user grouped by recommendation:

   **Likely worth syncing** — replies that meet ANY of:
   - Word count >= 40 (substantive commentary)
   - Contains links to external articles or the user's own content
   - Contains technical analysis, opinion, or insight that stands alone
   - Engages with a topic the user blogs about (AI, sustainability, open source, etc.)

   **Borderline** — replies that are:
   - 20-39 words with some substance
   - Conversational but on-topic

   **Skip** — replies that are:
   - Brief social exchanges ("thank you!", "looks great", "nice work")
   - Under 20 words with no links or substantive content
   - Context-dependent without the parent (e.g. "I agree" or "exactly")

   For each candidate in the first two groups, show:
   - The parent context (who said what)
   - The reply text
   - Why it's recommended (or borderline)
   - How it could work as a standalone note (with minor edits if needed)

4. **User selection** — Ask the user which replies they'd like to sync. For each selected reply:

   a. Create an MDX note file at `src/src/content/note/<slug>.mdx` using the standard note format
   b. Set `inReplyTo` to the parent toot's Mastodon URL
   c. Include the `mastodonUrl` of the reply itself
   d. **Description**: Use the reply text verbatim. If it's too context-dependent, suggest a light edit that makes it standalone (show the edit for approval)
   e. **Tags**: Auto-suggest based on content, always include "mastodon"
   f. **Body**: If the reply has links, include a markdown body with the links formatted

   Slug format: `YYYY-MM-DD-mastodon-<4-word-summary>.mdx`

5. **daySummary handling** — After creating notes, follow the same daySummary logic as the `add-note` skill:
   - If other notes exist for the same day, update/create a daySummary on the last note of the day
   - Check `mastodon-sync-state.json` for `daysNeedingSummary`

## File Template

```mdx
---
description: "<reply text>"
pubDateTime: "<ISO timestamp from toot>"
tags: ["mastodon", ...]
inReplyTo: "<parent toot Mastodon URL>"
mastodonUrl: "<reply toot Mastodon URL>"
---

<optional markdown body with links>
```

## Notes

- Candidates are sorted by word count (most substantive first) to front-load the best options
- The script fetches up to 80 toots by default to cover roughly a week of activity
- Self-replies are NOT shown here — those are handled automatically by the sync script
- The user may want to lightly edit reply text to make it standalone; always show proposed edits for approval
