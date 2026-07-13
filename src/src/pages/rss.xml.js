import { getCollection } from 'astro:content'
import rss from '@astrojs/rss'
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts'
import { renderFeedHtml } from '../lib/feed-html.js'

export async function GET(context) {
  const posts = await getCollection('blog')
  const site = context.site
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.updatedDate || post.data.pubDateTime,
      description: post.data.description,
      link: `/blog/${post.id}/`,
      content: renderFeedHtml(post.body, site),
    })),
  })
}
