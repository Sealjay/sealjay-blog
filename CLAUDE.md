# CLAUDE.md

## Project overview

Personal blog and portfolio site for Chris Lloyd-Jones (Sealjay), hosted at https://sealjay.com. Deployed to Azure Static Web Apps.

## Tech stack

- **Framework:** [Astro](https://astro.build/) v5 with MDX, React, and Tailwind CSS
- **Package manager:** [Bun](https://bun.sh/) (not npm/yarn)
- **Linting & formatting:** [Biome](https://biomejs.dev/) (not ESLint or Prettier)
- **Language:** TypeScript
- **Deployment:** Azure Static Web Apps

## Project structure

The Astro source lives inside `src/`:

```
src/
├── src/
│   ├── components/     # Astro and React components
│   ├── config/         # Site configuration (personal.ts)
│   ├── content/        # Content collections (blog/, speaking/, acknowledgement/)
│   ├── layouts/        # Page layouts (BaseLayout, IndexLayout)
│   ├── pages/          # Route pages (index, about, blog, speaking, etc.)
│   └── styles/         # Global styles
├── public/             # Static assets and images
├── astro.config.mjs    # Astro configuration
├── biome.json          # Biome linter/formatter configuration
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```

## Common commands

All commands run from the `src/` directory:

```bash
cd src
bun install          # Install dependencies
bun run dev          # Start dev server (http://localhost:4321)
bun run build        # Production build
bun run preview      # Preview production build
bun run lint         # Check for lint/format issues (biome check .)
bun run lint:fix     # Auto-fix lint/format issues (biome check --write .)
bun run format       # Format code (biome format --write .)
```

## Sync scripts

Run from the `src/` directory:

```bash
bun src/scripts/sync-securing-quest.mjs          # Sync blog posts from securing.quest RSS
WEBMENTION_IO_TOKEN=xxx bun src/scripts/sync-webmentions.mjs  # Sync webmentions
MASTODON_TOKEN=xxx bun src/scripts/sync-mastodon-toots.mjs     # Sync public Mastodon toots to notes
MASTODON_TOKEN=xxx bun src/scripts/sync-mastodon-toots.mjs --dry-run  # Preview without writing
```

The Mastodon sync script fetches public toots (skipping replies to others, boosts, image posts, and non-public toots), deduplicates against existing notes, and creates MDX files in `src/src/content/note/`. Self-reply threads (replies to own toots) are included and linked via `inReplyTo`. Each synced note has `mastodonUrl` set to prevent re-syndication. State is tracked in `src/data/mastodon-sync-state.json`.

To review replies to others for manual syncing, use the `/review-mastodon-replies` skill or run:
```bash
MASTODON_TOKEN=xxx bun src/scripts/review-mastodon-replies.mjs  # Review reply candidates
```

## Content collections

Content uses Astro's content collections with frontmatter schemas defined in `src/src/content/config.ts`.

### Blog posts (`src/src/content/blog/`)
- MDX files with frontmatter: `title`, `description`, `pubDateTime`, `heroImage?`, `tags?`, `updatedDate?`
- Use `/placeholder-hero.png` for hero images when no custom image is available

### Speaking entries (`src/src/content/speaking/`)
- MDX files with frontmatter: `title`, `eventType`, `description`, `event`, `date`, `cta`, `url`, `thumbnail`, `blogPostSlug?`
- `eventType` must be one of: `Conference`, `Video`, `Media Mention`, `Podcast`, `Workshop`
- `blogPostSlug` optionally links to a related blog post

### Acknowledgements (`src/src/content/acknowledgement/`)
- MDX files listing third-party tools and resources used by the site

## Biome configuration

- Indent: 2 spaces
- Line width: 120
- JS/TS: single quotes, no semicolons (unless required)
- JSON: no trailing commas
- Lints only files matching: `src/**/*.ts`, `src/**/*.js`, `src/**/*.json`, `*.json`, `*.js`, `*.cjs`, `*.mjs`

## Privacy and third-party dependencies

- **Self-host where possible.** Fonts, scripts, and assets should be served from the site itself rather than external CDNs. This avoids sending visitor IP addresses to third parties. Fonts are self-hosted via Fontsource (not Google Fonts CDN).
- **Minimise third-party service dependencies.** Before adding a new external service that runs in visitors' browsers, consider the privacy implications. Prefer services that don't collect personal data (e.g. Plausible over Google Analytics).
- **Update the privacy policy** (`src/src/pages/privacy.astro`) whenever a third-party service is added, removed, or changed. The policy lists each user-facing service and what data flows to it. Also update the `updatedDate` in the page frontmatter and the date in the body text.
- **Update the CSP header** in `src/public/staticwebapp.config.json` when adding or removing external service domains.

## Conventions

- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat:`, `fix:`, `docs:`)
- Source code is MIT licensed
- Blog content is copyright Chris Lloyd-Jones, licensed CC BY-SA 4.0
- **Never rename blog post files or change their URL slugs** - existing URLs are important for search indexing and inbound links
