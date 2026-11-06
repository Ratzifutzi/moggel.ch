const apiKey = process.env.SENDGRID_API_KEY;

if (!apiKey) {
	throw new Error('SENDGRID_API_KEY is not set');
}

const SENDGRID_API_BASE = 'https://api.sendgrid.com';

export class SendGridError extends Error {
	readonly status: number;
	readonly body: unknown;

	constructor(status: number, body: unknown) {
		super(`SendGrid request failed with status ${status}`);
		this.name = 'SendGridError';
		this.status = status;
		this.body = body;
	}
}

/**
 * Minimal SendGrid v3 REST client. Replaces @sendgrid/mail and @sendgrid/client,
 * whose transitive dependency `deepmerge` has an unpatched advisory (GHSA-gcqx-w48m-w2h4).
 */
export async function sendgridRequest<T = unknown>(
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
	path: `/v3/${string}`,
	body?: unknown,
): Promise<T> {
	const response = await fetch(`${SENDGRID_API_BASE}${path}`, {
		method,
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: `Bearer ${apiKey}`,
		},
		body: body === undefined ? undefined : JSON.stringify(body),
		cache: 'no-store',
	});

	const text = await response.text();
	let parsed: unknown = text;
	if (text) {
		try {
			parsed = JSON.parse(text);
		} catch {
			// Non-JSON body; keep the raw text.
		}
	}

	if (!response.ok) {
		throw new SendGridError(response.status, parsed);
	}

	return parsed as T;
}
