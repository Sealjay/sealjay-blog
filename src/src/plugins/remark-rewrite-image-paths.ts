import { visit } from 'unist-util-visit'

export default function remarkRewriteImagePaths() {
  return (tree: any) => {
    visit(tree, 'image', (node: any) => {
      if (typeof node.url === 'string' && node.url.startsWith('/images/')) {
        node.url = `../../assets${node.url}`
      }
    })
  }
}
