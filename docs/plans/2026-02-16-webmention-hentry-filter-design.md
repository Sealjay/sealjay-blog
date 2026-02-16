# Webmention h-entry Filter Design

## Problem

The `send-webmentions.mjs` script sends webmentions from all pages with external links, including index/listing pages (homepage, `/notes/`, `/stream/`) that lack h-entry microformats. This causes 400 errors from targets like Bridgy Fed that require valid h-entry markup on the source page.

## Approach: Smart h-entry Detection (Approach B)

Only send webmentions from pages that contain h-entry microformat markup. Index and listing pages are silently skipped.

## Changes

### `src/src/scripts/send-webmentions.mjs`

1. **h-entry gate** -- after reading each HTML file and extracting links, skip the page if it doesn't contain `class="h-entry"`. Add a `noHentry` counter.
2. **Summary output** -- add "No h-entry" count to the final log line.

### `src/package.json`

1. Change `send:webmentions` script from `node src/scripts/send-webmentions.mjs` to `bun src/scripts/send-webmentions.mjs` (all APIs used are Bun-compatible).

### No changes needed

- GitHub Action (`swa-deploy.yml`) -- already calls `bun run send:webmentions`
- Sync workflow -- unrelated
- Templates/layouts -- h-entry markup already correct on blog posts and notes

## Rationale

- More principled than a Bridgy Fed-specific filter -- index pages shouldn't send webmentions to any target
- Single string check (`html.includes('class="h-entry"')`) -- minimal complexity
- Matches how blog posts and notes are already structured with h-entry class on `<article>`
