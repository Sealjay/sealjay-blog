/**
 * Sync YouTube videos, podcast episodes and shorts as speaking entry MDX files.
 *
 * Fetches Atom feeds from the configured YouTube channel and playlists, deduplicates against existing speaking entries, and
 * creates MDX files in src/content/speaking/. Each synced file is
 * named yt-{videoId}.mdx to enable deduplication in the speaking
 * page.
 *
 * Usage: bun src/scripts/sync-youtube-talks.mjs [--dry-run]
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { youtubeFeeds as FEEDS } from '../config/personal.ts'
import { extractYouTubeId, readYouTubeSpeakingFeed } from '../lib/youtube.ts'
import { escapeYaml } from './lib/entities.mjs'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const SPEAKING_DIR = join(__dirname, '..', 'content', 'speaking')

// --- CLI args ---

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')

/** Map each recording to its existing speaking file, including curated entries. */
async function loadExistingYouTubeFiles() {
  const recordings = new Map()
  let files
  try {
    files = await readdir(SPEAKING_DIR)
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
    return recordings
  }

  for (const file of files) {
    if (!file.endsWith('.mdx')) continue
    const isGenerated = /^yt-[\w-]{11}\.mdx$/.test(file)
    if (isGenerated) {
      recordings.set(file.slice(3, -4), file)
      continue
    }

    const content = await readFile(join(SPEAKING_DIR, file), 'utf-8')
    const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ''
    const fields = [...frontmatter.matchAll(/^(?:url|videoEmbedUrl):\s*['"]?([^'"\s]+)['"]?$/gm)]
    const id = fields.map(([, url]) => extractYouTubeId(url)).find(Boolean)
    if (id && !recordings.has(id)) recordings.set(id, file)
  }

  return recordings
}

async function markFullEpisode(file, event) {
  const path = join(SPEAKING_DIR, file)
  const content = await readFile(path, 'utf-8')
  const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1]
  const existingEvent = frontmatter?.match(/^event: *["']?([^"'\r\n]+)["']?$/m)?.[1]?.trim()
  if (
    !frontmatter ||
    existingEvent !== event ||
    /^isFullPodcastEpisode:/m.test(frontmatter) ||
    /^eventType: *["']?Short["']?$/m.test(frontmatter)
  ) {
    return false
  }

  const newline = content.includes('\r\n') ? '\r\n' : '\n'
  if (dryRun) {
    console.log(`  [UPDATE] ${file} (full podcast episode)`)
  } else {
    await writeFile(path, content.replace(/^---\r?\n/, `---${newline}isFullPodcastEpisode: true${newline}`), 'utf-8')
    console.log(`  Updated: ${file} (full podcast episode)`)
  }
  return true
}

// --- Content generation ---

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
function generateMDX(video) {
  const { date, url, eventType, cta, event, isFullPodcastEpisode } = video
  const description = truncateDescription(video.description) || video.title

  const lines = [
    '---',
    `title: "${escapeYaml(video.title)}"`,
    `eventType: "${eventType}"`,
    `description: "${escapeYaml(description)}"`,
    `event: "${escapeYaml(event)}"`,
    `date: "${date.toISOString()}"`,
    ...(isFullPodcastEpisode ? ['isFullPodcastEpisode: true'] : []),
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

  const existing = await loadExistingYouTubeFiles()
  console.log(`Found ${existing.size} existing YouTube speaking entries.`)

  let created = 0
  let updated = 0
  let skipped = 0

  // Get all configured feeds before writing. An unavailable playlist could
  // otherwise lead to persisting a Short or full episode as a regular video.
  const feeds = await Promise.all(FEEDS.map((feed) => readYouTubeSpeakingFeed(feed, { strict: true })))
  for (const video of feeds.flat()) {
    const existingFile = existing.get(video.youtubeId)
    const filename = `yt-${video.youtubeId}.mdx`
    if (existingFile) {
      if (existingFile === filename && video.isFullPodcastEpisode && (await markFullEpisode(filename, video.event))) {
        updated++
      } else {
        skipped++
      }
      continue
    }

    if (dryRun) {
      console.log(`  [CREATE] ${filename} (${video.eventType}): ${video.title}`)
    } else {
      await mkdir(SPEAKING_DIR, { recursive: true })
      await writeFile(join(SPEAKING_DIR, filename), generateMDX(video), 'utf-8')
      console.log(`  Created: ${filename}`)
    }

    existing.set(video.youtubeId, filename)
    created++
  }

  console.log(`\nDone. Created ${created}, updated ${updated}, skipped ${skipped} speaking entries.`)
  if (dryRun) console.log('(Dry run — no files were written.)')
}

main().catch((err) => {
  console.error('YouTube sync failed:', err)
  process.exit(1)
})
