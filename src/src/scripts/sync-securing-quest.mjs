/**
 * Sync blog posts from Securing the Realm (securing.quest) via RSS feed.
 *
 * Creates stub MDX posts in src/content/blog/ for new entries,
 * following the existing "External Media" pattern. Uses a "str-" filename
 * prefix and sourceUrl frontmatter field for deduplication.
 *
 * Usage: node src/scripts/sync-securing-quest.mjs
 */

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RSS_URL = 'https://securing.quest/blog/rss.xml'
const SITE_BASE = 'https://securing.quest'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const BLOG_DIR = join(__dirname, '..', 'content', 'blog')

/**
 * Fetch and parse the RSS feed. Uses simple regex parsing to avoid
 * adding an XML parser dependency — RSS 2.0 is predictable enough.
 */
async function fetchRSSItems() {
  const res = await fetch(RSS_URL)
  if (!res.ok) {
    throw new Error(`Failed to fetch RSS: ${res.status} ${res.statusText}`)
  }
  const xml = await res.text()

  const items = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g

  for (const match of xml.matchAll(itemRegex)) {
    const block = match[1]

    const title =
      block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ?? block.match(/<title>(.*?)<\/title>/)?.[1] ?? ''

    const link = block.match(/<link>(.*?)<\/link>/)?.[1] ?? ''

    const description =
      block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ??
      block.match(/<description>(.*?)<\/description>/)?.[1] ??
      ''

    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? ''

    const categories = []
    for (const catMatch of block.matchAll(/<category>(.*?)<\/category>/g)) {
      categories.push(catMatch[1])
    }

    if (link) {
      items.push({ title, link, description, pubDate, categories })
    }
  }

  return items
}

/** Extract a slug from an RSS link like /blog/ai-appsec-is-still-appsec/ */
function slugFromLink(link) {
  const path = link
    .replace(SITE_BASE, '')
    .replace(/^\/blog\//, '')
    .replace(/\/$/, '')
  return path
}

/** Get the set of sourceUrls already present in existing blog posts. */
async function getExistingSources() {
  const sources = new Set()
  const files = await readdir(BLOG_DIR)
  for (const file of files) {
    if (!file.startsWith('str-')) continue
    const content = await readFile(join(BLOG_DIR, file), 'utf-8')
    const urlMatch = content.match(/sourceUrl:\s*"([^"]+)"/)
    if (urlMatch) {
      sources.add(urlMatch[1])
    }
  }
  return sources
}

/** Format a date as ISO datetime string for frontmatter. */
function formatDate(dateStr) {
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return new Date().toISOString()
  return d.toISOString()
}

/** Escape double quotes for YAML frontmatter values. */
function escapeYaml(str) {
  return str.replace(/"/g, '\\"')
}

/** Strip HTML tags from RSS description. */
function stripHtml(str) {
  return str.replace(/<[^>]+>/g, '').trim()
}

/** Generate a stub MDX file for a securing.quest blog post. */
function generateMDX(item) {
  const slug = slugFromLink(item.link)
  const fullUrl = item.link.startsWith('http') ? item.link : `${SITE_BASE}${item.link}`
  const cleanDescription = stripHtml(item.description)
  const tags = ['External Media', 'Securing the Realm', ...item.categories].filter((v, i, a) => a.indexOf(v) === i)

  const frontmatter = [
    '---',
    `title: "${escapeYaml(item.title)}"`,
    `description: "${escapeYaml(cleanDescription)}"`,
    `pubDateTime: "${formatDate(item.pubDate)}"`,
    `sourceUrl: "${fullUrl}"`,
    `tags: [${tags.map((t) => `"${escapeYaml(t)}"`).join(', ')}]`,
    '---',
  ].join('\n')

  const body = [
    '',
    `This post was originally published on [Securing the Realm](${fullUrl}).`,
    '',
    `> ${cleanDescription}`,
    '',
    `Read the full article at [${item.title}](${fullUrl}).`,
    '',
    'import SocialEmbed from "../../components/embeds/SocialEmbed.astro";',
    '',
    '<SocialEmbed',
    `  title="${escapeYaml(item.title)}"`,
    `  linkUrl="${fullUrl}"`,
    '  imageUrl="https://securing.quest/favicon.svg"',
    '>',
    `  ${cleanDescription}`,
    '</SocialEmbed>',
  ].join('\n')

  return { slug, content: frontmatter + body }
}

async function main() {
  console.log(`Fetching RSS from ${RSS_URL}...`)
  const items = await fetchRSSItems()
  console.log(`Found ${items.length} items in feed.`)

  const existingSources = await getExistingSources()
  console.log(`Found ${existingSources.size} existing synced posts.`)

  let created = 0

  for (const item of items) {
    const fullUrl = item.link.startsWith('http') ? item.link : `${SITE_BASE}${item.link}`
    if (existingSources.has(fullUrl)) {
      console.log(`  Skipping (already exists): ${item.title}`)
      continue
    }

    const { slug, content } = generateMDX(item)
    const filename = `str-${slug}.mdx`
    const filepath = join(BLOG_DIR, filename)

    await writeFile(filepath, content, 'utf-8')
    console.log(`  Created: ${filename}`)
    created++
  }

  console.log(`\nDone. Created ${created} new post(s).`)
  return created
}

main().catch((err) => {
  console.error('Sync failed:', err)
  process.exit(1)
})
