/**
 * Sync public toots from Mastodon/Fosstodon into notes.
 *
 * Fetches recent public toots (skipping replies, boosts, image posts,
 * and non-public visibility), deduplicates against existing notes,
 * and creates MDX note files. Sets mastodonUrl on each synced note
 * to prevent re-syndication via the u-syndication microformat.
 *
 * Usage: MASTODON_TOKEN=xxx bun src/scripts/sync-mastodon-toots.mjs [--dry-run] [--limit=N]
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const NOTE_DIR = join(__dirname, '..', 'content', 'note')
const DATA_DIR = join(__dirname, '..', 'data')
const STATE_FILE = join(DATA_DIR, 'mastodon-sync-state.json')

const DEFAULT_LIMIT = 40
const FUZZY_THRESHOLD = 0.8

// --- CLI args ---

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const limitArg = args.find((a) => a.startsWith('--limit='))
const fetchLimit = limitArg ? Number.parseInt(limitArg.split('=')[1], 10) : DEFAULT_LIMIT

// --- State management ---

async function loadState() {
  try {
    const content = await readFile(STATE_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return {}
  }
}

async function saveState(state) {
  await mkdir(DATA_DIR, { recursive: true })
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2), 'utf-8')
}

// --- Mastodon API ---

async function mastodonGet(path) {
  const token = process.env.MASTODON_TOKEN
  const instanceUrl = process.env.MASTODON_URL ?? 'https://fosstodon.org'

  const res = await fetch(`${instanceUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw new Error(`Mastodon API error: ${res.status} ${res.statusText} for ${path}`)
  }
  return res.json()
}

async function fetchToots(sinceId) {
  const account = await mastodonGet('/api/v1/accounts/verify_credentials')
  console.log(`Account: @${account.acct} (ID: ${account.id})`)

  const allStatuses = []
  let maxId

  while (allStatuses.length < fetchLimit) {
    const remaining = fetchLimit - allStatuses.length
    const batchLimit = Math.min(remaining, 40)

    let path = `/api/v1/accounts/${account.id}/statuses?exclude_replies=true&exclude_reblogs=true&limit=${batchLimit}`
    if (sinceId) path += `&since_id=${sinceId}`
    if (maxId) path += `&max_id=${maxId}`

    const batch = await mastodonGet(path)
    if (batch.length === 0) break

    allStatuses.push(...batch)
    maxId = batch[batch.length - 1].id

    if (batch.length < batchLimit) break
  }

  return allStatuses
}

// --- Toot filtering ---

function shouldInclude(toot) {
  if (toot.in_reply_to_id) return 'reply'
  if (toot.reblog) return 'boost'
  if (toot.media_attachments?.length > 0) return 'has-images'
  if (toot.visibility !== 'public') return `visibility:${toot.visibility}`
  return null
}

// --- Text processing ---

function processTootHtml(html) {
  if (!html) return { description: '', tags: [] }

  let text = html

  // Convert mentions: extract @username, strip instance suffix
  text = text.replace(
    /<span class="h-card">.*?<a[^>]*class="[^"]*u-url mention[^"]*"[^>]*>@<span>([^<]+)<\/span><\/a><\/span>/gi,
    (_, username) => `@${username}`,
  )
  // Fallback for simpler mention markup
  text = text.replace(
    /<a[^>]*class="[^"]*mention[^"]*"[^>]*>@<span>([^<]+)<\/span><\/a>/gi,
    (_, username) => `@${username}`,
  )

  // Extract hashtags before stripping HTML
  const tags = []
  const hashtagRegex = /<a[^>]*class="[^"]*hashtag[^"]*"[^>]*>#<span>([^<]+)<\/span><\/a>/gi
  for (const match of text.matchAll(hashtagRegex)) {
    tags.push(
      match[1]
        .toLowerCase()
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase(),
    )
  }

  // Convert hashtag links to plain text
  text = text.replace(hashtagRegex, (_, tag) => `#${tag}`)

  // Convert remaining links to plain text with URL
  text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>[^<]*<span[^>]*>([^<]*)<\/span>[^<]*<\/a>/gi, '$2')
  text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi, '$2')

  // Convert line breaks and paragraphs
  text = text.replace(/<br\s*\/?>/gi, '\n')
  text = text.replace(/<\/p>\s*<p>/gi, '\n\n')
  text = text.replace(/<\/?p[^>]*>/gi, '')

  // Strip remaining HTML
  text = text.replace(/<[^>]+>/g, '')

  // Decode HTML entities
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")
  text = text.replace(/&nbsp;/g, ' ')

  // Clean up whitespace
  text = text.replace(/\n{3,}/g, '\n\n').trim()

  // Strip instance from any remaining @user@instance patterns
  text = text.replace(/@(\w+)@[\w.]+/g, '@$1')

  return { description: text, tags: [...new Set(tags)] }
}

// --- Deduplication ---

function normalizeForComparison(text) {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, '')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function wordSet(text) {
  const normalized = normalizeForComparison(text)
  return new Set(normalized.split(' ').filter((w) => w.length > 2))
}

function fuzzyMatch(tootText, noteDescription) {
  const tootWords = wordSet(tootText)
  const noteWords = wordSet(noteDescription)
  if (tootWords.size === 0) return 0

  let overlap = 0
  for (const word of tootWords) {
    if (noteWords.has(word)) overlap++
  }
  return overlap / tootWords.size
}

async function loadExistingNotes() {
  const notes = []
  let files
  try {
    files = await readdir(NOTE_DIR)
  } catch {
    return notes
  }

  for (const file of files) {
    if (!file.endsWith('.mdx')) continue
    const content = await readFile(join(NOTE_DIR, file), 'utf-8')

    const mastodonUrlMatch = content.match(/mastodonUrl:\s*"([^"]+)"/)
    const descriptionMatch = content.match(/description:\s*"((?:[^"\\]|\\.)*)"/)
    const pubDateMatch = content.match(/pubDateTime:\s*"([^"]+)"/)
    const daySummaryMatch = content.match(/daySummary:\s*"((?:[^"\\]|\\.)*)"/)

    notes.push({
      file,
      mastodonUrl: mastodonUrlMatch?.[1] ?? null,
      description: descriptionMatch?.[1] ?? '',
      pubDate: pubDateMatch?.[1] ?? '',
      day: pubDateMatch?.[1]?.slice(0, 10) ?? '',
      hasDaySummary: !!daySummaryMatch,
      content,
    })
  }
  return notes
}

// --- daySummary management ---

async function removeStaleDaySummaries(existingNotes, affectedDays) {
  const daysNeedingSummary = []

  for (const day of affectedDays) {
    const dayNotes = existingNotes.filter((n) => n.day === day)
    const noteWithSummary = dayNotes.find((n) => n.hasDaySummary)

    if (noteWithSummary) {
      const filePath = join(NOTE_DIR, noteWithSummary.file)
      const updated = noteWithSummary.content.replace(/\ndaySummary:\s*"(?:[^"\\]|\\.)*"\n?/, '\n')
      await writeFile(filePath, updated, 'utf-8')
      console.log(`  Removed stale daySummary from ${noteWithSummary.file}`)
      daysNeedingSummary.push(day)
    }
  }

  return daysNeedingSummary
}

// --- Note generation ---

function escapeYaml(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function generateSlug(description, date) {
  const datePrefix = date.slice(0, 10)
  const words = description
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 4)
    .join('-')

  return `${datePrefix}-mastodon-${words || 'toot'}`
}

function generateMDX(toot, description, tags) {
  const pubDateTime = new Date(toot.created_at).toISOString().replace(/:\d{2}\.\d{3}Z$/, ':00.000Z')

  const lines = ['---', `description: "${escapeYaml(description)}"`, `pubDateTime: "${pubDateTime}"`]

  if (tags.length > 0) {
    lines.push(`tags: [${tags.map((t) => `"${t}"`).join(', ')}]`)
  }

  lines.push(`mastodonUrl: "${toot.url}"`)
  lines.push('---')
  lines.push('')

  return { content: lines.join('\n'), pubDateTime }
}

async function ensureUniqueSlug(slug) {
  const files = await readdir(NOTE_DIR).catch(() => [])
  let candidate = slug
  let suffix = 2

  while (files.includes(`${candidate}.mdx`)) {
    candidate = `${slug}-${suffix}`
    suffix++
  }

  return candidate
}

// --- Main ---

async function main() {
  const token = process.env.MASTODON_TOKEN
  if (!token) {
    console.log('MASTODON_TOKEN not set, skipping Mastodon toot sync.')
    return
  }

  const state = await loadState()
  const sinceId = state.sinceId ?? null

  console.log(`Fetching up to ${fetchLimit} toots...`)
  if (sinceId) console.log(`  Since ID: ${sinceId}`)

  const toots = await fetchToots(sinceId)
  console.log(`Fetched ${toots.length} toot(s).`)

  if (toots.length === 0) {
    console.log('No new toots.')
    return
  }

  const existingNotes = await loadExistingNotes()
  const existingMastodonUrls = new Set(existingNotes.map((n) => n.mastodonUrl).filter(Boolean))

  let created = 0
  let skipped = 0
  const affectedDays = new Set()

  // Process oldest first so since_id advances correctly
  const sorted = [...toots].sort((a, b) => a.id.localeCompare(b.id))

  for (const toot of sorted) {
    const skipReason = shouldInclude(toot)
    if (skipReason) {
      if (dryRun) console.log(`  [SKIP:${skipReason}] ${toot.url}`)
      skipped++
      continue
    }

    // Dedup pass 1: exact mastodonUrl match
    if (existingMastodonUrls.has(toot.url)) {
      if (dryRun) console.log(`  [SKIP:existing-url] ${toot.url}`)
      skipped++
      continue
    }

    const { description, tags } = processTootHtml(toot.content)
    if (!description) {
      if (dryRun) console.log(`  [SKIP:empty] ${toot.url}`)
      skipped++
      continue
    }

    // Dedup pass 2: fuzzy same-day text match
    const tootDay = new Date(toot.created_at).toISOString().slice(0, 10)
    const sameDayNotes = existingNotes.filter((n) => n.day === tootDay)
    const fuzzyHit = sameDayNotes.find((n) => fuzzyMatch(description, n.description) >= FUZZY_THRESHOLD)

    if (fuzzyHit) {
      if (dryRun) {
        const score = fuzzyMatch(description, fuzzyHit.description)
        console.log(`  [SKIP:fuzzy-match=${score.toFixed(2)}] ${toot.url}`)
        console.log(`    Toot:  "${description.slice(0, 80)}..."`)
        console.log(`    Match: "${fuzzyHit.description.slice(0, 80)}..." (${fuzzyHit.file})`)
      }
      skipped++
      continue
    }

    // Generate note
    const slug = generateSlug(description, toot.created_at)
    const uniqueSlug = await ensureUniqueSlug(slug)
    const { content } = generateMDX(toot, description, tags)
    const filename = `${uniqueSlug}.mdx`

    if (dryRun) {
      console.log(`  [CREATE] ${filename}`)
      console.log(`    Text: "${description.slice(0, 120)}${description.length > 120 ? '...' : ''}"`)
      console.log(`    Tags: ${tags.length ? tags.join(', ') : '(none)'}`)
      console.log(`    URL:  ${toot.url}`)
    } else {
      await mkdir(NOTE_DIR, { recursive: true })
      await writeFile(join(NOTE_DIR, filename), content, 'utf-8')
      console.log(`  Created: ${filename}`)
    }

    affectedDays.add(tootDay)
    created++
  }

  // Handle stale daySummaries
  if (!dryRun && affectedDays.size > 0) {
    const daysNeedingSummary = await removeStaleDaySummaries(existingNotes, affectedDays)

    // Update state
    const existingDaysNeeding = state.daysNeedingSummary ?? []
    const allDaysNeeding = [...new Set([...existingDaysNeeding, ...daysNeedingSummary])]

    const newSinceId = sorted[sorted.length - 1]?.id ?? sinceId
    await saveState({
      sinceId: newSinceId,
      lastSync: new Date().toISOString(),
      daysNeedingSummary: allDaysNeeding.length > 0 ? allDaysNeeding : undefined,
    })
  } else if (!dryRun) {
    // Even if nothing created, advance since_id
    const newSinceId = sorted[sorted.length - 1]?.id ?? sinceId
    await saveState({
      ...state,
      sinceId: newSinceId,
      lastSync: new Date().toISOString(),
    })
  }

  console.log(`\nDone. Created ${created} note(s), skipped ${skipped}.`)
  if (dryRun) console.log('(Dry run — no files were written.)')
}

main().catch((err) => {
  console.error('Mastodon sync failed:', err)
  process.exit(1)
})
