import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'

import tailwind from '@astrojs/tailwind'

// https://astro.build/config
import react from '@astrojs/react'

// https://astro.build/config
import purgecss from 'astro-purgecss'

// https://astro.build/config
import compress from 'astro-compress'

// https://astro.build/config
export default defineConfig({
  site: 'https://sealjay.com',
  integrations: [
    mdx(),
    sitemap(),
    tailwind(),
    react(),
    purgecss({
      safelist: ['aspect-[9/10]']
    }),
    compress()
  ]
})
