import { getCollection } from 'astro:content'
import rss from '@astrojs/rss'
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts'

export async function GET(context) {
  const posts = await getCollection('blog')
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.updatedDate || post.data.pubDateTime,
      description: post.data.description,
      link: `/blog/${post.slug}/`,
    })),
  })
}
