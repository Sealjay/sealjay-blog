/** Decode common XML/HTML entities. */
export function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

/** Escape backslashes and double quotes for YAML frontmatter values. */
export function escapeYaml(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}
