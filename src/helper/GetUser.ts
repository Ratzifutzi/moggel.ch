import { headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { AuthUnavailableError, getAuth, type AuthUser } from '@/lib/auth';
import {
	findUserForLegacySessionToken,
	getLegacySessionTokenFromCookies,
	getLegacySessionTokenFromRequest,
} from '@/lib/auth/legacy';

let reportedUnavailable = false;

export default async function GetUser(
	req?: NextRequest,
): Promise<AuthUser | undefined> {
	try {
		const result = await getAuth().api.getSession({
			headers: req ? req.headers : await headers(),
		});

		if (result) {
			// A better-auth session always wins; never fall through to an older
			// legacy cookie, even when this user is locked.
			const { user } = result;
			if (user.locked) return undefined;

			return {
				id: user.id,
				username: user.username ?? '',
				admin: user.admin === true,
				locked: false,
			};
		}
	} catch (err) {
		if (!(err instanceof AuthUnavailableError)) {
			console.error('[auth] Could not read the session:', err);
		} else if (!reportedUnavailable) {
			reportedUnavailable = true;
			console.error(`[auth] ${err.message}`);
		}
	}

	// LEGACY-COMPAT: session cookies issued before the better-auth switch.
	const legacyToken = req
		? getLegacySessionTokenFromRequest(req)
		: await getLegacySessionTokenFromCookies();
	if (!legacyToken) return undefined;

	const user = await findUserForLegacySessionToken(legacyToken);

	// Refuse to authenticate locked accounts even if they still hold a session.
	if (!user || user.locked) return undefined;

	return user;
}
