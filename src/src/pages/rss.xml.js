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

/** Rewrite root-relative src/href URLs in rendered HTML to absolute URLs. */
function absolutizeRootRelativeUrls(html, site) {
  return html.replace(/(href|src)="\/(?!\/)([^"]*)"/g, (_, attribute, path) => {
    return `${attribute}="${new URL(`/${path}`, site).href}"`
  })
}

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
      content: absolutizeRootRelativeUrls(parser.render(stripMdx(post.body || '')), site),
    })),
  })
}
