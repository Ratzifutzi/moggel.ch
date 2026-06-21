import GetUser from '@/helper/GetUser';
import Comic from '@/models/Comic';
import { comicCreateSchema } from '@/Schemas/ComicForm';
import { NextRequest, NextResponse } from 'next/server';

const PAGE_SIZE = 25;

export async function GET(req: NextRequest) {
	const user = await GetUser(req);

	if (!user || !user.admin) {
		return NextResponse.json(
			{ ok: false, error: 'Forbidden' },
			{ status: 403 },
		);
	}

	const { searchParams } = new URL(req.url);
	const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1);

	const total = await Comic.countDocuments();
	const docs = await Comic.find()
		.select('title permalink desoLink desoClicks views createdAt')
		.sort({ createdAt: -1 })
		.skip((page - 1) * PAGE_SIZE)
		.limit(PAGE_SIZE)
		.lean();

	const comics = docs.map((c) => ({
		_id: c._id,
		title: c.title,
		permalink: c.permalink,
		desoLink: c.desoLink,
		desoClicks: c.desoClicks,
		viewCount: c.views?.length ?? 0,
		createdAt: c.createdAt,
	}));

	return NextResponse.json({
		ok: true,
		page,
		pageSize: PAGE_SIZE,
		total,
		totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
		comics,
	});
}

export async function POST(req: NextRequest) {
	const admin = await GetUser(req);

	if (!admin || !admin.admin) {
		return NextResponse.json(
			{ ok: false, error: 'Forbidden' },
			{ status: 403 },
		);
	}

	const body = await req.json().catch(() => null);
	const parsed = comicCreateSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ ok: false, error: 'Invalid request body' },
			{ status: 400 },
		);
	}

	const existing = await Comic.findOne({ permalink: parsed.data.permalink });
	if (existing) {
		return NextResponse.json(
			{ ok: false, error: 'Permalink already taken' },
			{ status: 409 },
		);
	}

	const created = await Comic.create({
		...parsed.data,
		views: [],
		desoClicks: 0,
	});

	return NextResponse.json({ ok: true, comic: { _id: created._id } });
}
