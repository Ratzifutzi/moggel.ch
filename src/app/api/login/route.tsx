import { captcha } from '@/lib/captcha';
import User from '@/models/User';
import { LoginFormValues, loginSchema } from '@/Schemas/LoginForm';
import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcrypt';
import { LoginAttempt } from '@/models/LoginAttempt';
import GetIpAddress from '@/helper/GetIpAddress';

class LoginError extends Error {
	constructor(
		public message: string,
		public status: number = 403,
	) {
		super(message);
		this.name = 'LoginError';
	}
}

export async function POST(req: NextRequest) {
	const body = (await req.json()) as LoginFormValues;

	try {
		// Validate body
		const bodyValidation = loginSchema.safeParse(body);
		if (!bodyValidation.success) {
			throw new LoginError('malformed_form', 400);
		}

		// Validate Captcha
		const captchaResult = await captcha.verify({
			solution: body.captcha,
			sitekey: process.env.NEXT_PUBLIC_PC_SITEKEY,
		});
		if (!captchaResult.ok()) {
			throw new LoginError('captcha_failed', 400);
		}

		const userInDb = await User.findOne({
			username: body.username,
		});

		// User not found
		if (!userInDb) {
			throw new LoginError('unknown_user');
		}

		// User locked
		if (userInDb.locked) {
			throw new LoginError('account_locked');
		}

		// Incorrect password
		if (!(await bcrypt.compare(body.password, userInDb.password))) {
			throw new LoginError('invalid_password');
		}

		// Log In
		await LoginAttempt.insertOne({
			ip: GetIpAddress(req),
			username: body.username,
			successful: true,
		});

		return NextResponse.json({ ok: true });
	} catch (err) {
		if (err instanceof LoginError) {
			await LoginAttempt.insertOne({
				ip: GetIpAddress(req),
				username: body.username,
				successful: false,
				failureReason: err.message,
			});

			return NextResponse.json(
				{ ok: false, error: 'Invalid username or password' },
				{ status: err.status },
			);
		}

		console.error(err);
		return NextResponse.json(
			{ ok: false, error: 'Internal Server Error' },
			{ status: 500 },
		);
	}
}
