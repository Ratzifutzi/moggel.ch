import { captcha } from '@/lib/captcha';
import { LoginFormValues, loginSchema } from '@/Schemas/LoginForm';
import { NextRequest, NextResponse } from 'next/server';
import { isAPIError } from 'better-auth/api';
import { LoginAttempt, LoginFailureReason } from '@/models/LoginAttempt';
import GetIpAddress from '@/helper/GetIpAddress';
import { checkLoginRateLimit } from '@/lib/loginRateLimit';
import { AuthUnavailableError, getAuth } from '@/lib/auth';
import { destroyLegacySession } from '@/lib/auth/legacy';
import { findUserByUsername } from '@/lib/auth/users';

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

		const auth = getAuth();

		// Only used to tell unknown users from wrong passwords in the login log.
		const existingUser = await findUserByUsername(body.username);

		// better-auth verifies the password, refuses locked accounts (see the
		// session hook in lib/auth) and issues the session cookie.
		let sessionCookies: string[];
		try {
			const { headers } = await auth.api.signInUsername({
				body: {
					username: body.username,
					password: body.password,
					rememberMe: true,
				},
				headers: req.headers,
				returnHeaders: true,
			});
			sessionCookies = headers.getSetCookie();
		} catch (err) {
			if (isAPIError(err)) {
				if (err.body?.code === 'ACCOUNT_LOCKED') {
					throw new LoginError(
						'account_locked',
						'Your account has been locked.',
					);
				}
				if ([400, 401, 422].includes(err.statusCode)) {
					throw new LoginError(
						existingUser ? 'invalid_password' : 'unknown_user',
						'Invalid username or password.',
					);
				}
			}
			throw err;
		}

		// Log In
		await LoginAttempt.insertOne({
			ip,
			username: body.username,
			successful: true,
		});

		const res = NextResponse.json({ ok: true });
		// LEGACY-COMPAT: retire a pre-better-auth session cookie so it can't
		// outlive this login. This must run before the better-auth cookies are
		// appended, because res.cookies rewrites Set-Cookie from its snapshot.
		await destroyLegacySession(req, res);
		for (const cookie of sessionCookies) {
			res.headers.append('set-cookie', cookie);
		}
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

		if (err instanceof AuthUnavailableError) {
			console.error(`[auth] ${err.message}`);
			return NextResponse.json(
				{ ok: false, error: 'Login is temporarily unavailable.' },
				{ status: 503 },
			);
		}

		console.error(err);
		return NextResponse.json(
			{ ok: false, error: 'Internal Server Error' },
			{ status: 500 },
		);
	}
}
