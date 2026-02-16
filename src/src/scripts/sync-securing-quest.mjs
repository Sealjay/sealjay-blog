/**
 * Sync blog posts from Securing the Realm (securing.quest) via RSS feed.
 *
 * Creates MDX posts in src/content/blog/ for new entries and updates
 * existing stubs with full content when content:encoded is available.
 * Follows the existing "External Media" pattern. Uses a "str-" filename
 * prefix and sourceUrl frontmatter field for deduplication.
 *
 * Usage: node src/scripts/sync-securing-quest.mjs
 */

import { readdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RSS_URL = 'https://securing.quest/blog/rss.xml'
const SITE_BASE = 'https://securing.quest'

/** Titles to skip when syncing */
const EXCLUDED_TITLES = ['Welcome to the Library']

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

    const contentEncoded =
      block.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/)?.[1] ??
      block.match(/<content:encoded>([\s\S]*?)<\/content:encoded>/)?.[1] ??
      ''

    const pubDate = block.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? ''

    const categories = []
    for (const catMatch of block.matchAll(/<category>(.*?)<\/category>/g)) {
      categories.push(catMatch[1])
    }

    if (link) {
      items.push({ title, link, description, pubDate, categories, contentEncoded })
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
  const sources = new Map()
  const files = await readdir(BLOG_DIR)
  for (const file of files) {
    if (!file.startsWith('str-')) continue
    const content = await readFile(join(BLOG_DIR, file), 'utf-8')
    const urlMatch = content.match(/sourceUrl:\s*"([^"]+)"/)
    if (urlMatch) {
      sources.set(urlMatch[1], { file, content })
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

/**
 * Convert HTML content to markdown for inclusion in MDX files.
 * Handles common HTML elements found in RSS content:encoded.
 */
function htmlToMarkdown(html) {
  if (!html) return ''

  let md = html

  // Normalize line endings
  md = md.replace(/\r\n/g, '\n')

  // Convert headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, content) => `# ${stripHtml(content)}\n\n`)
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, content) => `## ${stripHtml(content)}\n\n`)
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, content) => `### ${stripHtml(content)}\n\n`)
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, content) => `#### ${stripHtml(content)}\n\n`)
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_, content) => `##### ${stripHtml(content)}\n\n`)
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_, content) => `###### ${stripHtml(content)}\n\n`)

  // Convert links
  md = md.replace(/<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => `[${stripHtml(text)}](${href})`)

  // Convert emphasis
  md = md.replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, (_, _tag, content) => `**${content}**`)
  md = md.replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, (_, _tag, content) => `*${content}*`)

  // Convert code
  md = md.replace(/<code>([\s\S]*?)<\/code>/gi, (_, content) => `\`${content}\``)
  md = md.replace(
    /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    (_, content) => `\`\`\`\n${stripHtml(content)}\n\`\`\`\n\n`,
  )

  // Convert blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
    const inner = stripHtml(content).trim()
    return (
      inner
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n') + '\n\n'
    )
  })

  // Convert unordered lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
    const items = []
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
    for (const liMatch of content.matchAll(liRegex)) {
      items.push(`- ${liMatch[1].replace(/<[^>]+>/g, '').trim()}`)
    }
    return items.join('\n') + '\n\n'
  })

  // Convert ordered lists
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    const items = []
    let idx = 1
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
    for (const liMatch of content.matchAll(liRegex)) {
      items.push(`${idx}. ${liMatch[1].replace(/<[^>]+>/g, '').trim()}`)
      idx++
    }
    return items.join('\n') + '\n\n'
  })

  // Convert paragraphs
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, content) => `${content.trim()}\n\n`)

  // Convert line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n')

  // Convert horizontal rules
  md = md.replace(/<hr\s*\/?>/gi, '\n---\n\n')

  // Self-close img tags for MDX compatibility
  md = md.replace(/<img([^>]*[^/])>/gi, '<img$1 />')

  // Strip remaining HTML tags
  md = md.replace(/<[^>]+>/g, '')

  // Decode HTML entities
  md = md.replace(/&amp;/g, '&')
  md = md.replace(/&lt;/g, '<')
  md = md.replace(/&gt;/g, '>')
  md = md.replace(/&quot;/g, '"')
  md = md.replace(/&#39;/g, "'")
  md = md.replace(/&nbsp;/g, ' ')

  // Clean up excessive whitespace
  md = md.replace(/\n{3,}/g, '\n\n')
  md = md.trim()

  return md
}

/** Check if an existing post is a stub (no full content). */
function isStub(content) {
  return content.includes('Read the full article at [') || content.includes('<SocialEmbed')
}

/** Generate an MDX file for a securing.quest blog post. */
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

  const markdownContent = htmlToMarkdown(item.contentEncoded)

  let body
  if (markdownContent) {
    body = ['', `*This post was originally published on [Securing the Realm](${fullUrl}).*`, '', markdownContent].join(
      '\n',
    )
  } else {
    body = [
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
  }

  return { slug, content: frontmatter + body }
}

async function main() {
  console.log(`Fetching RSS from ${RSS_URL}...`)
  const items = await fetchRSSItems()
  console.log(`Found ${items.length} items in feed.`)

  // Filter excluded titles
  const filteredItems = items.filter((item) => {
    if (EXCLUDED_TITLES.includes(item.title)) {
      console.log(`  Excluding by title: "${item.title}"`)
      return false
    }
    return true
  })
  console.log(`${filteredItems.length} items after filtering.`)

  const existingSources = await getExistingSources()
  console.log(`Found ${existingSources.size} existing synced posts.`)

  // Remove posts for excluded titles
  for (const [url, { file }] of existingSources) {
    const matchingExcluded = items.find(
      (item) => EXCLUDED_TITLES.includes(item.title) && (item.link === url || `${SITE_BASE}${item.link}` === url),
    )
    if (matchingExcluded) {
      const filepath = join(BLOG_DIR, file)
      await unlink(filepath)
      console.log(`  Deleted excluded post: ${file}`)
    }
  }

  let created = 0
  let updated = 0

  for (const item of filteredItems) {
    const fullUrl = item.link.startsWith('http') ? item.link : `${SITE_BASE}${item.link}`
    const existing = existingSources.get(fullUrl)

    if (existing && item.contentEncoded && isStub(existing.content)) {
      // Update stub with full content
      const { content } = generateMDX(item)
      const filepath = join(BLOG_DIR, existing.file)
      await writeFile(filepath, content, 'utf-8')
      console.log(`  Updated with full content: ${existing.file}`)
      updated++
      continue
    }

    if (existing) {
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

  console.log(`\nDone. Created ${created} new post(s), updated ${updated} post(s).`)
  return created + updated
}

main().catch((err) => {
  console.error('Sync failed:', err)
  process.exit(1)
})
