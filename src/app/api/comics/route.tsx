import Comic from '@/models/Comic';
import { NextResponse } from 'next/server';

export async function GET() {
	const docs = await Comic.find()
		.select('title permalink slide1 views createdAt')
		.sort({ createdAt: -1 })
		.lean();

	const comics = docs.map((c) => ({
		_id: String(c._id),
		title: c.title,
		permalink: c.permalink,
		slide1: c.slide1,
		viewCount: c.views?.length ?? 0,
		createdAt: c.createdAt,
	}));

	return NextResponse.json({ ok: true, comics });
}
