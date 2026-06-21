import GetUser from '@/helper/GetUser';
import {
	GetServerFlags,
	ToggleFlag,
	VALID_SERVER_FLAGS,
	type ServerFlags,
} from '@/models/Flags';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
	const user = await GetUser(req);

	if (!user || !user.admin) {
		return NextResponse.json(
			{ ok: false, error: 'Forbidden' },
			{ status: 403 },
		);
	}

	const flags = await GetServerFlags();

	return NextResponse.json({
		ok: true,
		availableFlags: VALID_SERVER_FLAGS,
		enabledFlags: flags,
	});
}

export async function PATCH(req: NextRequest) {
	const user = await GetUser(req);

	if (!user || !user.admin) {
		return NextResponse.json(
			{ ok: false, error: 'Forbidden' },
			{ status: 403 },
		);
	}

	const body = await req.json().catch(() => null);
	const flag = body?.flag;

	if (
		typeof flag !== 'string' ||
		!VALID_SERVER_FLAGS.includes(flag as ServerFlags)
	) {
		return NextResponse.json(
			{ ok: false, error: 'Invalid flag' },
			{ status: 400 },
		);
	}

	await ToggleFlag(flag as ServerFlags);
	const flags = await GetServerFlags();

	return NextResponse.json({
		ok: true,
		availableFlags: VALID_SERVER_FLAGS,
		enabledFlags: flags,
	});
}
