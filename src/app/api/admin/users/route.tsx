import GetUser from '@/helper/GetUser';
import User from '@/models/User';
import { userCreateSchema } from '@/Schemas/UserForm';
import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcrypt';

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

	const total = await User.countDocuments();
	const users = await User.find()
		.select('username locked admin')
		.sort({ admin: -1, username: 1 })
		.skip((page - 1) * PAGE_SIZE)
		.limit(PAGE_SIZE)
		.lean();

	return NextResponse.json({
		ok: true,
		page,
		pageSize: PAGE_SIZE,
		total,
		totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
		users,
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
	const parsed = userCreateSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ ok: false, error: 'Invalid request body' },
			{ status: 400 },
		);
	}

	const existing = await User.findOne({ username: parsed.data.username });
	if (existing) {
		return NextResponse.json(
			{ ok: false, error: 'Username already taken' },
			{ status: 409 },
		);
	}

	const hashed = await bcrypt.hash(parsed.data.password, 12);
	const created = await User.create({
		username: parsed.data.username,
		password: hashed,
		admin: parsed.data.admin,
		locked: parsed.data.locked,
	});

	return NextResponse.json({
		ok: true,
		user: {
			_id: created._id,
			username: created.username,
			admin: created.admin,
			locked: created.locked,
		},
	});
}
