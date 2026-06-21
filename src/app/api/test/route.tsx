import GetIpAddress from '@/helper/GetIpAddress';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
	const ip = GetIpAddress(req);

	return NextResponse.json({
		ip,
	});
}
