// LEGACY-COMPAT
//
// Everything in this file keeps data from before the better-auth switch
// working: old session cookies, and the one-time copy of the old `users`
// collection into better-auth. The old collections are only read here, except
// that legacy sessions are deleted on logout, lock and user deletion.
//
// Remove this file once the legacy `sessions` collection is empty and a
// rollback to the pre-better-auth release is no longer needed.

import { createHash } from 'crypto';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { Session } from '@/models/Session';
import {
	AUTH_USER_COLLECTION,
	getAuth,
	getDb,
	placeholderEmail,
	type AuthUser,
} from '.';

export const LEGACY_SESSION_COOKIE_NAME = 'session';
export const LEGACY_USER_COLLECTION = 'users';
/** Legacy user ids already copied to better-auth, so deleted users stay deleted. */
export const LEGACY_MIGRATION_COLLECTION = 'legacy_user_migrations';

type Log = {
	info: (message: string) => unknown;
	warn: (message: string) => unknown;
	error: (message: string) => unknown;
};

type LegacyUserDoc = {
	_id: Types.ObjectId;
	username?: unknown;
	password?: unknown;
	admin?: unknown;
	locked?: unknown;
};

type MigrationMarker = { _id: Types.ObjectId; migratedAt: Date };

function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

function errorMessage(err: unknown): string {
	return err instanceof Error ? err.message : String(err);
}

/** Read the legacy session token from a NextRequest (route handlers, proxy). */
export function getLegacySessionTokenFromRequest(
	req: NextRequest,
): string | undefined {
	return req.cookies.get(LEGACY_SESSION_COOKIE_NAME)?.value || undefined;
}

/** Read the legacy session token from server-component cookies. */
export async function getLegacySessionTokenFromCookies(): Promise<
	string | undefined
> {
	const store = await cookies();
	return store.get(LEGACY_SESSION_COOKIE_NAME)?.value || undefined;
}

async function findLegacySessionByToken(token: string) {
	if (!token) return undefined;

	const session = await Session.findOne({ tokenHash: hashToken(token) });
	if (!session) return undefined;

	if (session.expiresAt.getTime() <= Date.now()) {
		await Session.deleteOne({ _id: session._id }).catch(() => {});
		return undefined;
	}

	const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
	if (session.lastSeenAt.getTime() < fiveMinutesAgo) {
		Session.updateOne(
			{ _id: session._id },
			{ $set: { lastSeenAt: new Date() } },
		).catch(() => {});
	}

	return session;
}

function toAuthUser(doc: {
	_id: Types.ObjectId;
	username?: unknown;
	admin?: unknown;
	locked?: unknown;
}): AuthUser {
	return {
		id: doc._id.toHexString(),
		username: typeof doc.username === 'string' ? doc.username : '',
		admin: doc.admin === true,
		locked: doc.locked === true,
	};
}

/**
 * Resolve the user behind a legacy session cookie. This doesn't depend on
 * better-auth, so old sessions keep working even if it is unavailable.
 */
export async function findUserForLegacySessionToken(
	token: string,
): Promise<AuthUser | undefined> {
	const session = await findLegacySessionByToken(token);
	if (!session) return undefined;

	const db = getDb();
	const projection = { username: 1, admin: 1, locked: 1 };

	const user = await db
		.collection<LegacyUserDoc>(AUTH_USER_COLLECTION)
		.findOne({ _id: session.user }, { projection });
	if (user) return toAuthUser(user);

	// Not in better-auth. If the user was copied before, they were deleted
	// since. Otherwise the copy hasn't run yet (better-auth unavailable at
	// boot), so use the frozen legacy record.
	const migrated = await db
		.collection<MigrationMarker>(LEGACY_MIGRATION_COLLECTION)
		.findOne({ _id: session.user }, { projection: { _id: 1 } });
	if (migrated) return undefined;

	const legacyUser = await db
		.collection<LegacyUserDoc>(LEGACY_USER_COLLECTION)
		.findOne({ _id: session.user }, { projection });
	return legacyUser ? toAuthUser(legacyUser) : undefined;
}

