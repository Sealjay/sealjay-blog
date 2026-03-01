import fs from 'node:fs'
import path from 'node:path'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'
import { legacyRedirectSlugs } from './src/data/legacy-redirects'
import rehypeMvpUrl from './src/plugins/rehype-mvp-url'
import indigoDark from './src/styles/shiki-indigo-dark.json'
import indigoLight from './src/styles/shiki-indigo-light.json'

const siteUrl = 'https://sealjay.com'
const redirectUrls = new Set(legacyRedirectSlugs.map((slug) => `${siteUrl}/${slug}/`))

/** Parse simple YAML frontmatter from an MDX/MD file */
function parseFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}
  const fm = {}
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*['"]?(.+?)['"]?\s*$/)
    if (kv) fm[kv[1]] = kv[2]
  }
  return fm
}

/** Build a map of sitemap URL -> lastmod Date by reading content frontmatter */
function buildLastmodMap() {
  const map = new Map()
  const contentDir = path.resolve('./src/content')

  // Blog posts: use updatedDate falling back to pubDateTime
  const blogDir = path.join(contentDir, 'blog')
  let latestBlogDate = null
  for (const file of fs.readdirSync(blogDir)) {
    if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue
    const fm = parseFrontmatter(path.join(blogDir, file))
    const dateStr = fm.updatedDate || fm.pubDateTime
    if (dateStr) {
      const date = new Date(dateStr)
      const slug = file.replace(/\.(mdx|md)$/, '')
      map.set(`${siteUrl}/blog/${slug}/`, date)
      if (!latestBlogDate || date > latestBlogDate) latestBlogDate = date
    }
  }

  // Notes: group by day, use latest note date per day
  const noteDir = path.join(contentDir, 'note')
  const dayDates = new Map()
  let latestNoteDate = null
  for (const file of fs.readdirSync(noteDir)) {
    if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue
    const fm = parseFrontmatter(path.join(noteDir, file))
    if (fm.pubDateTime) {
      const date = new Date(fm.pubDateTime)
      const dayKey = date.toISOString().split('T')[0]
      const existing = dayDates.get(dayKey)
      if (!existing || date > existing) dayDates.set(dayKey, date)
      if (!latestNoteDate || date > latestNoteDate) latestNoteDate = date
    }
  }
  for (const [day, date] of dayDates) {
    map.set(`${siteUrl}/notes/${day}/`, date)
  }

  // Speaking: use the latest speaking entry date
  const speakingDir = path.join(contentDir, 'speaking')
  let latestSpeakingDate = null
  for (const file of fs.readdirSync(speakingDir)) {
    if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue
    const fm = parseFrontmatter(path.join(speakingDir, file))
    if (fm.date) {
      const date = new Date(fm.date)
      if (!latestSpeakingDate || date > latestSpeakingDate) latestSpeakingDate = date
    }
  }

  // Projects: use the latest project date for the index page
  const projectDir = path.join(contentDir, 'project')
  let latestProjectDate = null
  if (fs.existsSync(projectDir)) {
    for (const file of fs.readdirSync(projectDir)) {
      if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue
      const fm = parseFrontmatter(path.join(projectDir, file))
      if (fm.date) {
        const date = new Date(fm.date)
        if (!latestProjectDate || date > latestProjectDate) latestProjectDate = date
      }
    }
  }

  // Index and static pages: use latest content dates or file mtime
  if (latestBlogDate) {
    map.set(`${siteUrl}/`, latestBlogDate)
    map.set(`${siteUrl}/blog/`, latestBlogDate)
  }
  if (latestNoteDate) map.set(`${siteUrl}/notes/`, latestNoteDate)
  if (latestSpeakingDate) {
    map.set(`${siteUrl}/speaking/`, latestSpeakingDate)
    map.set(`${siteUrl}/speaking/kit/`, latestSpeakingDate)
  }
  if (latestProjectDate) map.set(`${siteUrl}/projects/`, latestProjectDate)

  // Shorts page: use current date as shorts are fetched at build time from YouTube RSS
  map.set(`${siteUrl}/shorts/`, new Date())

  // Static pages: use file modification time
  const staticPages = {
    about: './src/pages/about.astro',
    acknowledgements: './src/pages/acknowledgements.astro',
    privacy: './src/pages/privacy.astro',
  }
  for (const [slug, filePath] of Object.entries(staticPages)) {
    const resolved = path.resolve(filePath)
    if (fs.existsSync(resolved)) {
      map.set(`${siteUrl}/${slug}/`, fs.statSync(resolved).mtime)
    }
  }

  return map
}

/** Build a set of tag page URLs where the tag has only one blog post */
function buildSinglePostTagUrls() {
  const tagCounts = new Map()
  const blogDir = path.resolve('./src/content/blog')
  for (const file of fs.readdirSync(blogDir)) {
    if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue
    const content = fs.readFileSync(path.join(blogDir, file), 'utf-8')
    const match = content.match(/^tags:\s*\[(.+?)\]/m)
    if (match) {
      const tags = match[1].split(',').map((t) => t.trim().replace(/^['"]|['"]$/g, ''))
      for (const tag of tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      }
    }
  }
  const thinTagUrls = new Set()
  for (const [tag, count] of tagCounts) {
    if (count < 2) {
      const slug = tag.toLowerCase().replace(/\s+/g, '-')
      thinTagUrls.add(`${siteUrl}/blog/tag/${slug}/`)
    }
  }
  return thinTagUrls
}

const lastmodMap = buildLastmodMap()
const singlePostTagUrls = buildSinglePostTagUrls()

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  compressHTML: true,
  markdown: {
    shikiConfig: {
      themes: {
        light: indigoLight,
        dark: indigoDark,
      },
      defaultColor: false,
    },
  },
  integrations: [
    sitemap({
      filter: (page) => !redirectUrls.has(page) && !singlePostTagUrls.has(page),
      serialize: (item) => {
        const lastmod = lastmodMap.get(item.url)
        if (lastmod) {
          return { ...item, lastmod: lastmod.toISOString() }
        }
        return item
      },
    }),
    tailwind(),
    mdx({
      rehypePlugins: [rehypeMvpUrl],
    }),
  ],
})
