import type { CollectionEntry } from 'astro:content'

type Project = Pick<
  CollectionEntry<'project'>['data'],
  'title' | 'repoUrl' | 'demoUrl' | 'primaryDemoLabel' | 'blogPostSlug' | 'additionalLinks'
>

export function getProjectLinks({ title, repoUrl, demoUrl, primaryDemoLabel, blogPostSlug, additionalLinks }: Project) {
  const links: { url: string; label: string; kind: 'repo' | 'demo' | 'article' | 'reference' }[] = []
  if (repoUrl) links.push({ url: repoUrl, label: `Explore ${title} on GitHub`, kind: 'repo' })
  if (demoUrl) {
    const demo = { url: demoUrl, label: primaryDemoLabel ?? `Visit ${title}`, kind: 'demo' as const }
    if (primaryDemoLabel) links.unshift(demo)
    else links.push(demo)
  }
  if (blogPostSlug)
    links.push({ url: `/blog/${blogPostSlug}/`, label: `Read the article about ${title}`, kind: 'article' })
  for (const link of additionalLinks ?? []) links.push({ ...link, kind: 'reference' })
  return links
}
