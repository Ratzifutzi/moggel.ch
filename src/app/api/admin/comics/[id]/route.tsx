import GetUser from '@/helper/GetUser';
import Comic from '@/models/Comic';
import { comicUpdateSchema } from '@/Schemas/ComicForm';
import { NextRequest, NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const admin = await GetUser(req);

	if (!admin || !admin.admin) {
		return NextResponse.json(
			{ ok: false, error: 'Forbidden' },
			{ status: 403 },
		);
	}

	const { id } = await params;
	if (!isValidObjectId(id)) {
		return NextResponse.json(
			{ ok: false, error: 'Invalid comic id' },
			{ status: 400 },
		);
	}

	const comic = await Comic.findById(id).lean();
	if (!comic) {
		return NextResponse.json(
			{ ok: false, error: 'Comic not found' },
			{ status: 404 },
		);
	}

	return NextResponse.json({ ok: true, comic });
}

export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const admin = await GetUser(req);

	if (!admin || !admin.admin) {
		return NextResponse.json(
			{ ok: false, error: 'Forbidden' },
			{ status: 403 },
		);
	}

	const { id } = await params;
	if (!isValidObjectId(id)) {
		return NextResponse.json(
			{ ok: false, error: 'Invalid comic id' },
			{ status: 400 },
		);
	}

	const body = await req.json().catch(() => null);
	const parsed = comicUpdateSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ ok: false, error: 'Invalid request body' },
			{ status: 400 },
		);
	}

	const target = await Comic.findById(id);
	if (!target) {
		return NextResponse.json(
			{ ok: false, error: 'Comic not found' },
			{ status: 404 },
		);
	}

	if (parsed.data.permalink && parsed.data.permalink !== target.permalink) {
		const clash = await Comic.findOne({ permalink: parsed.data.permalink });
		if (clash) {
			return NextResponse.json(
				{ ok: false, error: 'Permalink already taken' },
				{ status: 409 },
			);
		}
		target.permalink = parsed.data.permalink;
	}

	if (parsed.data.title !== undefined) target.title = parsed.data.title;
	if (parsed.data.description !== undefined)
		target.description = parsed.data.description;
	if (parsed.data.desoLink !== undefined)
		target.desoLink = parsed.data.desoLink;
	if (parsed.data.faviconUrl !== undefined)
		target.faviconUrl = parsed.data.faviconUrl;
	if (parsed.data.titleImage !== undefined)
		target.titleImage = parsed.data.titleImage;
	if (parsed.data.slide1 !== undefined) target.slide1 = parsed.data.slide1;
	if (parsed.data.slide2 !== undefined) target.slide2 = parsed.data.slide2;
	if (parsed.data.meta !== undefined) target.meta = parsed.data.meta;

	await target.save({ validateModifiedOnly: true });

	return NextResponse.json({ ok: true, comic: { _id: target._id } });
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const admin = await GetUser(req);

	if (!admin || !admin.admin) {
		return NextResponse.json(
			{ ok: false, error: 'Forbidden' },
			{ status: 403 },
		);
	}

	const { id } = await params;
	if (!isValidObjectId(id)) {
		return NextResponse.json(
			{ ok: false, error: 'Invalid comic id' },
			{ status: 400 },
		);
	}

	const result = await Comic.findByIdAndDelete(id);
	if (!result) {
		return NextResponse.json(
			{ ok: false, error: 'Comic not found' },
			{ status: 404 },
		);
	}

	return NextResponse.json({ ok: true });
}
