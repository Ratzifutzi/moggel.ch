import GetUser from '@/helper/GetUser';
import { AUTH_USER_COLLECTION, getDb } from '@/lib/auth';
import { createAccountUser, findUserByUsername } from '@/lib/auth/users';
import { userCreateSchema } from '@/Schemas/UserForm';
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

	const collection = getDb().collection(AUTH_USER_COLLECTION);
	const total = await collection.countDocuments();
	const users = await collection
		.find({}, { projection: { username: 1, locked: 1, admin: 1 } })
		.sort({ admin: -1, username: 1 })
		.skip((page - 1) * PAGE_SIZE)
		.limit(PAGE_SIZE)
		.toArray();

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

	const existing = await findUserByUsername(parsed.data.username);
	if (existing) {
		return NextResponse.json(
			{ ok: false, error: 'Username already taken' },
			{ status: 409 },
		);
	}

	const created = await createAccountUser({
		username: parsed.data.username,
		password: parsed.data.password,
		admin: parsed.data.admin,
		locked: parsed.data.locked,
	});

	return NextResponse.json({
		ok: true,
		user: {
			_id: created.id,
			username: created.username,
			admin: created.admin,
			locked: created.locked,
		},
	});
}
