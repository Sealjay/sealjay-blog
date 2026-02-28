import { getCollection } from 'astro:content'
import { youtubeShorts } from '../config/personal'
import { getShorts } from '../lib/youtube'

export async function GET() {
  const blogs = await getCollection('blog')
  const speaking = await getCollection('speaking')
  const notes = await getCollection('note')
  const projects = await getCollection('project')
  const shorts = await getShorts(youtubeShorts)

  const searchIndex = [
    ...blogs.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      tags: post.data.tags ?? [],
      url: `/blog/${post.slug}/`,
      type: 'blog' as const,
    })),
    ...speaking.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      tags: [entry.data.eventType],
      url: entry.data.url,
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
    ...shorts.map((short) => ({
      title: short.title,
      description: short.description?.slice(0, 120) ?? '',
      tags: short.tags,
      url: short.youtubeUrl,
      type: 'short' as const,
    })),
  ]

  return new Response(JSON.stringify(searchIndex), {
    headers: { 'Content-Type': 'application/json' },
  })
}
