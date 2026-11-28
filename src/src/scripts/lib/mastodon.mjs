/** Request a Mastodon API path, authenticated via MASTODON_TOKEN. */
export async function mastodonRequest(path, options) {
  const token = process.env.MASTODON_TOKEN
  if (!token) throw new Error('MASTODON_TOKEN is not set. See .env.example.')
  const instanceUrl = process.env.MASTODON_URL ?? 'https://fosstodon.org'

  const res = await fetch(new URL(path, instanceUrl), {
    ...options,
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    throw new Error(`Mastodon API error: ${res.status} ${res.statusText} for ${path}`)
  }
  return res.json()
}

export const mastodonGet = mastodonRequest
