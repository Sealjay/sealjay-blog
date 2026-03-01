import { getCollection } from 'astro:content'
import { youtubeFeeds } from '../config/personal'
import { extractYouTubeId, getYouTubeSpeakingEntries } from '../lib/youtube'

export async function GET() {
  const blogs = await getCollection('blog')
  const speaking = await getCollection('speaking')
  const notes = await getCollection('note')
  const projects = await getCollection('project')
  const youtubeEntries = await getYouTubeSpeakingEntries(youtubeFeeds)

  // YouTube IDs already covered by MDX speaking entries
  const mdxYouTubeIds = new Set<string>()
  for (const entry of speaking) {
    const id = extractYouTubeId(entry.data.url)
    if (id) mdxYouTubeIds.add(id)
  }

  const staticPages = [
    {
      title: 'About',
      description: 'Chris Lloyd-Jones (Sealjay) — VP, AI Consulting Transformation at Kyndryl. Microsoft MVP, doctoral researcher, open source contributor.',
      tags: ['about', 'bio', 'background'],
      url: '/about/',
      type: 'page' as const,
    },
    {
      title: 'Speaker Kit',
      description: 'Bio, headshot, talk topics, and logistics for event organisers.',
      tags: ['speaker', 'bio', 'headshot', 'booking'],
      url: '/speaking/kit/',
      type: 'page' as const,
    },
    {
      title: 'Privacy Policy',
      description: 'How personal data is handled on sealjay.com, including analytics, comments, and your rights.',
      tags: ['privacy', 'data', 'GDPR'],
      url: '/privacy/',
      type: 'page' as const,
    },
  ]

  const searchIndex = [
    ...staticPages,
    ...blogs.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      tags: post.data.tags ?? [],
      url: `/blog/${post.slug}/`,
      type: 'blog' as const,
    })),
    ...speaking.map((entry) => ({
      title: `${entry.data.title} — ${entry.data.event}`,
      description: entry.data.description,
      tags: [entry.data.eventType, entry.data.event],
      url: entry.data.url,
      type: 'speaking' as const,
    })),
    ...youtubeEntries
      .filter((yt) => !mdxYouTubeIds.has(yt.youtubeId))
      .map((yt) => ({
        title: yt.title,
        description: yt.description.slice(0, 120) || yt.title,
        tags: [yt.eventType],
        url: yt.url,
        type: 'speaking' as const,
      })),
    ...notes.map((entry) => ({
      title: entry.data.description?.slice(0, 80) ?? 'Note',
      description: entry.data.description ?? '',
      tags: entry.data.tags ?? [],
      url: `/notes/${entry.slug}/`,
      type: 'note' as const,
    })),
    ...projects.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      tags: entry.data.techStack ?? [],
      url: entry.data.repoUrl,
      type: 'project' as const,
    })),
  ]

  return new Response(JSON.stringify(searchIndex), {
    headers: { 'Content-Type': 'application/json' },
  })
}
