import { getCollection } from 'astro:content'
import rss from '@astrojs/rss'
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
      content: parser.render(stripMdx(post.body || '')),
    })),
  })
}
