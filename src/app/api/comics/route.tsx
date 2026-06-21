import Comic from '@/models/Comic';
import { NextRequest, NextResponse } from 'next/server';
import GetUser from '@/helper/GetUser';

export async function GET(req: NextRequest) {
	const user = await GetUser(req);
	const isLoggedIn = !!user;

	const docs = await Comic.find()
		.select('title permalink titleImage slide1 views createdAt')
		.sort({ createdAt: -1 })
		.lean();

	const comics = docs.map((c) => ({
		_id: String(c._id),
		title: c.title,
		permalink: c.permalink,
		titleImage: c.titleImage || c.slide1.url,
		slide1: c.slide1,
		createdAt: c.createdAt,
		...(isLoggedIn ? { viewCount: c.views?.length ?? 0 } : {}),
	}));

	return NextResponse.json({ ok: true, comics });
}
