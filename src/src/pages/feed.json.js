import { getCollection } from 'astro:content'
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts'
import { renderFeedHtml } from '../lib/feed-html.js'

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
      content_html: renderFeedHtml(post.body, site),
      date_published: post.data.pubDateTime?.toISOString(),
      date_modified: (post.data.updatedDate || post.data.pubDateTime)?.toISOString(),
      tags: post.data.tags ?? [],
    })),
  }

  return new Response(JSON.stringify(feed, null, 2), {
    headers: { 'Content-Type': 'application/feed+json' },
  })
}
