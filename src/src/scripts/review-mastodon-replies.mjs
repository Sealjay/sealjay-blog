/**
 * Review recent Mastodon replies to others for potential syncing.
 *
 * Fetches recent toots (including replies), filters for replies to other
 * accounts, fetches parent context, and outputs candidates that aren't
 * already synced. Designed to be called by the review-mastodon-replies
 * Claude Code skill.
 *
 * Usage: MASTODON_TOKEN=xxx bun src/scripts/review-mastodon-replies.mjs [--limit=N]
 */

import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const NOTE_DIR = join(__dirname, '..', 'content', 'note')

const DEFAULT_LIMIT = 80

// --- CLI args ---

const args = process.argv.slice(2)
const limitArg = args.find((a) => a.startsWith('--limit='))
const fetchLimit = limitArg ? Number.parseInt(limitArg.split('=')[1], 10) : DEFAULT_LIMIT

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

// --- Text processing ---

function stripHtml(html) {
  if (!html) return ''
  let text = html
  text = text.replace(/<br\s*\/?>/gi, '\n')
  text = text.replace(/<\/p>\s*<p>/gi, '\n\n')
  text = text.replace(/<\/?p[^>]*>/gi, '')
  text = text.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, inner) => {
    const linkText = inner.replace(/<[^>]+>/g, '').trim()
    return linkText === href ? href : `${linkText} (${href})`
  })
  text = text.replace(/<[^>]+>/g, '')
  text = text.replace(/&amp;/g, '&')
  text = text.replace(/&lt;/g, '<')
  text = text.replace(/&gt;/g, '>')
  text = text.replace(/&quot;/g, '"')
  text = text.replace(/&#39;/g, "'")
  text = text.replace(/&nbsp;/g, ' ')
  text = text.replace(/\n{3,}/g, '\n\n').trim()
  return text
}

// --- Existing notes ---

async function loadExistingMastodonUrls() {
  const urls = new Set()
  let files
  try {
    files = await readdir(NOTE_DIR)
  } catch {
    return urls
  }
  for (const file of files) {
    if (!file.endsWith('.mdx')) continue
    const content = await readFile(join(NOTE_DIR, file), 'utf-8')
    const match = content.match(/mastodonUrl:\s*"([^"]+)"/)
    if (match) urls.add(match[1])
  }
  return urls
}

// --- Main ---

async function main() {
  const token = process.env.MASTODON_TOKEN
  if (!token) {
    console.error('MASTODON_TOKEN not set.')
    process.exit(1)
  }

  const account = await mastodonGet('/api/v1/accounts/verify_credentials')
  const ownAccountId = String(account.id)

  // Fetch toots including replies
  const allStatuses = []
  let maxId

  while (allStatuses.length < fetchLimit) {
    const remaining = fetchLimit - allStatuses.length
    const batchLimit = Math.min(remaining, 40)
    let path = `/api/v1/accounts/${account.id}/statuses?exclude_reblogs=true&limit=${batchLimit}`
    if (maxId) path += `&max_id=${maxId}`
    const batch = await mastodonGet(path)
    if (batch.length === 0) break
    allStatuses.push(...batch)
    maxId = batch[batch.length - 1].id
    if (batch.length < batchLimit) break
  }

  // Filter to replies to others only
  const repliesToOthers = allStatuses.filter(
    (t) => t.in_reply_to_id && String(t.in_reply_to_account_id) !== ownAccountId && t.visibility === 'public',
  )

  // Exclude already-synced
  const existingUrls = await loadExistingMastodonUrls()
  const unsynced = repliesToOthers.filter((t) => !existingUrls.has(t.url))

  if (unsynced.length === 0) {
    console.log(JSON.stringify({ candidates: [], message: 'No unsynced replies found.' }))
    return
  }

  // Fetch parent context for each reply
  const candidates = []
  for (const toot of unsynced) {
    let parentText = '(could not fetch parent)'
    let parentAuthor = 'unknown'
    let parentUrl = null
    try {
      const parent = await mastodonGet(`/api/v1/statuses/${toot.in_reply_to_id}`)
      parentText = stripHtml(parent.content)
      parentAuthor = `@${parent.account.acct}`
      parentUrl = parent.url
    } catch {
      // Parent may have been deleted
    }

    const replyText = stripHtml(toot.content)
    const wordCount = replyText.split(/\s+/).length

    candidates.push({
      id: toot.id,
      url: toot.url,
      createdAt: toot.created_at,
      replyText,
      wordCount,
      parentAuthor,
      parentUrl,
      parentText: parentText.length > 300 ? `${parentText.slice(0, 300)}...` : parentText,
      hasLinks: /https?:\/\//.test(replyText),
      tags: [...toot.tags.map((t) => t.name)],
    })
  }

  // Sort by word count descending (most substantive first)
  candidates.sort((a, b) => b.wordCount - a.wordCount)

  console.log(JSON.stringify({ candidates, total: repliesToOthers.length, unsynced: unsynced.length }, null, 2))
}

main().catch((err) => {
  console.error('Review failed:', err)
  process.exit(1)
})
