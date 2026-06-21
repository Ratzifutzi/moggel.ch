import { NextResponse, type NextRequest } from 'next/server';
import GetUser from '@/helper/GetUser';
import { GetServerFlags } from '@/models/Flags';

// Paths that are allowed even during maintenance for non-admin users.
// Admins can always access every page.
const MAINTENANCE_ALLOWLIST = ['/account/login', '/api/login', '/api/logout'];

function isAllowlisted(pathname: string): boolean {
	return MAINTENANCE_ALLOWLIST.some(
		(path) => pathname === path || pathname.startsWith(`${path}/`),
	);
}

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// The maintenance page itself must always render.
	if (pathname === '/maintenance') {
		return NextResponse.next();
	}

	const flags = await GetServerFlags();
	if (!flags.includes('maintenance')) {
		return NextResponse.next();
	}

	// Admins bypass the maintenance gate completely.
	const user = await GetUser(request);
	if (user?.admin) {
		return NextResponse.next();
	}

	// Allow login (and related auth endpoints) so admins can sign in.
	if (isAllowlisted(pathname)) {
		return NextResponse.next();
	}

	return NextResponse.rewrite(new URL('/maintenance', request.url));
}

export const config = {
	// Run on every route except static assets, image optimization, and the
	// public folder. This still covers all pages and most API routes.
	matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/).*)'],
};
