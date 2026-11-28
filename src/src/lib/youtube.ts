import type { YouTubeFeedConfig } from '../config/personal'
import { decodeHtmlEntities } from '../scripts/lib/entities.mjs'

export interface YouTubeSpeakingEntry {
  title: string
  description: string
  eventType: 'Short' | 'Video' | 'Podcast'
  isFullPodcastEpisode: boolean
  event: string
  date: Date
  url: string
  cta: string
  youtubeId: string
  tags: string[]
}

function parseVideoEntries(xml: string) {
  const entries = []

  for (const [, block] of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const youtubeId = block.match(/<yt:videoId>([\w-]{11})<\/yt:videoId>/)?.[1]
    const date = new Date(block.match(/<published>(.*?)<\/published>/)?.[1] ?? '')
    const title = decodeHtmlEntities(block.match(/<title>(.*?)<\/title>/)?.[1] ?? '')
    if (!youtubeId || !title || !Number.isFinite(date.valueOf())) continue

    entries.push({
      youtubeId,
      title,
      date,
      description: decodeHtmlEntities(block.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] ?? ''),
    })
  }

  return entries
}

async function readFeed(query: string, strict: boolean) {
  try {
    const response = await fetch(`https://www.youtube.com/feeds/videos.xml?${query}`, {
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const xml = await response.text()
    if (!/<feed[\s>]/.test(xml) || !/<\/feed>\s*$/.test(xml)) throw new Error('Invalid Atom response')
    const [parameter, id] = query.split('=')
    const atomId = parameter === 'channel_id' ? `yt:channel:${id.replace(/^UC/, '')}` : `yt:playlist:${id}`
    if (!xml.split('<entry>', 1)[0].includes(`<id>${atomId}</id>`)) throw new Error('Unexpected feed identity')
    return parseVideoEntries(xml)
  } catch (error) {
    if (strict) throw new Error(`Could not read YouTube feed ${query}`, { cause: error })
    console.warn(`[youtube] Could not read feed ${query}:`, error)
    return null
  }
}

/** Read the channel and both editorial playlists. The channel supplies presentation metadata when available. */
export async function readYouTubeSpeakingFeed(
  feed: YouTubeFeedConfig,
  { strict = false } = {},
): Promise<YouTubeSpeakingEntry[]> {
  const [channel, shorts, podcast] = await Promise.all([
    readFeed(`channel_id=${feed.channelId}`, strict),
    feed.shortsPlaylistId ? readFeed(`playlist_id=${feed.shortsPlaylistId}`, strict) : [],
    feed.podcastPlaylistId ? readFeed(`playlist_id=${feed.podcastPlaylistId}`, strict) : [],
  ])
  const videos = new Map(
    [...(podcast ?? []), ...(shorts ?? []), ...(channel ?? [])].map((video) => [video.youtubeId, video]),
  )
  const shortIds = new Set(shorts?.map((video) => video.youtubeId))
  const episodeIds = new Set(podcast?.map((video) => video.youtubeId))

  return [...videos.values()].map((video) => {
    const isShort = shortIds.has(video.youtubeId)
    const isFullPodcastEpisode = shorts !== null && !isShort && episodeIds.has(video.youtubeId)
    const eventType = isShort ? 'Short' : isFullPodcastEpisode ? 'Podcast' : 'Video'
    const playlistTag = isShort ? 'Shorts' : eventType
    return {
      ...video,
      eventType,
      isFullPodcastEpisode,
      event: feed.event,
      url: isShort
        ? `https://www.youtube.com/shorts/${video.youtubeId}`
        : `https://www.youtube.com/watch?v=${video.youtubeId}`,
      cta: isShort ? 'Watch short' : isFullPodcastEpisode ? 'Watch episode' : 'Watch video',
      tags: [...new Set([...feed.defaultTags, playlistTag, ...(video.description.match(/#\w+/g) ?? [])])],
    }
  })
}

let cached: Promise<YouTubeSpeakingEntry[]> | undefined

export function getYouTubeSpeakingEntries(feeds: YouTubeFeedConfig[]): Promise<YouTubeSpeakingEntry[]> {
  cached ??= Promise.all(feeds.map((feed) => readYouTubeSpeakingFeed(feed))).then((entries) =>
    entries.flat().sort((a, b) => b.date.valueOf() - a.date.valueOf()),
  )
  return cached
}

/** Extract the recording ID from a recognised YouTube URL. */
export function extractYouTubeId(url: string | undefined): string | null {
  if (!url) return null
  try {
    const { hostname, pathname, searchParams } = new URL(url)
    let id: string | undefined | null
    if (hostname === 'youtu.be') id = pathname.split('/')[1]
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'www.youtube-nocookie.com'].includes(hostname)) {
      id = pathname === '/watch' ? searchParams.get('v') : pathname.match(/^\/(?:shorts|embed)\/([\w-]+)/)?.[1]
    }
    return id && /^[\w-]{11}$/.test(id) ? id : null
  } catch {
    return null
  }
}
