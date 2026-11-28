# Sealjay blog

[sealjay.com](https://sealjay.com) is a static Astro 7 site deployed to Azure Static Web Apps. The app is in `src/`. Use Node 22.12 or later, Bun and Biome. Tailwind stays on v3 with its Astro integration until the CSS pipeline is migrated.

## Local checks

Run these from `src/`.

```sh
bun install --frozen-lockfile
bun run dev
bun run lint
bun run build
bun run preview
```

Biome handles the JS, TS and JSON files listed in `src/biome.json`. Use two spaces, single quotes and no optional semicolons in JS and TS. Use Conventional Commits. PR checks lint and build. Production deploys to Azure from `main`.

## Content

The schemas are in `src/src/content.config.ts`. The five collections under `src/src/content/` are `blog`, `note`, `speaking`, `project` and `acknowledgement`.

- Use lowercase kebab-case for new blog slugs. Preserve published blog filenames and URLs. Set the title, description and ISO publication timestamp. Omit the optional hero image when none is supplied.
- Copy the author's note text verbatim. Use an explicit timestamp if supplied, otherwise read current UTC time. Use `YYYY-MM-DD-<kebab-slug>` and append a numeric suffix on collision. Match existing lowercase tags. Omit absent optional fields and default highlights to false.
- For a multi-note UTC day, put one single-sentence `daySummary` on the latest note. The UI adds the label. Before adding a note, repair any dates listed in `src/src/data/mastodon-sync-state.json`, then remove each repaired date from the state.
- Tag Microsoft URLs with `WT.mc_id=AI-MVP-5004204`. Reuse the existing link helper where applicable.
- Self-host visitor-facing assets where possible. For changes to a browser-facing third party or the data it receives, update `src/src/pages/privacy.astro` and its amendment dates. Update `src/public/staticwebapp.config.json` when its CSP needs different domains.

Source code is MIT licensed. Blog content is copyright Chris Lloyd-Jones and licensed CC BY-SA 4.0.

## Sync and publication

Run the `sync:str`, `sync:webmentions`, `sync:mastodon` and `sync:youtube` Bun scripts from `src/`. Mastodon and YouTube sync support `--dry-run`. Set the credentials described in `.env.example`.

- Review public replies to others with `bun src/scripts/review-mastodon-replies.mjs --limit=80` from `src/`. Prefix the command with `bun --env-file=../.env` in place of `bun` to load the root environment file. Show the reply and parent context. Import only selected replies, keeping their text and timestamp, the parent URL as `inReplyTo` when available, and the original status URL as `mastodonUrl`.
- Post to Fosstodon only with explicit authorisation. From `src/`, run `bun run post:mastodon "Approved text" [url]` with `MASTODON_TOKEN` set. To load the root environment file explicitly, use `bun --env-file=../.env run post:mastodon "Approved text" [url]`. Record the returned URL as `mastodonUrl` when syndicating a note.
- CI sends outgoing Webmentions after publishing and checking the live source. Use `bun run send:webmentions --dry-run` to inspect candidates offline.
