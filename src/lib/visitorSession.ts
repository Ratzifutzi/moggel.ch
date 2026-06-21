import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const VISITOR_COOKIE_NAME = 'visitor';
export const VISITOR_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function getVisitorToken(req: NextRequest): string | undefined {
	return req.cookies.get(VISITOR_COOKIE_NAME)?.value || undefined;
}

export function setVisitorCookie(res: NextResponse, token: string): void {
	res.cookies.set({
		name: VISITOR_COOKIE_NAME,
		value: token,
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: VISITOR_MAX_AGE_SECONDS,
	});
}

export function generateVisitorToken(): string {
	return randomBytes(24).toString('base64url');
}

export function ensureVisitorToken(
	req: NextRequest,
	res: NextResponse,
): string {
	const existing = getVisitorToken(req);
	if (existing) return existing;

	const token = generateVisitorToken();
	setVisitorCookie(res, token);
	return token;
}
