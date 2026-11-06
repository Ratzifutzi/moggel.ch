import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';
import { destroyLegacySession } from '@/lib/auth/legacy';

// better-auth's session cookie names, used to expire the cookie if better-auth
// can't run the sign-out itself.
const SESSION_COOKIE_NAMES = [
	'better-auth.session_token',
	'__Secure-better-auth.session_token',
];

export async function GET(req: NextRequest) {
	let sessionCookies: string[] | undefined;
	try {
		const { headers } = await getAuth().api.signOut({
			headers: req.headers,
			returnHeaders: true,
		});
		sessionCookies = headers.getSetCookie();
	} catch (err) {
		console.error('[auth] Sign-out failed:', err);
	}

	const res = NextResponse.json({ ok: true });

	if (!sessionCookies) {
		for (const name of SESSION_COOKIE_NAMES) {
			if (!req.cookies.has(name)) continue;
			res.cookies.set({
				name,
				value: '',
				httpOnly: true,
				secure: name.startsWith('__Secure-'),
				sameSite: 'lax',
				path: '/',
				maxAge: 0,
			});
		}
	}

	// LEGACY-COMPAT: also end a pre-better-auth session. This must run before
	// the better-auth cookies are appended, because res.cookies rewrites
	// Set-Cookie from its snapshot.
	await destroyLegacySession(req, res);
	for (const cookie of sessionCookies ?? []) {
		res.headers.append('set-cookie', cookie);
	}
	return res;
}
