import rss from '@astrojs/rss'
import { youtubeShorts } from '../../config/personal'
import { getShorts } from '../../lib/youtube'

export async function GET(context) {
  const shorts = await getShorts(youtubeShorts)
  return rss({
    title: 'Sealjay — Shorts',
    description: 'Short-form videos on AI, security, and open source.',
    site: context.site,
    items: shorts.map((short) => ({
      title: short.title,
      pubDate: short.published,
      description: short.description || short.title,
      link: short.youtubeUrl,
    })),
  })
}
