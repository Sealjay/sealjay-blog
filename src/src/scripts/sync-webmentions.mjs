/**
 * Sync webmentions from webmention.io.
 *
 * Fetches recent webmentions for sealjay.com and merges them into
 * src/data/webmentions.json, keyed by target URL. Deduplicates by wm-id.
 *
 * Usage: WEBMENTION_IO_TOKEN=xxx node src/scripts/sync-webmentions.mjs
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const DOMAIN = 'sealjay.com'
const API_BASE = 'https://webmention.io/api/mentions.jf2'
const PER_PAGE = 100

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DATA_FILE = join(__dirname, '..', 'data', 'webmentions.json')

async function fetchWebmentions(token, since) {
  const mentions = []
  let page = 0

  while (true) {
    const params = new URLSearchParams({
      domain: DOMAIN,
      token,
      'per-page': String(PER_PAGE),
      page: String(page),
    })
    if (since) {
      params.set('since', since)
    }

    const url = `${API_BASE}?${params}`
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`webmention.io API error: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()
    const children = data.children || []
    mentions.push(...children)

    if (children.length < PER_PAGE) break
    page++
  }

  return mentions
}

function groupByTarget(mentions) {
  const grouped = {}
  for (const mention of mentions) {
    const target = mention['wm-target']
    if (!target) continue
    if (!grouped[target]) grouped[target] = []
    grouped[target].push(mention)
  }
  return grouped
}

async function loadExisting() {
  try {
    const content = await readFile(DATA_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return {}
  }
}

function mergeWebmentions(existing, fresh) {
  const merged = { ...existing }

  for (const [target, mentions] of Object.entries(fresh)) {
    if (!merged[target]) {
      merged[target] = mentions
      continue
    }

    const existingIds = new Set(merged[target].map((m) => m['wm-id']))
    for (const mention of mentions) {
      if (!existingIds.has(mention['wm-id'])) {
        merged[target].push(mention)
      }
    }
  }

  return merged
}

function findLatestTimestamp(data) {
  let latest = null
  for (const mentions of Object.values(data)) {
    for (const m of mentions) {
      const received = m['wm-received']
      if (received && (!latest || received > latest)) {
        latest = received
      }
    }
  }
  return latest
}

async function main() {
  const token = process.env.WEBMENTION_IO_TOKEN
  if (!token) {
    console.log('WEBMENTION_IO_TOKEN not set, skipping webmention sync.')
    return
  }

  const existing = await loadExisting()
  const since = findLatestTimestamp(existing)

  console.log(`Fetching webmentions for ${DOMAIN}...`)
  if (since) {
    console.log(`  Since: ${since}`)
  }

  const mentions = await fetchWebmentions(token, since)
  console.log(`  Fetched ${mentions.length} webmention(s).`)

  if (mentions.length === 0) {
    console.log('No new webmentions.')
    return
  }

  const freshGrouped = groupByTarget(mentions)
  const merged = mergeWebmentions(existing, freshGrouped)

  const totalCount = Object.values(merged).reduce((sum, arr) => sum + arr.length, 0)
  console.log(`  Total webmentions after merge: ${totalCount}`)

  await mkdir(join(__dirname, '..', 'data'), { recursive: true })
  await writeFile(DATA_FILE, JSON.stringify(merged, null, 2), 'utf-8')
  console.log(`  Saved to ${DATA_FILE}`)
}

main().catch((err) => {
  console.error('Webmention sync failed:', err)
  process.exit(1)
})
