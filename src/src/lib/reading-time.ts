// Single source of truth for reading-time estimates.
// Strips MDX/Markdown noise (frontmatter, import/export lines, JSX/HTML tags,
// fenced + inline code, link/image syntax, markdown punctuation) before counting
// words, so the estimate reflects actual prose rather than markup.

const WORDS_PER_MINUTE = 200

export function readingTime(body: string | undefined | null): number {
  if (!body) return 1

  const prose = body
    .replace(/^---[\s\S]*?---/, ' ') // frontmatter
    .replace(/```[\s\S]*?```/g, ' ') // fenced code (backticks)
    .replace(/~~~[\s\S]*?~~~/g, ' ') // fenced code (tildes)
    .replace(/^\s*(?:import|export)\s.*$/gm, ' ') // ESM lines
    .replace(/<\/?[A-Za-z][^>]*>/g, ' ') // JSX/HTML tags
    .replace(/`[^`]*`/g, ' ') // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> keep visible text
    .replace(/[#>*_~`|=+-]+/g, ' ') // markdown punctuation

  const words = prose.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
