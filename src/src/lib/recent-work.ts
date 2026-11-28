import { getCollection } from 'astro:content'
import { getSpeakingEntries } from './speaking'
import { extractYouTubeId } from './youtube'

interface WorkItem {
  format: 'Podcast' | 'Writing' | 'Speaking'
  title: string
  date: Date
  url: string
}

interface Candidate extends WorkItem {
  id: string
  aliases: (string | undefined)[]
  youtubeId?: string
}

function identity(url: string) {
  const parsed = new URL(url, 'https://sealjay.com')
  const youtubeId = extractYouTubeId(parsed.href)
  if (youtubeId) return `youtube:${youtubeId}`
  for (const key of [...parsed.searchParams.keys()]) {
    if (/^(utm_|wt\.mc_id$)/i.test(key)) parsed.searchParams.delete(key)
  }
  parsed.searchParams.sort()
  return `${parsed.hostname}${parsed.pathname.replace(/\/$/, '')}${parsed.search}${parsed.hash}`
}

export async function getRecentWork(): Promise<WorkItem[]> {
  const [writing, speaking] = await Promise.all([getCollection('blog'), getSpeakingEntries()])
  const podcastItems: Candidate[] = []
  const speakingItems: Candidate[] = []

  for (const { id, data, youtubeId, actions } of speaking) {
    const { title, date, eventType, isFullPodcastEpisode, delivered, blogPostSlug } = data
    const aliases = [blogPostSlug ? `/blog/${blogPostSlug}/` : undefined]
    const item = { id: `speaking:${id}`, title, date, url: actions[0].url, aliases, youtubeId }
    if (eventType === 'Podcast' && isFullPodcastEpisode && data.event === 'Securing the Realm') {
      podcastItems.push({ ...item, format: 'Podcast' })
    }
    if ((eventType === 'Conference' || eventType === 'Workshop') && delivered !== false) {
      speakingItems.push({ ...item, format: 'Speaking' })
    }
  }

  const writingItems: Candidate[] = writing.map(({ id, data }) => ({
    id: `blog:${id}`,
    format: 'Writing',
    title: data.title,
    date: data.pubDateTime,
    url: `/blog/${id}/`,
    aliases: [data.sourceUrl],
  }))

  const now = Date.now()
  const selected: WorkItem[] = []
  const seen = new Set<string>()
  for (const slot of [podcastItems, writingItems, speakingItems]) {
    slot.sort((a, b) => b.date.valueOf() - a.date.valueOf() || a.id.localeCompare(b.id))
    for (const { id, aliases, youtubeId, ...item } of slot) {
      if (!(item.date.valueOf() <= now)) continue
      const keys = [id, identity(item.url)]
      if (youtubeId) keys.push(`youtube:${youtubeId}`)
      for (const alias of aliases) {
        if (alias) keys.push(identity(alias))
      }
      if (keys.some((key) => seen.has(key))) continue
      for (const key of keys) seen.add(key)
      selected.push(item)
      break
    }
  }
  return selected
}
