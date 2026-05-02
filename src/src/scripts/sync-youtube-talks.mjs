/**
 * Sync YouTube channel videos and shorts as speaking entry MDX files.
 *
 * Fetches RSS feeds from the configured YouTube channel and shorts
 * playlist, deduplicates against existing speaking entries, and
 * creates MDX files in src/content/speaking/. Each synced file is
 * named yt-{videoId}.mdx to enable deduplication in the speaking
 * page.
 *
 * Usage: bun src/scripts/sync-youtube-talks.mjs [--dry-run]
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const SPEAKING_DIR = join(__dirname, '..', 'content', 'speaking')
const DATA_DIR = join(__dirname, '..', 'data')
const STATE_FILE = join(DATA_DIR, 'youtube-sync-state.json')

// Feed configuration (mirroring src/config/personal.ts)
const FEEDS = [
  {
    channelId: 'UCS4KTDaZTiyiMj2yZztwmlg',
    shortsPlaylistId: 'PLo9Ah7HeyG1Rkqq0cc1QJtttkywXKWd9g',
    event: 'Securing the Realm',
  },
]

// --- CLI args ---

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')

// --- State management ---

async function saveState(state) {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`, 'utf-8')
}

// --- XML parsing ---

/** Decode common XML/HTML entities */
function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
}

/** Parse video entries from YouTube Atom XML */
function parseVideoEntries(xml) {
  const entries = []
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g

  for (const match of xml.matchAll(entryRegex)) {
    const block = match[1]
    const youtubeId = block.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1] ?? ''
    if (!youtubeId) continue

    entries.push({
      youtubeId,
      title: decodeEntities(block.match(/<title>(.*?)<\/title>/)?.[1] ?? ''),
      description: decodeEntities(block.match(/<media:description>([\s\S]*?)<\/media:description>/)?.[1] ?? ''),
      published: block.match(/<published>(.*?)<\/published>/)?.[1] ?? '',
      thumbnailUrl:
        block.match(/<media:thumbnail[^>]+url="([^"]+)"/)?.[1] ?? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
    })
  }

  return entries
}

