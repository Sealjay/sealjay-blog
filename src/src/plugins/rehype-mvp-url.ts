import type { Element, Properties, Root } from 'hast'
import { visit } from 'unist-util-visit'

const MVP_ID = 'AI-MVP-5004204'

function isMicrosoftUrl(hostname: string): boolean {
  return hostname.endsWith('.microsoft.com') || hostname === 'microsoft.com'
}

function processHref(href: string): string {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return href
  }

  if (!isMicrosoftUrl(url.hostname)) {
    return href
  }

  // Strip existing WT.mc_id (case-insensitive)
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

export default function rehypeMvpUrl(): (tree: Root) => void {
  return (tree: Root): void => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'a') return

      const props: Properties | undefined = node.properties
      if (!props?.href || typeof props.href !== 'string') return

      props.href = processHref(props.href)
    })
  }
}
