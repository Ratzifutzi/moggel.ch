import { captcha } from '@/lib/captcha';
import { LoginFormValues, loginSchema } from '@/Schemas/LoginForm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
	const body = (await req.json()) as LoginFormValues;

	// Validate body
	const bodyValidation = loginSchema.safeParse(body);
	if (!bodyValidation.success) {
		return Response.json(
			{ ok: false, error: 'Malformed form' },
			{ status: 400 },
		);
	}

	// Validate Captcha
	const captchaResult = await captcha.verify({
		solution: body.captcha,
		sitekey: process.env.NEXT_PUBLIC_PC_SITEKEY,
	});
	if (!captchaResult.ok()) {
		return Response.json(
			{ ok: false, error: 'Captcha verification failed' },
			{ status: 400 },
		);
	}

	// Admin User
	if (
		body.username === 'admin' &&
		body.password === process.env.ADMIN_USER_PASSWORD
	) {
		return NextResponse.json({
			ok: true,
		});
	}

	return NextResponse.json(
		{
			ok: false,
			error: 'Invalid username or password',
		},
		{
			status: 403,
		},
	);
}
