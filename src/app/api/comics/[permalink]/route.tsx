import Comic from '@/models/Comic';
import { NextRequest, NextResponse } from 'next/server';
import GetUser from '@/helper/GetUser';

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ permalink: string }> },
) {
	const { permalink } = await params;

	const user = await GetUser(req);
	const isLoggedIn = !!user;

	const doc = await Comic.findOne({ permalink })
		.select(
			'title description desoLink faviconUrl permalink titleImage slide1 slide2 meta views desoClicks createdAt',
		)
		.lean();

	if (!doc) {
		return NextResponse.json(
			{ ok: false, error: 'Not found' },
			{ status: 404 },
		);
	}

	return NextResponse.json({
		ok: true,
		comic: {
			_id: String(doc._id),
			title: doc.title,
			description: doc.description,
			desoLink: doc.desoLink,
			faviconUrl: doc.faviconUrl,
			permalink: doc.permalink,
			titleImage: doc.titleImage || doc.slide1.url,
			slide1: doc.slide1,
			slide2: doc.slide2,
			meta: doc.meta,
			createdAt: doc.createdAt,
			...(isLoggedIn
				? {
						viewCount: doc.views?.length ?? 0,
						desoClicks: doc.desoClicks,
					}
				: {}),
		},
	});
}
