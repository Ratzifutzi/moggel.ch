import z from 'zod';

const slideSchema = z.object({
	url: z.string().min(1, 'Required'),
	alt: z.string().min(1, 'Required'),
});

export const comicCreateSchema = z.object({
	title: z.string().min(1, 'Required').max(200),
	description: z.string().min(1, 'Required'),
	desoLink: z.string().url('Must be a valid URL'),
	faviconUrl: z
		.string()
		.url('Must be a valid URL')
		.or(z.literal(''))
		.default(''),
	permalink: z
		.string()
		.min(1, 'Required')
		.max(200)
		.regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers and dashes'),
	slide1: slideSchema,
	slide2: slideSchema,
	meta: z.string().default(''),
});

export const comicUpdateSchema = comicCreateSchema.partial();

export type ComicCreateValues = z.infer<typeof comicCreateSchema>;
export type ComicUpdateValues = z.infer<typeof comicUpdateSchema>;