/**
 * Delete the request's legacy session and expire its cookie. Call this before
 * appending better-auth's Set-Cookie headers: `res.cookies` rewrites the
 * Set-Cookie list from its own snapshot.
 */
export async function destroyLegacySession(
	req: NextRequest,
	res: NextResponse,
): Promise<void> {
	const token = getLegacySessionTokenFromRequest(req);
	if (!token) return;

	await Session.deleteOne({ tokenHash: hashToken(token) }).catch(() => {});
	res.cookies.set({
		name: LEGACY_SESSION_COOKIE_NAME,
		value: '',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: 0,
	});
}

/** Delete every legacy session of a user. */
export async function revokeLegacySessions(userId: string): Promise<void> {
	if (!Types.ObjectId.isValid(userId)) return;
	await Session.deleteMany({ user: new Types.ObjectId(userId) });
}

/** True while a legacy user with this username still waits to be copied. */
export async function isLegacyUserPendingMigration(
	username: string,
): Promise<boolean> {
	const db = getDb();
	const legacy = await db
		.collection<LegacyUserDoc>(LEGACY_USER_COLLECTION)
		.findOne({ username }, { projection: { _id: 1 } });
	if (!legacy) return false;

	const marker = await db
		.collection<MigrationMarker>(LEGACY_MIGRATION_COLLECTION)
		.findOne({ _id: legacy._id }, { projection: { _id: 1 } });
	return !marker;
}

export type LegacyMigrationReport = {
	total: number;
	alreadyMigrated: number;
	migrated: number;
	failed: number;
	withoutPassword: number;
};

/**
 * Copy legacy users into better-auth, once each, keeping their ids and bcrypt
 * hashes. Idempotent; only reads the legacy `users` collection.
 */
export async function migrateLegacyAccounts(
	log: Log,
): Promise<LegacyMigrationReport> {
	const ctx = await getAuth().$context;
	const db = getDb();
	const markers = db.collection<MigrationMarker>(LEGACY_MIGRATION_COLLECTION);
	const report: LegacyMigrationReport = {
		total: 0,
		alreadyMigrated: 0,
		migrated: 0,
		failed: 0,
		withoutPassword: 0,
	};

	const legacyUsers = db
		.collection<LegacyUserDoc>(LEGACY_USER_COLLECTION)
		.find(
			{},
			{ projection: { username: 1, password: 1, admin: 1, locked: 1 } },
		);

	for await (const legacy of legacyUsers) {
		report.total++;

		const marker = await markers.findOne(
			{ _id: legacy._id },
			{ projection: { _id: 1 } },
		);
		if (marker) {
			report.alreadyMigrated++;
			continue;
		}

		const id = legacy._id.toHexString();
		try {
			if (typeof legacy.username !== 'string' || legacy.username === '') {
				throw new Error('the legacy user has no username');
			}

			if (!(await ctx.internalAdapter.findUserById(id))) {
				const created = await ctx.internalAdapter.createUser(
					{
						id,
						name: legacy.username,
						email: placeholderEmail(id),
						emailVerified: false,
						username: legacy.username,
						admin: legacy.admin === true,
						locked: legacy.locked === true,
						createdAt: legacy._id.getTimestamp(),
						updatedAt: new Date(),
					},
					{ method: 'legacy-migration' },
				);
				if (!created) throw new Error('better-auth refused to create the user');
			}

			if (typeof legacy.password === 'string' && legacy.password !== '') {
				if (!(await ctx.internalAdapter.findCredentialAccount(id))) {
					await ctx.internalAdapter.createAccount({
						userId: id,
						providerId: 'credential',
						accountId: id,
						password: legacy.password,
					});
				}
			} else {
				report.withoutPassword++;
				log.warn(
					`Legacy user ${id} has no password and won't be able to log in until an admin sets one.`,
				);
			}

			await markers.updateOne(
				{ _id: legacy._id },
				{ $setOnInsert: { migratedAt: new Date() } },
				{ upsert: true },
			);
			report.migrated++;
		} catch (err) {
			report.failed++;
			log.error(
				`Could not copy legacy user ${id} to better-auth (retried on next boot): ${errorMessage(err)}`,
			);
		}
	}

	return report;
}
