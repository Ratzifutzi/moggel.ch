import { captcha } from '@/lib/captcha';
import User from '@/models/User';
import { LoginFormValues, loginSchema } from '@/Schemas/LoginForm';
import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcrypt';
import { LoginAttempt, LoginFailureReason } from '@/models/LoginAttempt';
import GetIpAddress from '@/helper/GetIpAddress';
import { checkLoginRateLimit } from '@/lib/loginRateLimit';
import { createSession } from '@/lib/session';

class LoginError extends Error {
	constructor(
		public reason: LoginFailureReason,
		public userMessage: string,
		public status: number = 403,
		public retryAfterSeconds?: number,
	) {
		super(reason);
		this.name = 'LoginError';
	}
}

export async function POST(req: NextRequest) {
	const body = (await req.json()) as LoginFormValues;
	const ip = GetIpAddress(req);

	try {
		// Validate body
		const bodyValidation = loginSchema.safeParse(body);
		if (!bodyValidation.success) {
			throw new LoginError(
				'malformed_form',
				'Malformed body, try turning extensions off.',
				400,
			);
		}

		// Rate limit: run before any expensive work
		const rl = await checkLoginRateLimit(ip, body.username);
		if (rl.limited) {
			throw new LoginError(
				'rate_limited',
				'Too many login attempts. Please try again later.',
				429,
				rl.retryAfterSeconds,
			);
		}

		// Validate Captcha
		const captchaResult = await captcha.verify({
			solution: body.captcha,
			sitekey: process.env.NEXT_PUBLIC_PC_SITEKEY,
		});
		if (!captchaResult.ok()) {
			throw new LoginError(
				'captcha_failed',
				'Session expired, please sign in again',
				400,
			);
		}

		const userInDb = await User.findOne({
			username: body.username,
		});

		// User not found
		if (!userInDb) {
			throw new LoginError('unknown_user', 'Invalid username or password.');
		}

		// User locked
		if (userInDb.locked) {
			throw new LoginError('account_locked', 'Your account has been locked.');
		}

		// Incorrect password
		if (!(await bcrypt.compare(body.password, userInDb.password))) {
			throw new LoginError('invalid_password', 'Invalid username or password.');
		}

		// Log In
		await LoginAttempt.insertOne({
			ip,
			username: body.username,
			successful: true,
		});

		const res = NextResponse.json({ ok: true });
		await createSession(res, userInDb._id, {
			ip,
			userAgent: req.headers.get('user-agent') ?? undefined,
		});
		return res;
	} catch (err) {
		if (err instanceof LoginError) {
			await LoginAttempt.insertOne({
				ip,
				username: body.username,
				successful: false,
				failureReason: err.reason,
			});

			const headers: Record<string, string> = {};
			if (err.retryAfterSeconds !== undefined) {
				headers['Retry-After'] = String(err.retryAfterSeconds);
			}

			return NextResponse.json(
				{ ok: false, error: err.userMessage },
				{ status: err.status, headers },
			);
		}

		console.error(err);
		return NextResponse.json(
			{ ok: false, error: 'Internal Server Error' },
			{ status: 500 },
		);
	}
}
