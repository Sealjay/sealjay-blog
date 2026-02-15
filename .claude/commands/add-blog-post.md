# Add Blog Post

Create a new blog post in the Astro content collection.

## Instructions

Ask the user for the following information (skip any they've already provided):

1. **Title** - The blog post title
2. **Description** - A short summary (1-2 sentences)
3. **Tags** - Comma-separated list of tags (e.g. "AI, Open Source, Sustainability")
4. **Hero Image** - Path to a hero image, or leave blank to use the auto-generated OG image

Then create the MDX file at `src/src/content/blog/<slug>.mdx` where `<slug>` is the title converted to lowercase kebab-case (e.g. "My Great Post" becomes `my-great-post`).

## File Template

```mdx
---
title: "<title>"
description: "<description>"
pubDateTime: "<current ISO date, e.g. 2026-02-15T00:00:00.000Z>"
heroImage: "<hero image path or /placeholder-hero.png>"
tags: [<tags as quoted strings>]
---

<cursor - leave body empty for the user to fill in, or ask if they want to dictate content>
```

## Conventions

- Use the current date for `pubDateTime` in ISO 8601 format
- If no hero image is provided, use `/placeholder-hero.png`
- Tags should be title-cased (e.g. "Open Source", not "open source")
- File name should be lowercase kebab-case
- Do NOT add `readingTime` or `updatedDate` - these are optional and can be added later
- After creating the file, show the user the path and remind them to write the post body
