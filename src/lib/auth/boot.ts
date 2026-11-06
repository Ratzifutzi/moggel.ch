import { randomUUID } from 'crypto';
import {
	AUTH_ACCOUNT_COLLECTION,
	AUTH_SESSION_COLLECTION,
	AUTH_USER_COLLECTION,
	AUTH_VERIFICATION_COLLECTION,
	getAuth,
	getDb,
} from '.';
import { isLegacyUserPendingMigration, migrateLegacyAccounts } from './legacy';
import { createAccountUser, findUserByUsername } from './users';

type Log = {
	info: (message: string) => unknown;
	warn: (message: string) => unknown;
	error: (message: string) => unknown;
};

// better-auth 1.7's Mongo adapter doesn't create these indexes. The names and
// options match what better-auth generates (`<collection>_<field>_uidx|idx`),
// so a later version that starts creating them makes identical calls.
// Deliberately no TTL index on session.expiresAt: an index better-auth might
// add there later with different options would make every session write fail.
const INDEXES = [
	{ collection: AUTH_USER_COLLECTION, field: 'email', unique: true },
	{ collection: AUTH_USER_COLLECTION, field: 'username', unique: true },
	{ collection: AUTH_SESSION_COLLECTION, field: 'token', unique: true },
	{ collection: AUTH_SESSION_COLLECTION, field: 'userId', unique: false },
	{ collection: AUTH_ACCOUNT_COLLECTION, field: 'userId', unique: false },
	{
		collection: AUTH_VERIFICATION_COLLECTION,
		field: 'identifier',
		unique: false,
	},
] as const;

const ADMIN_USERNAME = 'admin';

function errorMessage(err: unknown): string {
	return err instanceof Error ? err.message : String(err);
}

/**
 * Prepare better-auth on boot. Throws only if better-auth can't start at all;
 * every later step logs its own failure and lets the others run.
 */
export async function prepareAuth(log: Log): Promise<void> {
	const ctx = await getAuth().$context;
	const db = getDb();
	let healthy = true;

	const step = async (name: string, run: () => Promise<void>) => {
		try {
			await run();
		} catch (err) {
			healthy = false;
			log.error(`Accounts: ${name} failed: ${errorMessage(err)}`);
		}
	};

	await step('creating indexes', async () => {
		for (const { collection, field, unique } of INDEXES) {
			await db
				.collection(collection)
				.createIndex(
					{ [field]: 1 },
					{ name: `${collection}_${field}_${unique ? 'uidx' : 'idx'}`, unique },
				);
		}
	});

	await step('removing expired sessions', async () => {
		const { deletedCount } = await db
			.collection(AUTH_SESSION_COLLECTION)
			.deleteMany({ expiresAt: { $lt: new Date() } });
		if (deletedCount > 0)
			log.info(`Accounts: removed ${deletedCount} expired session(s).`);
	});

	await step('copying legacy users', async () => {
		const report = await migrateLegacyAccounts(log);
		log.info(
			`Accounts: legacy users: ${report.total} total, ${report.migrated} copied now, ${report.alreadyMigrated} copied before, ${report.failed} failed, ${report.withoutPassword} without password.`,
		);
		if (report.failed > 0) healthy = false;
	});

	await step('ensuring the admin user', async () => {
		if (await findUserByUsername(ADMIN_USERNAME)) return;

		if (await isLegacyUserPendingMigration(ADMIN_USERNAME)) {
			healthy = false;
			log.warn(
				`Accounts: the legacy "${ADMIN_USERNAME}" user hasn't been copied yet; not creating a new one.`,
			);
			return;
		}

		const password = process.env.ADMIN_USER_PASSWORD;
		if (!password) throw new Error('ADMIN_USER_PASSWORD is not set');

		await createAccountUser({
			username: ADMIN_USERNAME,
			password,
			admin: true,
			locked: false,
		});
		log.info(`Accounts: created the "${ADMIN_USERNAME}" user.`);
	});

	await step('smoke check', async () => {
		const probe = randomUUID();
		const hash = await ctx.password.hash(probe);
		const accepts = await ctx.password.verify({ hash, password: probe });
		const rejects = !(await ctx.password.verify({
			hash,
			password: `${probe}x`,
		}));
		if (!accepts || !rejects) throw new Error('password hashing is broken');

		const admin = await findUserByUsername(ADMIN_USERNAME);
		if (!admin) {
			log.warn(`Accounts: there is no "${ADMIN_USERNAME}" user.`);
			return;
		}
		if (!(await ctx.internalAdapter.findCredentialAccount(admin.id))) {
			throw new Error(`the "${ADMIN_USERNAME}" user has no password`);
		}
	});

	if (healthy) {
		log.info('Accounts: better-auth ready, smoke OK.');
	} else {
		log.error(
			'Accounts: better-auth started with problems; see the errors above.',
		);
	}
}
