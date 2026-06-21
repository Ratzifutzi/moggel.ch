import Comic from '@/models/Comic';
import ALLOWED_UTMS from '@/config/AllowedUTM';
import {
	generateVisitorToken,
	getVisitorToken,
	setVisitorCookie,
} from '@/lib/visitorSession';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ permalink: string }> },
) {
	const { permalink } = await params;

	const { searchParams } = new URL(req.url);
	const rawUtm = searchParams.get('utm') ?? '';
	const utm = ALLOWED_UTMS.includes(rawUtm) ? rawUtm : '';

	const existingToken = getVisitorToken(req);
	const token = existingToken ?? generateVisitorToken();

	const result = await Comic.updateOne(
		{ permalink, 'views.session': { $ne: token } },
		{ $push: { views: { utm, session: token, at: new Date() } } },
	);

	const res = NextResponse.json({
		ok: true,
		counted: result.modifiedCount === 1,
	});
	if (!existingToken) setVisitorCookie(res, token);
	return res;
}
