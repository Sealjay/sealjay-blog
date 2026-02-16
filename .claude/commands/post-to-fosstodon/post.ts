import { createRestAPIClient } from 'masto'

const token = process.env.MASTODON_TOKEN
if (!token) {
  console.error('MASTODON_TOKEN env var is not set. See .env.example for setup instructions.')
  process.exit(1)
}

const instanceUrl = process.env.MASTODON_URL ?? 'https://fosstodon.org'

const message = process.argv[2]
if (!message) {
  console.error('Usage: bun --install=auto .claude/commands/post-to-fosstodon/post.ts "<message>" [url]')
  process.exit(1)
}

const url = process.argv[3]
const alreadyContainsUrl = url && message.includes(url)
const status = url && !alreadyContainsUrl ? `${message}\n\n${url}` : message

if (status.length > 500) {
  console.error(`Status is ${status.length} chars — Mastodon limit is 500. Please shorten it.`)
  process.exit(1)
}

const masto = createRestAPIClient({
  url: instanceUrl,
  accessToken: token,
})

const result = await masto.v1.statuses.create({ status })
console.log(`Posted: ${result.url}`)
