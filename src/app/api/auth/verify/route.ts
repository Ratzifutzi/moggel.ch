import { NextRequest, NextResponse } from 'next/server';

const DESO_NODE_URL = 'https://node.deso.org';

export async function POST(request: NextRequest) {
	let body: { publicKey?: string; jwt?: string };

	try {
		body = await request.json();
	} catch {
		return NextResponse.json(
			{ error: 'Invalid request body' },
			{ status: 400 },
		);
	}

	const { publicKey, jwt } = body;

	if (
		typeof publicKey !== 'string' ||
		typeof jwt !== 'string' ||
		!publicKey.startsWith('BC1Y') ||
		!jwt
	) {
		return NextResponse.json(
			{ error: 'Valid publicKey and jwt are required' },
			{ status: 400 },
		);
	}

	const response = await fetch(`${DESO_NODE_URL}/api/v0/validate-jwt`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			PublicKeyBase58Check: publicKey,
			JWT: jwt,
		}),
	});

	if (!response.ok) {
		return NextResponse.json(
			{ error: 'JWT validation failed' },
			{ status: 401 },
		);
	}

	const result = await response.json();

	return NextResponse.json({
		valid: result.IsValid === true,
		publicKey,
	});
}
