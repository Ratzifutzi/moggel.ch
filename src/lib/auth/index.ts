import { betterAuth } from 'better-auth/minimal';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { APIError } from 'better-auth/api';
import { username } from 'better-auth/plugins/username';
import mongoose, { Types } from 'mongoose';
import { hashPassword, verifyPassword } from './password';

// better-auth's default collection names. They are separate from the legacy
// mongoose collections (`users`, `sessions`), which are kept untouched so the
// previous release can still run against the same database.
export const AUTH_USER_COLLECTION = 'user';
export const AUTH_SESSION_COLLECTION = 'session';
export const AUTH_ACCOUNT_COLLECTION = 'account';
export const AUTH_VERIFICATION_COLLECTION = 'verification';

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 365 days

export type AuthUser = {
	id: string;
	username: string;
	admin: boolean;
	locked: boolean;
};

/** Thrown when the account system can't run (missing secret, no database). */
export class AuthUnavailableError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'AuthUnavailableError';
	}
}

/** better-auth requires a unique email; `.invalid` can never be delivered. */
export function placeholderEmail(userId: string): string {
	return `${userId}@users.invalid`;
}

/** The database behind the global mongoose connection made in instrumentation. */
export function getDb() {
	const db = mongoose.connection.db;
	if (!db) throw new AuthUnavailableError('MongoDB is not connected.');
	return db;
}

async function isUserLocked(userId: string): Promise<boolean> {
	if (!Types.ObjectId.isValid(userId)) return false;

	const user = await getDb()
		.collection(AUTH_USER_COLLECTION)
		.findOne(
			{ _id: new Types.ObjectId(userId) },
			{ projection: { locked: 1 } },
		);

	return user?.locked === true;
}

function createAuth(secret: string) {
	return betterAuth({
		appName: 'moggel.ch',
		secret,
		baseURL: process.env.BETTER_AUTH_URL || undefined,
		// Reuse the mongoose connection. Don't pass `client`: that turns on
		// transactions, which need a replica set.
		database: mongodbAdapter(getDb()),
		telemetry: { enabled: false },
		// better-auth's limiter only guards its HTTP handler, which is not
		// mounted. /api/login keeps its own LoginAttempt-based limiter.
		rateLimit: { enabled: false },
		emailAndPassword: {
			// Keeps better-auth's email sign-up and sign-in endpoints off. The
			// password settings below still apply to username sign-in.
			enabled: false,
			minPasswordLength: 8,
			// Legacy passwords had no maximum; bcrypt only uses the first 72 bytes.
			maxPasswordLength: 1024,
			password: { hash: hashPassword, verify: verifyPassword },
		},
		session: {
			expiresIn: SESSION_MAX_AGE_SECONDS,
			// Fixed lifetime, like the legacy sessions. This also stops getSession
			// from trying to write cookies while server components render.
			disableSessionRefresh: true,
		},
		user: {
			additionalFields: {
				admin: {
					type: 'boolean',
					required: false,
					defaultValue: false,
					input: false,
				},
				locked: {
					type: 'boolean',
					required: false,
					defaultValue: false,
					input: false,
				},
			},
		},
		advanced: {
			// Same rule as the legacy session cookie.
			useSecureCookies: process.env.NODE_ENV === 'production',
			ipAddress: {
				ipAddressHeaders: [
					(process.env.PROXY_IP_HEADER || 'x-forwarded-for').toLowerCase(),
				],
			},
		},
		databaseHooks: {
			session: {
				create: {
					// Runs after the password was verified, so the lock is only
					// revealed to someone who knows the password.
					before: async (session) => {
						if (await isUserLocked(session.userId)) {
							throw new APIError('FORBIDDEN', {
								code: 'ACCOUNT_LOCKED',
								message: 'Your account has been locked.',
							});
						}
					},
				},
			},
		},
		plugins: [
			username({
				// Match the legacy login exactly: case-sensitive, 1–64 characters,
				// any characters.
				usernameNormalization: false,
				minUsernameLength: 1,
				maxUsernameLength: 64,
				usernameValidator: () => true,
				displayUsername: false,
			}),
		],
	});
}

type Auth = ReturnType<typeof createAuth>;

let instance: Auth | undefined;

/**
 * The better-auth instance, created on first use.
 *
 * It is built lazily because betterAuth() starts initialising as soon as it is
 * called and throws in production without a secret. Building it at import time
 * would break `next build` and boot. Each bundle keeps its own instance.
 */
export function getAuth(): Auth {
	if (instance) return instance;

	const secret = process.env.BETTER_AUTH_SECRET;
	if (!secret) {
		throw new AuthUnavailableError(
			'BETTER_AUTH_SECRET is not set; login and account management are disabled.',
		);
	}

	const auth = createAuth(secret);
	// Keep a failed initialisation from becoming an unhandled rejection. The
	// error resurfaces from every API call that awaits the context.
	auth.$context.catch((err) => {
		console.error('[auth] better-auth failed to initialise:', err);
	});

	instance = auth;
	return auth;
}
