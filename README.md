# sealjay-blog
> Personal blog and portfolio site for [Chris Lloyd-Jones (Sealjay)](https://sealjay.com), deployed to Azure Static Web Apps.

![GitHub issues](https://img.shields.io/github/issues/Sealjay/sealjay-blog)
![GitHub](https://img.shields.io/github/license/Sealjay/sealjay-blog)
![GitHub Repo stars](https://img.shields.io/github/stars/Sealjay/sealjay-blog?style=social)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![Astro](https://img.shields.io/badge/Astro-BC52EE?logo=astro&logoColor=fff)](https://astro.build/)
[![Bun](https://img.shields.io/badge/Bun-000?logo=bun&logoColor=fff)](https://bun.sh/)
[![Biome](https://img.shields.io/badge/Biome-60A5FA?logo=biome&logoColor=fff)](https://biomejs.dev/)
[![Microsoft Azure](https://custom-icon-badges.demolab.com/badge/Microsoft%20Azure-0089D6?logo=msazure&logoColor=white)](https://learn.microsoft.com/en-us/azure/developer/azure-developer-cli/?WT.mc_id=AI-MVP-5004204)

## Overview

The source behind [sealjay.com](https://sealjay.com) - a personal site that brings together long-form blog posts, short-form notes, speaking engagements, and project showcases in one place. The site is built with [Astro](https://astro.build/) and deployed to [Azure Static Web Apps](https://learn.microsoft.com/en-us/azure/static-web-apps/?WT.mc_id=AI-MVP-5004204).

## Tech stack

- **Framework:** [Astro](https://astro.build/) v5 with MDX, React, and Tailwind CSS
- **Package manager:** [Bun](https://bun.sh/) (not npm/yarn)
- **Linting & formatting:** [Biome](https://biomejs.dev/) (not ESLint or Prettier)
- **Language:** TypeScript
- **Deployment:** Azure Static Web Apps

## Features

- **Content collections** - Blog posts, speaking engagements, short-form notes, projects, and acknowledgements, each with typed frontmatter schemas
- **RSS feed** - Available at [`/rss.xml`](https://sealjay.com/rss.xml)
- **Sitemap** - Auto-generated via `@astrojs/sitemap`
- **Search** - Client-side fuzzy search powered by [Fuse.js](https://www.fusejs.io/) over a generated search index
- **Dynamic OG images** - Category-themed Open Graph cards generated with [Satori](https://github.com/vercel/satori) and [resvg](https://github.com/nicbou/resvg-js)
- **Webmentions** - Receives via [webmention.io](https://webmention.io/) and sends on deploy
- **Content sync** - Automated weekly sync of Mastodon toots and [Securing Quest](https://securing.quest/) RSS posts
- **Comments** - [Giscus](https://giscus.app/) powered by GitHub Discussions
- **Embeds** - YouTube, tweets, GitHub Gists, and CodePen

## Getting started

Make sure you have [Bun](https://bun.sh/) installed. All commands run from the `src/` directory:

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
WEBMENTION_IO_TOKEN=xxx bun run sync:webmentions    # Sync webmentions
MASTODON_TOKEN=xxx bun run sync:mastodon             # Sync public Mastodon toots to notes
MASTODON_TOKEN=xxx bun run sync:mastodon -- --dry-run  # Preview without writing
```

## CI/CD

Two GitHub Actions workflows automate deployment and content:

- **`swa-deploy.yml`** - Builds and deploys to Azure Static Web Apps on push/PR to `main` (when `src/**` changes), then sends webmentions
- **`sync-content.yml`** - Runs weekly (Mondays 06:00 UTC) to sync Securing Quest posts, webmentions, and Mastodon toots

## Licensing

### Source code
The source code in this project is licensed under the [MIT Licence](./LICENCE). The site's page structure and design were originally inspired by the [Tailwind UI Spotlight](https://tailwindui.com/templates/spotlight) template (a Next.js personal site). All code has since been completely rewritten in [Astro](https://astro.build/). The original template was purchased under the [Tailwind UI licence](https://tailwindui.com/license), which permits use as an open-source end product.

### Blog content
All content within the blog is copyright &copy; 2018-2026 Chris Lloyd-Jones, under the name Sealjay(R), except where using other people's work with permission.

Content is licenced under the [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/). You are free to share and adapt the content for any purpose, as long as you give appropriate credit, provide a link to the licence, and indicate if changes were made. If you remix, transform, or build upon the material, you must distribute your contributions under the same licence as the original.

## Contact

Feel free to contact me [on Mastodon](https://fosstodon.org/@sealjay). For bugs, please [raise an issue on GitHub](https://github.com/Sealjay/sealjay-blog/issues).

## Contributing

Bug reports and security issues are welcome via [GitHub Issues](https://github.com/Sealjay/sealjay-blog/issues). This repository uses [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat:`, `fix:`, `docs:`).

### Development setup

1. Install [Bun](https://bun.sh/)
2. Clone the repository and run `cd src && bun install`
3. Start the dev server with `bun run dev`

### Before submitting a PR

- Run `bun run lint:fix` and `bun run format` to ensure code passes [Biome](https://biomejs.dev/) checks (2-space indent, 120-char line width, single quotes, no semicolons)
- **Never rename blog post files or change their URL slugs** - existing URLs are important for search indexing and inbound links
