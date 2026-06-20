import { NextRequest } from 'next/server';

export default function GetIpAddress(req: NextRequest) {
	const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];

	return ip;
}
