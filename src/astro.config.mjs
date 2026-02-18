import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import { defineConfig } from 'astro/config'
import { legacyRedirectSlugs } from './src/data/legacy-redirects'

const siteUrl = 'https://sealjay.com'
const redirectUrls = new Set(legacyRedirectSlugs.map((slug) => `${siteUrl}/${slug}/`))

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  compressHTML: true,
  integrations: [
    sitemap({
      filter: (page) => !redirectUrls.has(page),
    }),
    tailwind(),
    mdx(),
  ],
})
