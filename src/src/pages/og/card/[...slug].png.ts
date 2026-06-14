import { getCollection } from 'astro:content'
import type { APIRoute, GetStaticPaths } from 'astro'
import { generateCardArt } from '../../../lib/og-image'

// Title-free card-art used as the blog-index thumbnail (one per post).
export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog')
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { tags: post.data.tags, slug: post.id },
  }))
}

export const GET: APIRoute = async ({ props }) => {
  const png = await generateCardArt({ tags: props.tags, slug: props.slug })
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
