export async function register() {
	if (process.env.NEXT_RUNTIME === 'nodejs') {
		const { execSync } = await import('child_process');
		const { logger } = await import('./lib/logger');
		const mongoose = (await import('mongoose')).default;

		logger.info('Preparing app...');
		const errors: string[] = [];

		//////////////////////////////////////////////////////
		// Verify environment variables
		const requiredEnvVars = [
			'MONGODB_URI',
			'NEXT_PUBLIC_PC_SITEKEY',
			'PC_API_KEY',
			'ADMIN_USER_PASSWORD',
			'PROXY_IP_HEADER',
		];
		for (const envVar of requiredEnvVars) {
			if (!process.env[envVar]) {
				errors.push(`Environment variable ${envVar} is not set`);
			}
		}

		//////////////////////////////////////////////////////
		// Database
		try {
			await mongoose.connect(process.env.MONGODB_URI);
		} catch {
			errors.push(
				'Failed to connect to MongoDB. Please check the .env and if the database is reachable.',
			);
		}

		//////////////////////////////////////////////////////
		// Accounts (better-auth): copies legacy users, creates the admin user.
		// Never fatal: if it can't start, the site keeps serving and only
		// login and account management are unavailable.
		if (errors.length === 0) {
			if (!process.env.BETTER_AUTH_SECRET) {
				logger.error(
					'BETTER_AUTH_SECRET is not set. The site will run, but login and account management are disabled until it is set (see .env.example).',
				);
			} else {
				try {
					const { prepareAuth } = await import('./lib/auth/boot');
					await prepareAuth(logger);
				} catch (err) {
					logger.error(
						`Accounts: better-auth could not start (${err instanceof Error ? err.message : String(err)}). The site will run, but login and account management are unavailable.`,
					);
				}
			}
		}

		//////////////////////////////////////////////////////
		// Finalize
		if (errors.length > 0) {
			logger.error(
				`Preparation completed with ${errors.length} error(s). Please fix the following issues before trying again:`,
			);
			errors.forEach((error) => logger.error(error));
			process.exit(1);
		}

		logger.info('App prepared with 0 errors.');
	}
}
