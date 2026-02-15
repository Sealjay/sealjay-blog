import { getCollection } from 'astro:content'
import type { APIRoute, GetStaticPaths } from 'astro'
import { generateOGImage } from '../../lib/og-image'

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog')
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: {
      title: post.data.title,
      tags: post.data.tags,
      pubDate: post.data.pubDateTime,
      slug: post.slug,
    },
  }))
}

export const GET: APIRoute = async ({ props }) => {
  const png = await generateOGImage({
    title: props.title,
    tags: props.tags,
    pubDate: props.pubDate,
    slug: props.slug,
  })

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
