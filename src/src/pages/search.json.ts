import { getCollection } from 'astro:content'
import { aboutDescription } from '../config/personal'
import { getProjectLinks } from '../lib/projects'
import { getSpeakingEntries } from '../lib/speaking'

export async function GET() {
  const blogs = await getCollection('blog')
  const speaking = await getSpeakingEntries()
  const notes = await getCollection('note')
  const projects = await getCollection('project')
  const staticPages = [
    {
      title: 'About',
      description: aboutDescription,
      tags: ['about', 'bio', 'background', 'Seattle'],
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
      url: `/blog/${post.id}/`,
      type: 'blog' as const,
    })),
    ...speaking.map((entry) => ({
      title: `${entry.data.title} — ${entry.data.event}`,
      description: entry.data.description,
      tags: [entry.data.eventType, entry.data.event],
      url: entry.actions[0].url,
      type: 'speaking' as const,
    })),
    ...notes.map((entry) => ({
      title: entry.data.description?.slice(0, 80) ?? 'Note',
      description: entry.data.description ?? '',
      tags: entry.data.tags ?? [],
      url: `/notes/${entry.data.pubDateTime.toISOString().slice(0, 10)}/#${entry.id}`,
      type: 'note' as const,
    })),
    ...projects.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      tags: entry.data.techStack ?? [],
      url: getProjectLinks(entry.data)[0]?.url ?? `/projects/#${entry.id}`,
      type: 'project' as const,
    })),
  ]

  return new Response(JSON.stringify(searchIndex), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
