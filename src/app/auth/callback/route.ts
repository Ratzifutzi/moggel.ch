import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const publicKey = searchParams.get('publicKeyAdded');

	if (!publicKey) {
		return NextResponse.redirect(new URL('/auth/success', request.url), {
			status: 400,
			statusText: 'publicKey missing.',
		});
	}

	console.log('User linked account: ', publicKey);

	return NextResponse.redirect(new URL('/auth/success', request.url));
}
