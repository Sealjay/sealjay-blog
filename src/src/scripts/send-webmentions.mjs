/** Send Webmentions for authored links on published blog and note detail pages. */

import { appendFile, readdir, readFile } from 'node:fs/promises'
import { join, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse } from 'parse5'
import { writeJson } from './lib/json-file.mjs'

const scriptDir = fileURLToPath(new URL('.', import.meta.url))
const distDir = join(scriptDir, '..', '..', 'dist')
const trackingFile = join(scriptDir, '..', 'data', 'sent-webmentions.json')
const site = 'https://sealjay.com'
const detailPage = /^(?:blog\/(?!tag\/).+|notes\/\d{4}-\d{2}-\d{2})\/index\.html$/

function attr(node, name) {
  return node.attrs?.find((attribute) => attribute.name === name)?.value ?? ''
}

function httpUrl(value, base) {
  if (!value) return null
  try {
    const url = new URL(value, base)
    return ['http:', 'https:'].includes(url.protocol) ? url : null
  } catch {
    return null
  }
}

export function authoredLinks(html, source) {
  const targets = new Set()
  const origin = new URL(source).origin

  function visit(node, insideEntry = false, insideContent = false) {
    const classes = attr(node, 'class').split(/\s+/)
    const isDetailEntry =
      node.tagName === 'article' &&
      classes.includes('h-entry') &&
      (classes.includes('article-wrapper') || classes.includes('note-article'))
    const inEntry = insideEntry || isDetailEntry
    const inContent = insideContent || (inEntry && classes.includes('e-content'))
    const isExplicitLink = classes.includes('u-in-reply-to') || classes.includes('note-article__external-link')
    const isSyndication =
      classes.includes('u-syndication') ||
      classes.includes('note-article__mastodon') ||
      attr(node, 'rel').split(/\s+/).includes('syndication')

    if (inEntry && node.tagName === 'a' && (inContent || isExplicitLink) && !isSyndication) {
      const target = httpUrl(attr(node, 'href'), source)
      if (target && target.origin !== origin) targets.add(target.href)
    }
    for (const child of node.childNodes ?? []) visit(child, inEntry, inContent)
  }

  visit(parse(html))
  return targets
}

function endpointFromHtml(node, base) {
  if (['link', 'a'].includes(node.tagName) && attr(node, 'rel').split(/\s+/).includes('webmention')) {
    return httpUrl(attr(node, 'href'), base)
  }
  for (const child of node.childNodes ?? []) {
    const endpoint = endpointFromHtml(child, base)
    if (endpoint) return endpoint
  }
  return null
}

async function discoverEndpoint(target, request) {
  const response = await request(target, { headers: { Accept: 'text/html' }, signal: AbortSignal.timeout(10000) })
  if (!response.ok) throw new Error(`Endpoint discovery returned HTTP ${response.status}`)

  const base = response.url || target
  const link = response.headers.get('link') ?? ''
  for (const match of link.matchAll(/<([^>]+)>\s*;\s*rel=(?:"([^"]+)"|([^\s,;]+))/gi)) {
    if ((match[2] ?? match[3]).split(/\s+/).includes('webmention')) {
      const endpoint = httpUrl(match[1], base)
      if (endpoint) return endpoint
    }
  }

  const contentType = response.headers.get('content-type')
  if (contentType && !/html/i.test(contentType)) return null
  return endpointFromHtml(parse(await response.text()), base)
}

function hasResult(tracking, source, target) {
  const record = tracking[`${source} -> ${target}`]
  const legacy = tracking[`${source} -> ${target.replaceAll('&', '&amp;')}`]
  return [record, legacy].some(
    (entry) =>
      entry?.status === 'no-endpoint' ||
      typeof entry?.endpoint === 'string' ||
      (typeof entry === 'string' && entry !== 'no-endpoint'),
  )
}

export async function deliverWebmentions(source, targets, tracking, request = fetch) {
  const pending = [...targets].filter((target) => !hasResult(tracking, source, target))
  const result = { sent: 0, skipped: targets.size - pending.length, noEndpoint: 0, retry: 0 }
  if (pending.length === 0) return result

  let liveLinks
  try {
    const response = await request(source, { redirect: 'manual', signal: AbortSignal.timeout(10000) })
    if (response.ok) liveLinks = authoredLinks(await response.text(), source)
  } catch (error) {
    console.warn(`Could not verify ${source}: ${error.message}`)
  }

  for (const target of pending) {
    if (!liveLinks?.has(target)) {
      result.retry++
      continue
    }
    const key = `${source} -> ${target}`
    try {
      const endpoint = await discoverEndpoint(target, request)
      if (!endpoint) {
        tracking[key] = { status: 'no-endpoint' }
        result.noEndpoint++
        continue
      }
      const response = await request(endpoint.href, {
        method: 'POST',
        body: new URLSearchParams({ source, target }),
        redirect: 'manual',
        signal: AbortSignal.timeout(10000),
      })
      if (!response.ok) throw new Error(`Delivery returned HTTP ${response.status}`)
      tracking[key] = { endpoint: endpoint.href }
      result.sent++
      console.log(`Sent: ${key}`)
    } catch (error) {
      result.retry++
      console.warn(`Will retry ${key}: ${error.message}`)
    }
  }
  return result
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const files = await readdir(distDir, { recursive: true })
  const tracking = JSON.parse(await readFile(trackingFile, 'utf8'))
  const totals = { sent: 0, skipped: 0, noEndpoint: 0, retry: 0 }
  let candidates = 0

  for (const file of files.sort().map((path) => path.split(sep).join('/'))) {
    if (!detailPage.test(file)) continue
    const source = new URL(file.replace(/index\.html$/, ''), site).href
    const targets = authoredLinks(await readFile(join(distDir, file), 'utf8'), source)
    if (dryRun) {
      for (const target of targets) {
        if (hasResult(tracking, source, target)) continue
        console.log(`${source} -> ${target}`)
        candidates++
      }
      continue
    }
    const result = await deliverWebmentions(source, targets, tracking)
    totals.sent += result.sent
    totals.skipped += result.skipped
    totals.noEndpoint += result.noEndpoint
    totals.retry += result.retry
  }

  if (dryRun) {
    console.log(`Pending Webmention candidates: ${candidates}`)
    return
  }
  if (totals.sent || totals.noEndpoint) await writeJson(trackingFile, tracking)
  const summary = `Webmentions: ${totals.sent} sent, ${totals.skipped} tracked, ${totals.noEndpoint} without an endpoint, ${totals.retry} pending retry.`
  console.log(summary)
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`)
}

if (import.meta.main) {
  try {
    await main()
  } catch (error) {
    console.error('Send webmentions failed:', error)
    process.exitCode = 1
  }
}
