import { randomBytes, createHash, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Session } from '@/models/Session';
import { Types } from 'mongoose';

export const SESSION_COOKIE_NAME = 'session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 365 days

function generateToken(): string {
	return randomBytes(32).toString('base64url');
}

function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

export async function createSession(
	res: NextResponse,
	userId: Types.ObjectId | string,
	meta: { ip?: string; userAgent?: string } = {},
): Promise<string> {
	const token = generateToken();
	const tokenHash = hashToken(token);
	const now = new Date();
	const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000);

	await Session.create({
		tokenHash,
		user: typeof userId === 'string' ? new Types.ObjectId(userId) : userId,
		createdAt: now,
		expiresAt,
		lastSeenAt: now,
		ip: meta.ip,
		userAgent: meta.userAgent,
	});

	res.cookies.set({
		name: SESSION_COOKIE_NAME,
		value: token,
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: SESSION_MAX_AGE_SECONDS,
	});

	return token;
}

/** Read the raw session token from a NextRequest (route handlers / middleware). */
export function getSessionTokenFromRequest(
	req: NextRequest,
): string | undefined {
	return req.cookies.get(SESSION_COOKIE_NAME)?.value || undefined;
}

/** Read the raw session token from server-component cookies. */
export async function getSessionTokenFromCookies(): Promise<
	string | undefined
> {
	const store = await cookies();
	return store.get(SESSION_COOKIE_NAME)?.value || undefined;
}

export async function findSessionByToken(token: string) {
	if (!token) return undefined;

	const tokenHash = hashToken(token);

	const session = await Session.findOne({ tokenHash });
	if (!session) return undefined;

	if (session.expiresAt.getTime() <= Date.now()) {
		await Session.deleteOne({ _id: session._id }).catch(() => {});
		return undefined;
	}

	const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
	if (session.lastSeenAt.getTime() < fiveMinutesAgo) {
		Session.updateOne(
			{ _id: session._id },
			{ $set: { lastSeenAt: new Date() } },
		).catch(() => {});
	}

	return session;
}

export async function destroySession(
	req: NextRequest,
	res: NextResponse,
): Promise<void> {
	const token = getSessionTokenFromRequest(req);
	if (token) {
		await Session.deleteOne({ tokenHash: hashToken(token) }).catch(() => {});
	}
	res.cookies.set({
		name: SESSION_COOKIE_NAME,
		value: '',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: 0,
	});
}

export { hashToken as _hashTokenForTests, timingSafeEqual };
