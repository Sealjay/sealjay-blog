const MVP_ID = 'AI-MVP-5004204'

function isMicrosoftUrl(hostname: string): boolean {
  return hostname.endsWith('.microsoft.com') || hostname === 'microsoft.com'
}

/**
 * Append the Microsoft MVP tracking parameter (`WT.mc_id`) to `*.microsoft.com`
 * URLs, replacing any existing one. Non-Microsoft URLs and unparseable strings
 * are returned unchanged, so this is safe to apply to any outbound link.
 *
 * Used by the `rehype-mvp-url` plugin for links inside rendered markdown, and by
 * content/config schemas for links that live in frontmatter or static config
 * (which the rehype plugin never sees).
 */
export function tagMvpUrl(href: string): string {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return href
  }

  if (!isMicrosoftUrl(url.hostname)) {
    return href
  }

  // Strip existing WT.mc_id (case-insensitive) before setting the canonical one
  const keysToDelete: string[] = []
  for (const key of url.searchParams.keys()) {
    if (key.toLowerCase() === 'wt.mc_id') {
      keysToDelete.push(key)
    }
  }
  for (const key of keysToDelete) {
    url.searchParams.delete(key)
  }

  url.searchParams.set('WT.mc_id', MVP_ID)

  return url.toString()
}
