import type { APIRoute } from 'astro'
import { generateHomeOGImage } from '../../lib/og-image'

// Branded home/profile social-share card (instead of a bare headshot).
export const GET: APIRoute = async () => {
  const png = await generateHomeOGImage()
  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
