import { NextResponse } from 'next/server';

export async function GET() {
	return NextResponse.json({ ok: false, error: 'Not Found' }, { status: 404 });
}

export const POST = GET;
export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;
export const HEAD = GET;
export const OPTIONS = GET;
