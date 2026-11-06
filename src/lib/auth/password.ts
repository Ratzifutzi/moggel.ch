// Password hashing used by better-auth.
//
// Accounts created before the better-auth switch were hashed with bcrypt
// (cost 12), and better-auth verifies those hashes as they are. New hashes use
// the same format. bcrypt is a native addon, so it is loaded lazily: bundles
// that only read sessions (such as the proxy) never load it.

export const BCRYPT_COST = 12;

const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

export async function hashPassword(password: string): Promise<string> {
	const bcrypt = await import('bcrypt');
	return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword({
	hash,
	password,
}: {
	hash: string;
	password: string;
}): Promise<boolean> {
	if (!BCRYPT_HASH.test(hash)) return false;

	const bcrypt = await import('bcrypt');
	return bcrypt.compare(password, hash);
}
