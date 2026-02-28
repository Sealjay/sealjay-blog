import { getCollection } from 'astro:content'

export interface YouTubeShort {
  youtubeId: string
  title: string
  description: string
  published: Date
  thumbnailUrl: string
  youtubeUrl: string
  tags: string[]
  source: string
}

interface PlaylistConfig {
  playlistId: string
  source: string
  defaultTags: string[]
}

/** Module-level cache — feed is fetched once per build */
let cachedShorts: YouTubeShort[] | null = null

/** Extract hashtags from a YouTube description */
function extractHashtags(description: string): string[] {
  const matches = description.match(/#\w+/g)
  if (!matches) return []
  return matches.map((tag) => tag.slice(1))
}

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

/** Fetch and parse a single YouTube playlist RSS feed */
async function fetchPlaylist(config: PlaylistConfig): Promise<YouTubeShort[]> {
  const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${config.playlistId}`

  let xml: string
  try {
    const res = await fetch(feedUrl)
    if (!res.ok) {
      console.warn(`[youtube] Failed to fetch playlist ${config.playlistId}: ${res.status}`)
      return []
    }
    xml = await res.text()
  } catch (err) {
    console.warn(`[youtube] Network error fetching playlist ${config.playlistId}:`, err)
    return []
  }

  const shorts: YouTubeShort[] = []
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g

  for (const match of xml.matchAll(entryRegex)) {
    const block = match[1]

    const youtubeId = block.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] ?? ''
    const title = decodeEntities(block.match(/<title>(.*?)<\/title>/)?.[1] ?? '')
    const published = block.match(/<published>(.*?)<\/published>/)?.[1] ?? ''
    const description = decodeEntities(block.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] ?? '')
    const thumbnailUrl =
      block.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1] ?? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`

    if (!youtubeId) continue

    const hashtags = extractHashtags(description)
    const tags = [...new Set([...config.defaultTags, ...hashtags])]

    shorts.push({
      youtubeId,
      title,
      description,
      published: new Date(published),
      thumbnailUrl,
      youtubeUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      tags,
      source: config.source,
    })
  }

  return shorts
}

/** Get all shorts, merging RSS data with optional content collection overrides */
export async function getShorts(playlists: PlaylistConfig[]): Promise<YouTubeShort[]> {
  if (cachedShorts) return cachedShorts

  const allShorts: YouTubeShort[] = []
  for (const playlist of playlists) {
    const items = await fetchPlaylist(playlist)
    allShorts.push(...items)
  }

  // Merge content collection overrides
  const overrides: Map<string, Record<string, unknown>> = new Map()
  try {
    const shortCollection = await getCollection('short')
    for (const entry of shortCollection) {
      overrides.set(entry.data.youtubeId, entry.data)
    }
  } catch {
    // Collection may not exist yet or be empty — that's fine
  }

  for (const short of allShorts) {
    const override = overrides.get(short.youtubeId)
    if (!override) continue
    if (override.title) short.title = override.title as string
    if (override.tags) short.tags = [...new Set([...short.tags, ...(override.tags as string[])])]
  }

  // Sort newest first
  allShorts.sort((a, b) => b.published.valueOf() - a.published.valueOf())

  cachedShorts = allShorts
  return allShorts
}
