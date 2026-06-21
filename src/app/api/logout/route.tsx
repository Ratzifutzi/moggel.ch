import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '@/lib/session';

export async function GET(req: NextRequest) {
	const res = NextResponse.json({ ok: true });
	await destroySession(req, res);
	return res;
}
