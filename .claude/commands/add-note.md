# Add Note

Create a new note (microblog entry) in the Astro content collection.

## Instructions

Ask the user for the following information (skip any they've already provided):

1. **Title** (optional) - A short title for the note, or leave blank for untitled
2. **Description** - The note content / quick thought (1-3 sentences)
3. **Tags** (optional) - Comma-separated list of tags
4. **External URL** (optional) - If this note links to an external post (e.g. a LinkedIn article, GitHub repo). Maximum one URL per note.
5. **External Platform** (optional, if URL provided) - One of: LinkedIn, Twitter, GitHub, Mastodon, YouTube, Other
6. **Is Highlight** - Whether this is a highlighted/featured note (default: false)

Then create the MDX file at `src/src/content/note/<slug>.mdx` where `<slug>` is derived from the title (kebab-case) or from the current date if untitled (e.g. `2026-02-15-note`).

## Day Summary (multi-note days)

After creating the note, check if there are other notes for the same day (same `YYYY-MM-DD` in `pubDateTime`) in `src/src/content/note/`.

If there are **2 or more notes** for the same day (including the one just created):

1. Read all notes for that day to understand their content
2. Write a single-sentence `daySummary` that summarises the day's notes overall
3. Add the `daySummary` field to the **most recently created** note's frontmatter (the one just created)
4. If an older note from the same day already has a `daySummary`, remove it from that note (only one note per day should carry the summary)

The `daySummary` should be short, punchy, and capture the flavour of all notes that day. For example: "Thoughts on open source tooling and a new AI paper."

## File Template

```mdx
---
title: "<title or omit if untitled>"
description: "<description>"
pubDateTime: "<current ISO date>"
tags: [<tags as quoted strings, or omit if none>]
externalUrl: "<url or omit if none>"
externalPlatform: "<platform or omit if none>"
isHighlight: <true or false>
daySummary: "<summary or omit if only one note this day>"
---

<optional body content - can be left empty for short notes>
```

## Conventions

- Use the current date for `pubDateTime` in ISO 8601 format
- Omit optional frontmatter fields entirely rather than setting them to empty strings
- If the note is just a quick thought with a description, the body can be left empty
- If there's an external URL, the note serves as a bookmark/highlight of that external content
- Maximum one external URL per note
- `isHighlight` should only be true for particularly important or featured notes
- Tags should be lowercase (e.g. "ai", "open-source")
- For untitled notes, use the date as the slug: `YYYY-MM-DD-note` (add a suffix if multiple notes on the same day, e.g. `2026-02-15-note-2`)
- After creating the file, show the user the path and confirm the note was added
- Notes are shown individually on the notes stream page, grouped under date headers
- Each note card has an anchor ID matching its slug, so you can link to `/notes/#<slug>`
