import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import react from '@astrojs/react'

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://sealjay.com',
  compressHTML: true,
  integrations: [sitemap(), tailwind(), react(), mdx()]
})