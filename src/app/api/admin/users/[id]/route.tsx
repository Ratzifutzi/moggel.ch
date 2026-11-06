import GetUser from '@/helper/GetUser';
import {
	deleteAccountUser,
	findUserById,
	findUserByUsername,
	revokeAllSessions,
	setAccountPassword,
	updateAccountUser,
} from '@/lib/auth/users';
import { userUpdateSchema } from '@/Schemas/UserForm';
import { NextRequest, NextResponse } from 'next/server';
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

	const target = await findUserById(id);
	if (!target) {
		return NextResponse.json(
			{ ok: false, error: 'User not found' },
			{ status: 404 },
		);
	}

	if (target.id === admin.id && parsed.data.admin === false) {
		return NextResponse.json(
			{ ok: false, error: 'You cannot revoke your own admin rights' },
			{ status: 400 },
		);
	}

	const update: { username?: string; admin?: boolean; locked?: boolean } = {};

	if (parsed.data.username && parsed.data.username !== target.username) {
		const clash = await findUserByUsername(parsed.data.username);
		if (clash) {
			return NextResponse.json(
				{ ok: false, error: 'Username already taken' },
				{ status: 409 },
			);
		}
		update.username = parsed.data.username;
	}

	if (parsed.data.admin !== undefined) {
		update.admin = parsed.data.admin;
	}

	if (parsed.data.locked !== undefined) {
		update.locked = parsed.data.locked;
	}

	if (Object.keys(update).length > 0) {
		await updateAccountUser(target.id, update);
	}

	if (parsed.data.password) {
		await setAccountPassword(target.id, parsed.data.password);
	}

	// A locked user can't sign in or use a session; end the ones they have.
	if (update.locked === true) {
		await revokeAllSessions(target.id);
	}

	const saved = (await findUserById(target.id)) ?? target;

	return NextResponse.json({
		ok: true,
		user: {
			_id: saved.id,
			username: saved.username,
			admin: saved.admin,
			locked: saved.locked,
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

	if (admin.id === id) {
		return NextResponse.json(
			{ ok: false, error: 'You cannot delete yourself' },
			{ status: 400 },
		);
	}

	const target = await findUserById(id);
	if (!target) {
		return NextResponse.json(
			{ ok: false, error: 'User not found' },
			{ status: 404 },
		);
	}

	await deleteAccountUser(target.id);

	return NextResponse.json({ ok: true });
}
