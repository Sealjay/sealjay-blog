import { type CollectionEntry, getCollection } from 'astro:content'
import { youtubeFeeds } from '../config/personal'
import { extractYouTubeId, getYouTubeSpeakingEntries } from './youtube'

export interface SpeakingEntry {
  id: string
  data: CollectionEntry<'speaking'>['data']
  youtubeId?: string
  tags?: string[]
}

export async function getSpeakingEntries(): Promise<SpeakingEntry[]> {
  const [editorial, discovered] = await Promise.all([
    getCollection('speaking'),
    getYouTubeSpeakingEntries(youtubeFeeds),
  ])
  const byRecording = new Map(discovered.map((entry) => [entry.youtubeId, entry]))
  const covered = new Set<string>()
  const entries: SpeakingEntry[] = editorial.map(({ id, data }) => {
    const youtubeId = extractYouTubeId(data.url) ?? extractYouTubeId(data.videoEmbedUrl) ?? undefined
    if (youtubeId) covered.add(youtubeId)
    const feedEntry = youtubeId ? byRecording.get(youtubeId) : undefined
    const isShort = data.eventType === 'Short' || feedEntry?.eventType === 'Short'
    const isFullPodcastEpisode =
      !isShort &&
      data.event === 'Securing the Realm' &&
      (data.isFullPodcastEpisode ?? feedEntry?.isFullPodcastEpisode) === true
    const eventType = isShort ? 'Short' : isFullPodcastEpisode ? 'Podcast' : data.eventType
    return { id, youtubeId, data: { ...data, eventType, isFullPodcastEpisode } }
  })

  for (const { youtubeId, tags, ...data } of discovered) {
    if (covered.has(youtubeId)) continue
    covered.add(youtubeId)
    entries.push({
      id: `yt-${youtubeId}`,
      data: { ...data, description: data.description.slice(0, 200) || data.title, featured: false },
      youtubeId,
      tags,
    })
  }

  return entries
}
