import Comic from '@/models/Comic';
import { NextResponse } from 'next/server';

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ permalink: string }> },
) {
	const { permalink } = await params;

	const doc = await Comic.findOne({ permalink })
		.select(
			'title description desoLink faviconUrl permalink slide1 slide2 meta views desoClicks createdAt',
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
			slide1: doc.slide1,
			slide2: doc.slide2,
			meta: doc.meta,
			viewCount: doc.views?.length ?? 0,
			desoClicks: doc.desoClicks,
			createdAt: doc.createdAt,
		},
	});
}
