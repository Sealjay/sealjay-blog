import { mastodonRequest } from './lib/mastodon.mjs'

const [message, url] = process.argv.slice(2)
if (!message?.trim()) {
  console.error('Usage: bun run post:mastodon "message" [url]')
  process.exit(1)
}

const status = url && !message.includes(url) ? `${message}\n\n${url}` : message

try {
  const result = await mastodonRequest('/api/v1/statuses', {
    method: 'POST',
    body: new URLSearchParams({ status }),
    signal: AbortSignal.timeout(10000),
  })
  if (typeof result.url !== 'string' || !result.url) {
    throw new Error('Mastodon did not return a status URL.')
  }
  console.log(`Posted: ${result.url}`)
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
