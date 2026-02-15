import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDateTime: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    updatedDate: z
      .string()
      .optional()
      .transform((str) => (str ? new Date(str) : undefined)),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
    sourceUrl: z.string().url().optional(),
    featured: z.boolean().default(false),
  }),
})

const speaking = defineCollection({
  schema: z.object({
    title: z.string(),
    eventType: z.enum(['Conference', 'Video', 'Media Mention', 'Podcast', 'Workshop', 'Webinar', 'Panel']),
    description: z.string(),
    event: z.string(),
    date: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    cta: z.string(),
    url: z.string().url(),
    thumbnail: z.string().optional(),
    blogPostSlug: z.string().optional(),
    featured: z.boolean().default(false),
    videoEmbedUrl: z.string().url().optional(),
  }),
})

const note = defineCollection({
  schema: z.object({
    description: z.string().optional(),
    pubDateTime: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    tags: z.array(z.string()).optional(),
    externalUrl: z.string().url().optional(),
    externalPlatform: z.enum(['LinkedIn', 'X', 'GitHub', 'Mastodon', 'YouTube', 'Article', 'Web']).optional(),
    isHighlight: z.boolean().default(false),
    engagementNote: z.string().optional(),
    daySummary: z.string().optional(),
  }),
})

const project = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    repoUrl: z.string().url().optional(),
    demoUrl: z.string().url().optional(),
    heroImage: z.string().optional(),
    techStack: z.array(z.string()),
    status: z.enum(['Active', 'Maintained', 'Archived', 'Contribution']),
    date: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    stars: z.number().optional(),
    blogPostSlug: z.string().optional(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
  }),
})

const acknowledgement = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    notes: z.string(),
    image: z.string(),
    url: z.string().url(),
    licence: z.string(),
    licenceUrl: z.string().url(),
  }),
})

export const collections = { blog, speaking, note, project, acknowledgement }
