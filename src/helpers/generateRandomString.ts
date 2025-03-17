import * as crypto from 'crypto';

export async function generateRandomString(length: number) {
	const bytes = crypto.randomBytes(Math.ceil(length / 2));
	return bytes.toString('hex').slice(0, length);
};