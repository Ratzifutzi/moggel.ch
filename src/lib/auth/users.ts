import { Types } from 'mongoose';
import { getAuth, placeholderEmail, type AuthUser } from '.';
import { revokeLegacySessions } from './legacy';

type StoredUser = {
	id: string;
	username?: string | null;
	admin?: boolean | null;
	locked?: boolean | null;
};

function toAuthUser(user: StoredUser): AuthUser {
	return {
		id: user.id,
		username: user.username ?? '',
		admin: user.admin === true,
		locked: user.locked === true,
	};
}

export async function findUserById(id: string): Promise<AuthUser | null> {
	const ctx = await getAuth().$context;
	const user = await ctx.internalAdapter.findUserById(id);
	return user ? toAuthUser(user as StoredUser) : null;
}

/** Exact, case-sensitive match, like the legacy login. */
export async function findUserByUsername(
	username: string,
): Promise<AuthUser | null> {
	const ctx = await getAuth().$context;
	const user = await ctx.adapter.findOne<StoredUser>({
		model: 'user',
		where: [{ field: 'username', value: username }],
	});
	return user ? toAuthUser(user) : null;
}

/** Create a user with a credential (password) account. */
export async function createAccountUser(input: {
	username: string;
	password: string;
	admin: boolean;
	locked: boolean;
}): Promise<AuthUser> {
	const ctx = await getAuth().$context;
	const id = new Types.ObjectId().toHexString();
	const passwordHash = await ctx.password.hash(input.password);

	const user = await ctx.internalAdapter.createUser(
		{
			id,
			name: input.username,
			email: placeholderEmail(id),
			emailVerified: false,
			username: input.username,
			admin: input.admin,
			locked: input.locked,
		},
		{ method: 'admin' },
	);
	if (!user) throw new Error('better-auth refused to create the user');

	try {
		await ctx.internalAdapter.createAccount({
			userId: user.id,
			providerId: 'credential',
			accountId: user.id,
			password: passwordHash,
		});
	} catch (err) {
		await ctx.internalAdapter.deleteUser(user.id).catch(() => {});
		throw err;
	}

	return toAuthUser(user as StoredUser);
}

/** Only pass `username` when it changes: re-saving the same one is rejected. */
export async function updateAccountUser(
	id: string,
	data: { username?: string; admin?: boolean; locked?: boolean },
): Promise<void> {
	const ctx = await getAuth().$context;
	await ctx.internalAdapter.updateUser(id, data);
}

export async function setAccountPassword(
	id: string,
	password: string,
): Promise<void> {
	const ctx = await getAuth().$context;
	const passwordHash = await ctx.password.hash(password);

	if (await ctx.internalAdapter.findCredentialAccount(id)) {
		await ctx.internalAdapter.updatePassword(id, passwordHash);
		return;
	}

	await ctx.internalAdapter.createAccount({
		userId: id,
		providerId: 'credential',
		accountId: id,
		password: passwordHash,
	});
}

/** End every session of a user, better-auth and legacy. */
export async function revokeAllSessions(id: string): Promise<void> {
	const ctx = await getAuth().$context;
	await ctx.internalAdapter.deleteUserSessions(id);
	await revokeLegacySessions(id);
}

/** Delete a user with their accounts and sessions. */
export async function deleteAccountUser(id: string): Promise<void> {
	const ctx = await getAuth().$context;
	await ctx.internalAdapter.deleteUser(id);
	await revokeLegacySessions(id);
}
