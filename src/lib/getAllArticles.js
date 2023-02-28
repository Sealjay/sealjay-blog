import glob from 'fast-glob'
import * as path from 'path'

async function importArticle(articleFilename) {
  const { meta, default: component } = await import(
    `../pages/articles/${articleFilename}`
  )

  if (!meta.description) {
    meta.description = 'No description provided'
  }

  return {
    slug: articleFilename.replace(/(\/index)?\.mdx$/, ''),
    ...meta,
    component,
  }
}

export async function getAllArticles() {
  const articleFilenames = await glob(['*.mdx', '*/index.mdx'], {
    cwd: path.join(process.cwd(), 'pages/articles'),
  })

  const articles = await Promise.all(articleFilenames.map(importArticle))

  return articles.sort((a, z) => new Date(z.date) - new Date(a.date))
}
