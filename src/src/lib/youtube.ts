import type { YouTubeFeedConfig } from '../config/personal'

export interface YouTubeSpeakingEntry {
  title: string
  description: string
  eventType: 'Short' | 'Podcast'
  event: string
  date: Date
  url: string
  cta: string
  youtubeId: string
  thumbnailUrl: string
  tags: string[]
}

/** Module-level cache — feeds are fetched once per build */
let cached: YouTubeSpeakingEntry[] | null = null

/** Decode common XML/HTML entities */
function decodeEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

/** Extract hashtags from a YouTube description */
function extractHashtags(description: string): string[] {
  const matches = description.match(/#\w+/g)
  if (!matches) return []
  return matches.map((tag) => tag.slice(1))
}

/** Parse video entries from YouTube RSS XML */
function parseVideoEntries(xml: string): Array<{
  youtubeId: string
  title: string
  description: string
  published: string
  thumbnailUrl: string
}> {
  const entries: Array<{
    youtubeId: string
    title: string
    description: string
    published: string
    thumbnailUrl: string
  }> = []
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g

  for (const match of xml.matchAll(entryRegex)) {
    const block = match[1]
    const youtubeId = block.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] ?? ''
    if (!youtubeId) continue

    entries.push({
      youtubeId,
      title: decodeEntities(block.match(/<title>(.*?)<\/title>/)?.[1] ?? ''),
      description: decodeEntities(
        block.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] ?? '',
      ),
      published: block.match(/<published>(.*?)<\/published>/)?.[1] ?? '',
      thumbnailUrl:
        block.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1] ??
        `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    })
  }

  return entries
}

/** Fetch XML from a YouTube RSS feed URL, returning empty string on failure */
async function fetchFeed(url: string, label: string): Promise<string> {
  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.warn(`[youtube] Failed to fetch ${label}: ${res.status}`)
      return ''
    }
    return await res.text()
  } catch (err) {
    console.warn(`[youtube] Network error fetching ${label}:`, err)
    return ''
  }
}

/** Fetch all YouTube channel videos and classify as Short or Podcast */
export async function getYouTubeSpeakingEntries(
  feeds: YouTubeFeedConfig[],
): Promise<YouTubeSpeakingEntry[]> {
  if (cached) return cached

  const allEntries: YouTubeSpeakingEntry[] = []

  for (const feed of feeds) {
    // Fetch channel feed and shorts playlist in parallel
    const [channelXml, shortsXml] = await Promise.all([
      fetchFeed(
        `https://www.youtube.com/feeds/videos.xml?channel_id=${feed.channelId}`,
        `channel ${feed.channelId}`,
      ),
      feed.shortsPlaylistId
        ? fetchFeed(
            `https://www.youtube.com/feeds/videos.xml?playlist_id=${feed.shortsPlaylistId}`,
            `shorts playlist ${feed.shortsPlaylistId}`,
          )
        : Promise.resolve(''),
    ])

    if (!channelXml) continue

    // Build set of short video IDs
    const shortIds = new Set<string>()
    if (shortsXml) {
      for (const entry of parseVideoEntries(shortsXml)) {
        shortIds.add(entry.youtubeId)
      }
    }

    // Parse all channel videos and classify
    for (const video of parseVideoEntries(channelXml)) {
      const isShort = shortIds.has(video.youtubeId)
      const hashtags = extractHashtags(video.description)
      const tags = [
        ...new Set([
          ...feed.defaultTags,
          ...(isShort ? ['Shorts'] : ['Podcast']),
          ...hashtags,
        ]),
      ]

      allEntries.push({
        title: video.title,
        description: video.description,
        eventType: isShort ? 'Short' : 'Podcast',
        event: feed.event,
        date: new Date(video.published),
        url: isShort
          ? `https://www.youtube.com/shorts/${video.youtubeId}`
          : `https://www.youtube.com/watch?v=${video.youtubeId}`,
        cta: isShort ? 'Watch short' : 'Watch episode',
        youtubeId: video.youtubeId,
        thumbnailUrl: video.thumbnailUrl,
        tags,
      })
    }
  }

  // Sort newest first
  allEntries.sort((a, b) => b.date.valueOf() - a.date.valueOf())

  cached = allEntries
  return allEntries
}

/** Extract YouTube video ID from a URL (watch, shorts, or youtu.be) */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/shorts\/([A-Za-z0-9_-]+)/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]+)/,
    /youtu\.be\/([A-Za-z0-9_-]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}
