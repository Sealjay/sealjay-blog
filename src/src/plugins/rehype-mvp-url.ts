import type { Element, Properties, Root } from 'hast'
import { visit } from 'unist-util-visit'
import { tagMvpUrl } from '../lib/mvp-url'

export default function rehypeMvpUrl(): (tree: Root) => void {
  return (tree: Root): void => {
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'a') return

      const props: Properties | undefined = node.properties
      if (!props?.href || typeof props.href !== 'string') return

      props.href = tagMvpUrl(props.href)
    })
  }
}
