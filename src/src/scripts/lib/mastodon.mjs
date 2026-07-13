/** GET a Mastodon API path, authenticated via MASTODON_TOKEN. */
export async function mastodonGet(path) {
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
