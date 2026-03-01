# sealjay-blog

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![Astro](https://img.shields.io/badge/Astro-BC52EE?logo=astro&logoColor=fff)](https://astro.build/)
[![Bun](https://img.shields.io/badge/Bun-000?logo=bun&logoColor=fff)](https://bun.sh/)
[![Biome](https://img.shields.io/badge/Biome-60A5FA?logo=biome&logoColor=fff)](https://biomejs.dev/)
[![Microsoft Azure](https://custom-icon-badges.demolab.com/badge/Microsoft%20Azure-0089D6?logo=msazure&logoColor=white)](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/?WT.mc_id=AI-MVP-5004204)

The source behind [sealjay.com](https://sealjay.com) — a personal site that brings together long-form blog posts, short-form notes, speaking engagements, and project showcases in one place. Built with [Astro](https://astro.build/) and deployed to [Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/?WT.mc_id=AI-MVP-5004204).

## Tech stack

- **Framework:** [Astro](https://astro.build/) v5 with MDX and Tailwind CSS
- **Package manager:** [Bun](https://bun.sh/) (not npm/yarn)
- **Linting & formatting:** [Biome](https://biomejs.dev/) (not ESLint or Prettier)
- **Language:** TypeScript
- **Deployment:** Azure Static Web Apps

## Getting started

**Prerequisites:** [Bun](https://bun.sh/)

All commands run from the `src/` directory:

```bash
cd src
bun install          # Install dependencies
bun run dev          # Start dev server (http://localhost:4321)
bun run build        # Production build
bun run preview      # Preview production build
```

### Linting and formatting

```bash
bun run lint         # Check for issues
bun run lint:fix     # Auto-fix issues
bun run format       # Format code
```

### Content sync scripts

```bash
bun run sync:str                                    # Sync posts from securing.quest RSS
WEBMENTION_IO_TOKEN=xxx bun run sync:webmentions    # Token from webmention.io/settings
MASTODON_TOKEN=xxx bun run sync:mastodon             # Token from Mastodon app settings
MASTODON_TOKEN=xxx bun run sync:mastodon -- --dry-run  # Preview without writing
```

## Features

- **Content collections** — Blog posts, speaking engagements, short-form notes, projects, and acknowledgements, each with typed frontmatter schemas
- **RSS feed** — Available at [`/rss.xml`](https://sealjay.com/rss.xml)
- **Sitemap** — Auto-generated via `@astrojs/sitemap`
- **Search** — Client-side fuzzy search powered by [Fuse.js](https://www.fusejs.io/) over a generated search index
- **Dynamic OG images** — Category-themed Open Graph cards generated with [Satori](https://github.com/vercel/satori) and [resvg](https://github.com/nicbou/resvg-js)
- **Webmentions** — Receives via [webmention.io](https://webmention.io/) and sends on deploy
- **Content sync** — Automated weekly sync of Mastodon toots and [Securing Quest](https://securing.quest/) RSS posts
- **Comments** — [Giscus](https://giscus.app/) powered by GitHub Discussions
- **Embeds** — YouTube, tweets, GitHub Gists, and CodePen

## CI/CD

Two GitHub Actions workflows handle deployment and content freshness automatically — you do not need to trigger these manually.

- **`swa-deploy.yml`** — Builds and deploys to Azure Static Web Apps on push/PR to `main` (when `src/**` changes), then sends webmentions.
- **`sync-content.yml`** — Runs weekly (Mondays 06:00 UTC) to sync Securing Quest posts, webmentions, and Mastodon toots.

## Licensing

Source code is licensed under the [MIT Licence](./LICENCE).

Blog content is copyright &copy; 2018–2026 Chris Lloyd-Jones, under the name Sealjay(R), a registered trademark. Content is licenced under [CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/).

## Contributing & contact

Bug reports and suggestions are welcome via [GitHub Issues](https://github.com/Sealjay/sealjay-blog/issues). You can also reach me [on Mastodon](https://fosstodon.org/@sealjay).