/** Fetch XML from a YouTube RSS feed URL, returning empty string on failure */
async function fetchFeed(url, label) {
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

// --- Deduplication ---

/** Extract YouTube video ID from a URL */
function extractYouTubeId(url) {
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

/** Load existing YouTube IDs from speaking entries */
async function loadExistingYouTubeIds() {
  const ids = new Set()
  let files
  try {
    files = await readdir(SPEAKING_DIR)
  } catch {
    return ids
  }

  for (const file of files) {
    if (!file.endsWith('.mdx')) continue

    // Quick check for yt- prefixed files
    if (file.startsWith('yt-')) {
      const videoId = file.replace(/^yt-/, '').replace(/\.mdx$/, '')
      ids.add(videoId)
      continue
    }

    // Also check URL in frontmatter of non-yt files
    const content = await readFile(join(SPEAKING_DIR, file), 'utf-8')
    const urlMatch = content.match(/url:\s*"([^"]+)"/)
    if (urlMatch) {
      const id = extractYouTubeId(urlMatch[1])
      if (id) ids.add(id)
    }
  }

  return ids
}

// --- Content generation ---

/** Escape double quotes for YAML frontmatter values */
function escapeYaml(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

/** Truncate description to ~200 chars at a word boundary */
function truncateDescription(text, maxLen = 200) {
  if (!text) return ''
  // Take first line or two
  const firstLines = text
    .split('\n')
    .filter((l) => l.trim())
    .slice(0, 2)
    .join(' ')
  if (firstLines.length <= maxLen) return firstLines
  const truncated = firstLines.slice(0, maxLen)
  const lastSpace = truncated.lastIndexOf(' ')
  return lastSpace > 0 ? `${truncated.slice(0, lastSpace)}...` : `${truncated}...`
}

/** Generate MDX content for a YouTube speaking entry */
function generateMDX(video, { isShort, event }) {
  const date = new Date(video.published).toISOString().slice(0, 10)
  const url = isShort
    ? `https://www.youtube.com/shorts/${video.youtubeId}`
    : `https://www.youtube.com/watch?v=${video.youtubeId}`
  const eventType = isShort ? 'Short' : 'Video'
  const cta = isShort ? 'Watch short' : 'Watch video'
  const description = truncateDescription(video.description) || video.title

  const lines = [
    '---',
    `title: "${escapeYaml(video.title)}"`,
    `eventType: "${eventType}"`,
    `description: "${escapeYaml(description)}"`,
    `event: "${escapeYaml(event)}"`,
    `date: "${date}"`,
    `cta: "${cta}"`,
    `url: "${url}"`,
    `videoEmbedUrl: "https://www.youtube.com/embed/${video.youtubeId}"`,
    '---',
    '',
  ]

  return lines.join('\n')
}

// --- Main ---

async function main() {
  console.log('Syncing YouTube speaking entries...')

  const existingIds = await loadExistingYouTubeIds()
  console.log(`Found ${existingIds.size} existing YouTube speaking entries.`)

  let created = 0
  let skipped = 0

  for (const feed of FEEDS) {
    console.log(`\nFetching feeds for channel ${feed.channelId}...`)

    // Fetch channel feed and shorts playlist in parallel
    const [channelXml, shortsXml] = await Promise.all([
      fetchFeed(`https://www.youtube.com/feeds/videos.xml?channel_id=${feed.channelId}`, `channel ${feed.channelId}`),
      feed.shortsPlaylistId
        ? fetchFeed(
            `https://www.youtube.com/feeds/videos.xml?playlist_id=${feed.shortsPlaylistId}`,
            `shorts playlist ${feed.shortsPlaylistId}`,
          )
        : Promise.resolve(''),
    ])

    if (!channelXml) {
      console.warn('  Failed to fetch channel feed, skipping.')
      continue
    }

    // Build set of short video IDs
    const shortIds = new Set()
    if (shortsXml) {
      for (const entry of parseVideoEntries(shortsXml)) {
        shortIds.add(entry.youtubeId)
      }
      console.log(`  Found ${shortIds.size} short(s) in shorts playlist.`)
    }

    // Parse all channel videos
    const channelVideos = parseVideoEntries(channelXml)
    console.log(`  Found ${channelVideos.length} video(s) in channel feed.`)

    // Also include shorts-only videos not in channel feed
    const channelVideoIds = new Set(channelVideos.map((v) => v.youtubeId))
    const shortsOnlyVideos = shortsXml
      ? parseVideoEntries(shortsXml).filter((v) => !channelVideoIds.has(v.youtubeId))
      : []
    if (shortsOnlyVideos.length > 0) {
      console.log(`  Found ${shortsOnlyVideos.length} additional short(s) not in channel feed.`)
    }

    const allVideos = [...channelVideos, ...shortsOnlyVideos]

    for (const video of allVideos) {
      // Dedup check
      if (existingIds.has(video.youtubeId)) {
        skipped++
        continue
      }

      const isShort = shortIds.has(video.youtubeId)
      const content = generateMDX(video, {
        isShort,
        event: feed.event,
      })
      const filename = `yt-${video.youtubeId}.mdx`

      if (dryRun) {
        const eventType = isShort ? 'Short' : 'Video'
        console.log(`  [CREATE] ${filename} (${eventType}): ${video.title}`)
      } else {
        await mkdir(SPEAKING_DIR, { recursive: true })
        await writeFile(join(SPEAKING_DIR, filename), content, 'utf-8')
        console.log(`  Created: ${filename}`)
      }

      existingIds.add(video.youtubeId)
      created++
    }
  }

  // Save state
  if (!dryRun) {
    await saveState({
      lastSync: new Date().toISOString(),
    })
  }

  console.log(`\nDone. Created ${created} speaking entry/entries, skipped ${skipped}.`)
  if (dryRun) console.log('(Dry run — no files were written.)')
}

main().catch((err) => {
  console.error('YouTube sync failed:', err)
  process.exit(1)
})
