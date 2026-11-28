import assert from 'node:assert/strict'
import { test } from 'node:test'
import { authoredLinks, deliverWebmentions } from './send-webmentions.mjs'

const source = 'https://sealjay.com/notes/2026-01-01/'
const target = 'https://author.example/post?foo=1&bar=2'
const key = `${source} -> ${target}`
const endpoint = 'https://author.example/webmention'
const article = `<nav><a href="https://example.com/nav">Menu</a></nav>
<article class="note-article h-entry">
  <a class="u-in-reply-to" href="https://author.example/parent">Parent</a>
  <a class="note-article__external-link" href="https://author.example/reference">Reference</a>
  <a class="note-article__mastodon" href="https://author.example/mirror">Mirror</a>
  <div class="e-content">
    <a href="https://author.example/post?foo=1&amp;bar=2">Post</a>
    <a href="/about/">About</a>
  </div>
</article>
<article class="h-entry note-card"><div class="e-content"><a href="https://example.com/card">Card</a></div></article>`

test('collects authored links outside navigation, cards and syndication', () => {
  assert.deepEqual(
    [...authoredLinks(article, source)],
    ['https://author.example/parent', 'https://author.example/reference', target],
  )
})

test('checks the live source, sends a historical candidate and skips recorded successes', async () => {
  const tracking = { [key]: 'no-endpoint' }
  const requests = []
  const request = (url, options) => {
    requests.push(url)
    if (url === source) return new Response(article)
    if (url === target) return new Response('', { headers: { Link: '</webmention>; rel="webmention"' } })
    assert.equal(url, endpoint)
    assert.equal(options.method, 'POST')
    assert.equal(String(options.body), new URLSearchParams({ source, target }).toString())
    return new Response('', { status: 202 })
  }

  assert.equal((await deliverWebmentions(source, new Set([target]), tracking, request)).sent, 1)
  assert.deepEqual(tracking[key], { endpoint })
  assert.equal((await deliverWebmentions(source, new Set([target]), tracking, request)).skipped, 1)
  assert.deepEqual(requests, [source, target, endpoint])
})

test('leaves unavailable sources and failed discovery retryable', async () => {
  const tracking = {}
  const targets = new Set([target])
  const missingSource = (url) => {
    assert.equal(url, source)
    return new Response('', { status: 404 })
  }
  assert.equal((await deliverWebmentions(source, targets, tracking, missingSource)).retry, 1)
  const failedDiscovery = (url) => (url === source ? new Response(article) : new Response('', { status: 503 }))
  assert.equal((await deliverWebmentions(source, targets, tracking, failedDiscovery)).retry, 1)
  assert.deepEqual(tracking, {})

  const noEndpoint = (url) => new Response(url === source ? article : '<html></html>')
  assert.equal((await deliverWebmentions(source, targets, tracking, noEndpoint)).noEndpoint, 1)
  assert.deepEqual(tracking[key], { status: 'no-endpoint' })
})
