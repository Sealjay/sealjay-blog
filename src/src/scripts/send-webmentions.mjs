/**
 * Send webmentions for outgoing links in the built site.
 *
 * Scans dist/ HTML files for outgoing <a> links, discovers webmention
 * endpoints on target sites, and sends webmentions.
 *
 * Usage: bun src/scripts/send-webmentions.mjs
 *
 * Expects the site to be built first (bun run build).
 */

import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DIST_DIR = join(__dirname, '..', '..', 'dist')
const TRACKING_FILE = join(__dirname, '..', 'data', 'sent-webmentions.json')
const SITE_URL = 'https://sealjay.com'

async function findHtmlFiles(dir) {
  const files = []
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await findHtmlFiles(fullPath)))
    } else if (entry.name.endsWith('.html')) {
      files.push(fullPath)
    }
  }
  return files
}

function extractLinks(html) {
  const links = new Set()
  const regex = /<a[^>]+href="([^"]+)"[^>]*>/gi
  for (const match of html.matchAll(regex)) {
    const href = match[1]
    if (href.startsWith('http://') || href.startsWith('https://')) {
      if (!href.startsWith(SITE_URL)) {
        links.add(href)
      }
    }
  }
  return [...links]
}

async function discoverEndpoint(targetUrl) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { Accept: 'text/html' },
    })
    clearTimeout(timeout)

    const linkHeader = res.headers.get('link')
    if (linkHeader) {
      const wmMatch = linkHeader.match(/<([^>]+)>;\s*rel="?webmention"?/)
      if (wmMatch) {
        return new URL(wmMatch[1], targetUrl).href
      }
    }

    const html = await res.text()
    const htmlMatch =
      html.match(/<link[^>]+rel="?webmention"?[^>]+href="([^"]+)"/) ||
      html.match(/<link[^>]+href="([^"]+)"[^>]+rel="?webmention"?/)
    if (htmlMatch) {
      return new URL(htmlMatch[1], targetUrl).href
    }

    return null
  } catch {
    return null
  }
}

async function sendWebmention(endpoint, source, target) {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ source, target }).toString(),
    })
    return { ok: res.ok, status: res.status }
  } catch (err) {
    return { ok: false, status: 0, error: err.message }
  }
}

async function loadTracking() {
  try {
    const content = await readFile(TRACKING_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return {}
  }
}

async function saveTracking(data) {
  await mkdir(join(__dirname, '..', 'data'), { recursive: true })
  await writeFile(TRACKING_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

async function main() {
  console.log('Scanning built site for outgoing links...')

  let htmlFiles
  try {
    htmlFiles = await findHtmlFiles(DIST_DIR)
  } catch {
    console.log('dist/ directory not found. Run bun run build first.')
    process.exit(1)
  }

  console.log(`Found ${htmlFiles.length} HTML files.`)

  const tracking = await loadTracking()
  let sent = 0
  let skipped = 0
  let unchanged = 0
  let noHentry = 0
  let noEndpoint = 0

  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf-8')
    const links = extractLinks(html)
    if (links.length === 0) continue

    // Only send webmentions from pages with h-entry microformats
    if (!html.includes('class="h-entry"')) {
      noHentry += links.length
      continue
    }

    const relPath = relative(DIST_DIR, file)
    const sourceUrl = `${SITE_URL}/${relPath.replace(/index\.html$/, '')}`
    const contentHash = createHash('sha256').update(html).digest('hex').slice(0, 16)

    for (const targetUrl of links) {
      const key = `${sourceUrl} -> ${targetUrl}`
      const entry = tracking[key]

      if (entry === 'no-endpoint') {
        skipped++
        continue
      }

      // Skip if already sent and source page content hasn't changed
      if (entry && typeof entry === 'object' && entry.contentHash === contentHash) {
        unchanged++
        continue
      }

      // Migrate old string format or discover new endpoint
      let endpoint = entry && typeof entry === 'object' ? entry.endpoint : entry
      if (!endpoint) {
        endpoint = await discoverEndpoint(targetUrl)
        if (!endpoint) {
          tracking[key] = 'no-endpoint'
          noEndpoint++
          continue
        }
      }

      const result = await sendWebmention(endpoint, sourceUrl, targetUrl)
      if (result.ok) {
        tracking[key] = { endpoint, contentHash }
        console.log(`  Sent: ${sourceUrl} -> ${targetUrl}`)
        sent++
      } else {
        console.log(`  Failed (${result.status}): ${sourceUrl} -> ${targetUrl}`)
      }
    }
  }

  await saveTracking(tracking)
  console.log(`\nDone. Sent: ${sent}, Skipped (no endpoint): ${skipped}, Unchanged: ${unchanged}, No h-entry: ${noHentry}, No endpoint: ${noEndpoint}`)
}

main().catch((err) => {
  console.error('Send webmentions failed:', err)
  process.exit(1)
})
