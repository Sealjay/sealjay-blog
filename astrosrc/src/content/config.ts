import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
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
	}),
});


const speaking = defineCollection({
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		eventType: z.enum(["Conference", "Video", "Media Mention", "Podcast", "Workshop"]),
		description: z.string(),
		event: z.string(),
		// Transform string to Date object
		date: z
			.string()
			.or(z.date())
			.transform((val) => new Date(val)),
		cta: z.string(),
		url: z.string().url(),
		thumbnail: z.string()
	}),
});

export const collections = { blog, speaking };
