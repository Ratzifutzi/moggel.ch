import z from 'zod';

export const loginSchema = z.object({
	username: z.string().min(1, 'Required'),
	password: z.string().min(1, 'Required'),
	captcha: z.string().min(1, 'Please complete the captcha.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
