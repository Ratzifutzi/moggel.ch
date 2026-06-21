import z from 'zod';

export const userCreateSchema = z.object({
	username: z.string().min(1, 'Required').max(64),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	admin: z.boolean(),
	locked: z.boolean(),
});

export const userUpdateSchema = z.object({
	username: z.string().min(1, 'Required').max(64).optional(),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.optional(),
	admin: z.boolean().optional(),
	locked: z.boolean().optional(),
});

export type UserCreateValues = z.infer<typeof userCreateSchema>;
export type UserUpdateValues = z.infer<typeof userUpdateSchema>;
