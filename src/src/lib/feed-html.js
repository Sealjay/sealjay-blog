import MarkdownIt from 'markdown-it'

const parser = new MarkdownIt()
const imageImports = import.meta.glob('../assets/images/**', {
  eager: true,
  import: 'default',
  query: '?url&no-inline',
})
const legacyImages = Object.fromEntries(Object.entries(imageImports).map(([path, url]) => [encodeURI(path), url]))

/** Strip MDX-specific syntax (imports, JSX components) from body text. */
function stripMdx(body) {
  return body
    .replace(/^import\s+.*$/gm, '')
    .replace(/<[A-Z]\w+[\s\S]*?\/>/g, '')
    .replace(/<[A-Z]\w+[\s\S]*?>[\s\S]*?<\/[A-Z]\w+>/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** Rewrite root-relative src/href URLs in rendered HTML to absolute URLs. */
function absolutizeRootRelativeUrls(html, site) {
  return html.replace(/(href|src)="\/(?!\/)([^"]*)"/g, (_, attribute, path) => {
    const url = new URL(`/${path}`, site)
    const image = attribute === 'src' && legacyImages[`../assets${url.pathname}`]
    if (image) url.pathname = image
    return `${attribute}="${url.href}"`
  })
}

/** Render a post's raw MDX body to feed-ready absolute-URL HTML. */
export function renderFeedHtml(body, site) {
  return absolutizeRootRelativeUrls(parser.render(stripMdx(body || '')), site)
}
