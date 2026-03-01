# Add Note

Create a new note (microblog entry) in the Astro content collection.

## Instructions

If the user has already provided the note text as an argument, **do not ask any questions** — go ahead and create the note immediately using sensible defaults:

- **Description**: Use the user's exact words verbatim. Do NOT rewrite, embellish, or expand.
- **Tags**: Auto-suggest relevant lowercase tags based on the note content (e.g. "ai", "browser-automation", "mcp"). Look at existing notes in `src/src/content/note/` for commonly used tags to stay consistent.
- **External URL / Platform**: Only include if the user explicitly provides a URL.
- **Is Highlight**: Default to `false` unless the user says otherwise.
- **Time**: Run `date -u '+%Y-%m-%dT%H:%M:00.000Z'` to get the current UTC time. Never guess or assume the time — always check the system clock. Use the result as `pubDateTime` unless the user specifies a different time.

Only ask questions if essential information is genuinely missing or ambiguous (e.g. unclear which URL to use). Prefer acting over asking.

Then create the MDX file at `src/src/content/note/<slug>.mdx` where `<slug>` is derived from the content in kebab-case (e.g. `2026-02-15-browser-automation-research`), or from the current date if the content doesn't suggest a clear slug (e.g. `2026-02-15-note`). Add a numeric suffix if the slug already exists.

## Stale daySummary check (from Mastodon sync)

Before creating the note, check if `src/src/data/mastodon-sync-state.json` exists and has a `daysNeedingSummary` array. For each day listed:

1. Read all notes for that day in `src/src/content/note/`
2. Generate a single-sentence `daySummary` covering all notes that day (do **not** prefix with "AI summary:" — the UI labels it automatically)
3. Add it to the **last note of the day** (by `pubDateTime`)
4. Remove the day from the `daysNeedingSummary` array and save the updated state file

This handles days where the Mastodon sync script added new notes and removed stale summaries.

## Day Summary (multi-note days)

After creating the note, check if there are other notes for the same day (same `YYYY-MM-DD` in `pubDateTime`) in `src/src/content/note/`.

If there are **2 or more notes** for the same day (including the one just created):

1. Read all notes for that day to understand their content
2. Write a single-sentence `daySummary` that summarises the day's notes overall — do **not** prefix with "AI summary:" as the UI adds its own label automatically
3. Add the `daySummary` field to the **most recently created** note's frontmatter (the one just created)
5. If an older note from the same day already has a `daySummary`, remove it from that note (only one note per day should carry the summary)

The `daySummary` is AI-generated (the UI displays an "AI summary" label automatically) and should be a short, single sentence capturing the flavour of all notes that day.

## File Template

```mdx
---
description: "<description>"
pubDateTime: "<YYYY-MM-DDThh:mm:00.000Z>"
tags: [<tags as quoted strings, or omit if none>]
externalUrl: "<url or omit if none>"
externalPlatform: "<platform or omit if none — must be one of: LinkedIn, X, GitHub, Mastodon, YouTube, Article, Web, HuggingFace>"
isHighlight: <true or false>
mastodonUrl: "<fosstodon post URL or omit if not posted>"
daySummary: "<summary or omit if only one note this day>"
---

<optional body content - can be left empty for short notes>
```

## Conventions

- Notes do **not** have titles — they are short-form microblog entries with just a description
- **Always** run `date -u '+%Y-%m-%dT%H:%M:00.000Z'` to obtain the current UTC timestamp for `pubDateTime`. Do not rely on context, training data, or assumptions for the current time — the system clock is the only source of truth. The time is shown on note cards.
- Omit optional frontmatter fields entirely rather than setting them to empty strings
- If the note is just a quick thought with a description, the body can be left empty
- If there's an external URL, the note serves as a bookmark/highlight of that external content
- `externalPlatform` **must** be one of the allowed enum values: `LinkedIn`, `X`, `GitHub`, `Mastodon`, `YouTube`, `Article`, `Web`, `HuggingFace`. Choose the value that best matches the URL's domain. Use `Web` as a fallback for sites that don't match a specific platform.
- Maximum one external URL per note
- `isHighlight` should only be true for particularly important or featured notes
- Tags should be lowercase (e.g. "ai", "open-source"). Auto-suggest tags based on content, keeping consistent with existing tags across notes. Prefer unhyphenated tags where possible (e.g. "opensource" over "open-source") so they map cleanly to Mastodon hashtags, but readability on the site takes priority — hyphens are fine when the unhyphenated form would be confusing.
- Slug format: `YYYY-MM-DD-<descriptive-kebab>` (e.g. `2026-02-15-browser-automation-research`). Fall back to `YYYY-MM-DD-note` if content doesn't suggest a clear slug. Add a numeric suffix if the slug already exists.
- After creating the file, show the user the path and confirm the note was added
- **Fosstodon**: After confirming the note, ask the user if they'd like to post it to Fosstodon. When offering, suggest appending the note's tags as Mastodon hashtags — convert tags to hashtag format by removing hyphens and prefixing with `#` (e.g. tag `"google-fonts"` becomes `#googlefonts`, `"ai"` becomes `#ai`). Present the suggested toot text (description + hashtags) to the user for approval or editing before posting. If yes, run `bun --install=auto .claude/commands/post-to-fosstodon/post.ts "<description>" [externalUrl]` from the project root. The script reads `MASTODON_TOKEN` from `.env`. If the env var isn't set, tell the user to copy `.env.example` to `.env` and add their token. Note: Mastodon has a 500 char limit — if the description + hashtags + URL exceed that, ask the user to shorten it or drop some hashtags before posting. After a successful post, the script outputs `Posted: <url>` — capture that URL and add it to the note's frontmatter as `mastodonUrl`. This field is rendered as a hidden `<a class="u-syndication" rel="syndication">` link in note pages — it tells IndieWeb readers and the POSSE workflow that this content already exists on Mastodon, preventing re-syndication.
- **Hashtag format**: Mastodon does not support hyphens in hashtags. When converting tags to hashtags, remove all hyphens (e.g. `"green-software"` → `#greensoftware`). Tags in the note frontmatter can still use hyphens for readability on the site, but the Mastodon hashtags must be hyphen-free.
- Notes are grouped by day. Each day has one page at `/notes/YYYY-MM-DD/` with all that day's notes and a single Giscus discussion thread
- Each note card has an anchor ID matching its slug, so you can link to `/notes/YYYY-MM-DD/#<slug>`
