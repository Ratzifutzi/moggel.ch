import GetUser from '@/helper/GetUser';
import User from '@/models/User';
import { userUpdateSchema } from '@/Schemas/UserForm';
import { NextRequest, NextResponse } from 'next/server';
import * as bcrypt from 'bcrypt';
import { isValidObjectId } from 'mongoose';

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
			{ ok: false, error: 'Invalid user id' },
			{ status: 400 },
		);
	}

	const body = await req.json().catch(() => null);
	const parsed = userUpdateSchema.safeParse(body);
	if (!parsed.success) {
		return NextResponse.json(
			{ ok: false, error: 'Invalid request body' },
			{ status: 400 },
		);
	}

	const target = await User.findById(id);
	if (!target) {
		return NextResponse.json(
			{ ok: false, error: 'User not found' },
			{ status: 404 },
		);
	}

	if (
		String(target._id) === String(admin._id) &&
		parsed.data.admin === false
	) {
		return NextResponse.json(
			{ ok: false, error: 'You cannot revoke your own admin rights' },
			{ status: 400 },
		);
	}

	if (parsed.data.username && parsed.data.username !== target.username) {
		const clash = await User.findOne({ username: parsed.data.username });
		if (clash) {
			return NextResponse.json(
				{ ok: false, error: 'Username already taken' },
				{ status: 409 },
			);
		}
		target.username = parsed.data.username;
	}

	if (parsed.data.password) {
		target.password = await bcrypt.hash(parsed.data.password, 12);
	}

	if (parsed.data.admin !== undefined) {
		target.admin = parsed.data.admin;
	}

	if (parsed.data.locked !== undefined) {
		target.locked = parsed.data.locked;
	}

	await target.save();

	return NextResponse.json({
		ok: true,
		user: {
			_id: target._id,
			username: target.username,
			admin: target.admin,
			locked: target.locked,
		},
	});
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
			{ ok: false, error: 'Invalid user id' },
			{ status: 400 },
		);
	}

	if (String(admin._id) === id) {
		return NextResponse.json(
			{ ok: false, error: 'You cannot delete yourself' },
			{ status: 400 },
		);
	}

	const result = await User.findByIdAndDelete(id);
	if (!result) {
		return NextResponse.json(
			{ ok: false, error: 'User not found' },
			{ status: 404 },
		);
	}

	return NextResponse.json({ ok: true });
}
