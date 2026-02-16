# IndieWeb Level 2+3: Webmentions and Reply Contexts

**Date:** 2026-02-16
**Status:** Approved
**Goal:** Bring sealjay.com to IndieWeb Level 2 (microformats + sending webmentions) and Level 3 (receiving webmentions + reply contexts), with Bridgy backfeed and Bridgy Fed ActivityPub discovery. Social interaction via fosstodon.org.

## Current State

- **Level 1 (Identity):** Complete. `rel="me"` links to GitHub, Bluesky, Mastodon, X, LinkedIn in `BaseHead.astro` and `IndexSocialLinks.astro`.
- **Level 2 (Microformats):** Partially complete. Homepage has `h-card` markup. Blog posts and notes lack `h-entry` markup.
- **Level 3 (Federation):** Not started.

## Architecture Decisions

- **Receiver:** webmention.io (hosted service by Aaron Parecki, webmention spec author)
- **Sending:** Post-build script in CI/CD pipeline, scans built HTML for outgoing links
- **Display:** Build-time fetch from webmention.io API, baked into static HTML
- **Reply contexts:** Optional `inReplyTo` frontmatter field on blog and note content types
- **Bridgy backfeed:** Mastodon replies, boosts, and favourites fed back as webmentions via brid.gy
- **Bridgy Fed:** ActivityPub discovery so posts are searchable in the fediverse

## 1. Microformats2 Markup (h-entry)

Add `h-entry` microformat classes to existing templates. No new files, no schema changes.

### Blog posts (`BaseLayout.astro`)

- Wrap `<article>` with class `h-entry`
- Add `p-name` to title `<h1>`
- Add `e-content` to the content wrapper `<div>`
- Add `dt-published` to the published date element
- Add `u-url` as a hidden link to the canonical URL
- Add `p-author h-card` linking back to the homepage

### Notes (`notes/[...slug].astro`)

- Same treatment per note `<article>` element
- `p-name` or `p-summary` as appropriate (notes may not have titles)
- `e-content` on the note body
- `dt-published` on timestamps

## 2. Receiving Webmentions

### One-time setup (manual)

1. Sign in to webmention.io using domain (uses existing `rel="me"` links)
2. Obtain API token
3. Store as `WEBMENTION_IO_TOKEN` GitHub Actions secret

### Site changes

Add to `BaseHead.astro`:

```html
<link rel="webmention" href="https://webmention.io/sealjay.com/webmention" />
<link rel="pingback" href="https://webmention.io/sealjay.com/xmlrpc" />
```

### Sync script (`src/scripts/sync-webmentions.mjs`)

- Fetches recent webmentions from webmention.io JF2 API
- Saves to `src/src/data/webmentions.json` (keyed by target URL)
- Deduplicates by webmention `wm-id`
- Merges with existing data (append new, don't lose old)

### When it runs

- At deploy time (CI/CD pipeline, before build)
- Weekly via the content sync workflow (alongside securing.quest sync)

### Display component (`Webmentions.astro`)

- Reads `webmentions.json` at build time via Astro's data layer
- Filters by current page's canonical URL
- Renders grouped by type: likes, reposts, replies, mentions
- Placed below post content, alongside Giscus in both blog posts and notes

## 3. Sending Webmentions

### Script (`src/scripts/send-webmentions.mjs`)

- Post-build step: scans `dist/` HTML files for outgoing `<a>` links
- For each link, performs endpoint discovery (checks `<link rel="webmention">` or HTTP `Link` header)
- Only sends to targets that advertise a webmention endpoint
- Tracks sent pairs in `src/src/data/sent-webmentions.json` to skip endpoint discovery on known targets
- Actual sends are idempotent (re-sending same source+target is safe per spec)

### When it runs

- In the CI/CD deploy pipeline, after `bun run build`

## 4. Reply Contexts (in-reply-to)

### Schema changes (`config.ts`)

- Add `inReplyTo: z.string().url().optional()` to both `blog` and `note` collections

### Template changes

- Blog layout: if `inReplyTo` is set, render `<a class="u-in-reply-to" rel="in-reply-to" href="...">` within the `h-entry`
- Note page: same per-note treatment
- Optionally display the target post title/author as a reply context block above the content

### Usage

```yaml
# In a note's frontmatter
inReplyTo: "https://example.com/their-post"
```

The sending script picks up the `in-reply-to` link and sends a webmention, which the target site can display as a comment.

## 5. Bridgy Fed ActivityPub Discovery

Make blog posts and notes searchable in the fediverse (Mastodon, etc.) by advertising an ActivityPub representation via Bridgy Fed.

### Site changes

Add to `BaseHead.astro`, conditionally on pages with a canonical URL (blog posts, notes):

```html
<link rel="alternate" type="application/activity+json"
      href={`https://fed.brid.gy/r/${canonicalURL}`} />
```

This tells fediverse servers that an ActivityPub version of the page exists at Bridgy Fed. When someone pastes the post URL into Mastodon search, it shows up as a federated post.

No scripts, no new files. Just one `<link>` tag addition.

### Bridgy Fed Bluesky verification

Add a `rel="me"` link in `BaseHead.astro` for the Bridgy Fed bridged Bluesky identity:

```html
<link href="https://bsky.brid.gy/ap/did:plc:lamiqq7bkfqygjzdbdz673q3" rel="me" />
```

This enables Mastodon green-check verification on the bridged Bluesky account.

## 6. Bridgy Backfeed

Pull Mastodon interactions (replies, boosts, favourites) back to your site as webmentions.

### One-time setup (manual)

1. Sign up at brid.gy and connect your fosstodon.org Mastodon account
2. Bridgy polls your Mastodon account and sends webmentions to webmention.io automatically

### No code changes needed

Bridgy sends standard webmentions to your webmention.io endpoint. The receiving infrastructure (section 2) handles them like any other webmention. The display component shows Mastodon replies alongside direct IndieWeb mentions.

## Files to Create

| File | Purpose |
|------|---------|
| `src/src/scripts/sync-webmentions.mjs` | Fetch webmentions from webmention.io |
| `src/src/scripts/send-webmentions.mjs` | Send webmentions after build |
| `src/src/data/webmentions.json` | Stored received webmentions |
| `src/src/data/sent-webmentions.json` | Tracking sent webmention pairs |
| `src/src/components/partials/Webmentions.astro` | Display component |

## Files to Modify

| File | Change |
|------|--------|
| `src/src/components/partials/BaseHead.astro` | Add webmention `<link>` tags + Bridgy Fed ActivityPub `<link>` |
| `src/src/layouts/BaseLayout.astro` | Add `h-entry` microformat classes, reply context |
| `src/src/pages/notes/[...slug].astro` | Add `h-entry` microformat classes, reply context |
| `src/src/content/config.ts` | Add `inReplyTo` field to blog and note schemas |
| `.github/workflows/sync-securing-quest.yml` | Rename to `sync-content.yml`, add webmention sync step |
| `src/package.json` | Add `sync:webmentions` and `send:webmentions` scripts |
