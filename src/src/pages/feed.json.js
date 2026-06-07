import { getCollection } from 'astro:content'
import MarkdownIt from 'markdown-it'
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts'

const parser = new MarkdownIt()

/** Strip MDX-specific syntax (imports, JSX components) from body text. */
function stripMdx(body) {
  return body
    .replace(/^import\s+.*$/gm, '')
    .replace(/<[A-Z]\w+[\s\S]*?\/>/g, '')
    .replace(/<[A-Z]\w+[\s\S]*?>[\s\S]*?<\/[A-Z]\w+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Rewrite root-relative src/href URLs in rendered HTML to absolute URLs. */
function absolutizeRootRelativeUrls(html, site) {
  return html.replace(/(href|src)="\/(?!\/)([^"]*)"/g, (_, attribute, path) => {
    return `${attribute}="${new URL(`/${path}`, site).href}"`
  })
}

export async function GET(context) {
  const posts = await getCollection('blog')
  const site = context.site
  const sorted = [...posts].sort(
    (a, b) => new Date(b.data.updatedDate || b.data.pubDateTime) - new Date(a.data.updatedDate || a.data.pubDateTime),
  )

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: SITE_TITLE,
    home_page_url: context.site.href,
    feed_url: new URL('/feed.json', context.site).href,
    description: SITE_DESCRIPTION,
    language: 'en',
    authors: [
      {
        name: 'Chris Lloyd-Jones',
        url: 'https://sealjay.com',
      },
    ],
    items: sorted.map((post) => ({
      id: new URL(`/blog/${post.id}/`, context.site).href,
      url: new URL(`/blog/${post.id}/`, context.site).href,
      title: post.data.title,
      summary: post.data.description,
      content_html: absolutizeRootRelativeUrls(parser.render(stripMdx(post.body || '')), site),
      date_published: post.data.pubDateTime?.toISOString(),
      date_modified: (post.data.updatedDate || post.data.pubDateTime)?.toISOString(),
      tags: post.data.tags ?? [],
    })),
  }

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { 'Content-Type': 'application/feed+json' },
  })
}
